import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import LoginPage from "./components/LoginPage";

import {
  predictImageLocal, predictImageFromUrlLocal,
  predictImageAzure, predictImageFromUrlAzure
} from "./api/predictionClient";

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
  } catch {
    return false;
  }
}

function App() {
  // États de navigation / Auth
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Est-ce qu'on est connecté ?
  const [showLoginPage, setShowLoginPage] = useState(false); // Est-ce qu'on voit le form de login ?

  // États de l'application (Image, Resultats)
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const urlIsValid = imageUrl && isValidHttpUrl(imageUrl.trim());

  // --- Gestion de la Navigation ---

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginPage(false);
    resetAnalysis(); // On vide les résultats précédents
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    resetAnalysis();
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreviewUrl(null);
    setImageUrl("");
    setResult(null);
    setError(null);
  };

  // --- Gestion de l'Image ---

  const handleImageSelected = (selectedFile) => {
    setResult(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setImageUrl("");
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    setResult(null);
    setError(null);
    if (file) {
      setFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    }
    const trimmed = value.trim();
    if (trimmed && isValidHttpUrl(trimmed)) {
      setPreviewUrl(trimmed);
    } else if (!file) {
      setPreviewUrl(null);
    }
  };

  // --- Gestion de la Prédiction ---

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let prediction;

      // LOGIQUE DE BASCULEMENT ICI :
      // Si connecté => Azure. Sinon => Local.

      if (file) {
        if (isLoggedIn) {
          prediction = await predictImageAzure(file);
        } else {
          prediction = await predictImageLocal(file);
        }
      } else if (urlIsValid) {
        if (isLoggedIn) {
          prediction = await predictImageFromUrlAzure(imageUrl);
        } else {
          prediction = await predictImageFromUrlLocal(imageUrl);
        }
      } else {
        throw new Error("Please select a file or enter a valid URL.");
      }

      if (!prediction || !Array.isArray(prediction.predictions)) {
        throw new Error("Unexpected response from the Vision API.");
      }

      // Traitement des résultats (identique pour les deux IA)
      const sortedPredictions = prediction.predictions.sort(
          (a, b) => b.probability - a.probability
      );

      const relevantPredictions = sortedPredictions.filter(
          (p) => p.probability > 0.02
      );

      const formattedResults = relevantPredictions.map((p) => ({
        name: p.tagName,
        probability: Math.round(p.probability * 100),
      }));

      if (formattedResults.length === 0 && sortedPredictions.length > 0) {
        const best = sortedPredictions[0];
        formattedResults.push({
          name: best.tagName,
          probability: Math.round(best.probability * 100)
        });
      }

      setResult(formattedResults);
    } catch (e) {
      console.error(e);
      setError(e.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="app-root">
        <div className="app-card">

          {/* Header avec Bouton Connexion/Déconnexion */}
          <header className="app-header-row">
            <div className="app-header-text">
              <h1>
                {isLoggedIn ? "Cloud Expert Analysis ☁️" : "Freshness Detector 🍎"}
              </h1>
              <p>
                {isLoggedIn
                    ? "Connected to Azure Cognitive Services."
                    : "Using Local AI Model."}
              </p>
            </div>

            <div className="app-header-actions">
              {isLoggedIn ? (
                  <button className="nav-btn logout-btn" onClick={handleLogout}>
                    Log out
                  </button>
              ) : (
                  !showLoginPage && (
                      <button className="nav-btn login-btn" onClick={() => setShowLoginPage(true)}>
                        Log in
                      </button>
                  )
              )}
            </div>
          </header>

          <hr className="divider"/>

          {/* Affichage Conditionnel : Page de Login OU App principale */}
          {showLoginPage ? (
              <LoginPage
                  onLogin={handleLoginSuccess}
                  onBack={() => setShowLoginPage(false)}
              />
          ) : (
              <>
                <ImageUploader
                    previewUrl={previewUrl}
                    onImageSelected={handleImageSelected}
                    imageUrl={imageUrl}
                    onImageUrlChange={handleImageUrlChange}
                    urlIsValid={urlIsValid}
                />

                <button
                    className={`app-button ${isLoggedIn ? 'app-button-azure' : ''}`}
                    onClick={handlePredict}
                    disabled={loading || (!file && !urlIsValid)}
                >
                  {loading ? "Analyzing..." : (isLoggedIn ? "Analyze with Cloud AI" : "Identify Produce (Local)")}
                </button>

                {error && <div className="app-error">{error}</div>}

                <ResultPanel result={result} />
              </>
          )}

        </div>
      </div>
  );
}

export default App;