import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import LoginPage from "./components/LoginPage";
import CropForm from "./components/CropForm";

import {
  predictImageLocal, predictImageFromUrlLocal,
  predictImageAzure, predictImageFromUrlAzure,
  predictCropRecommendation
} from "./api/predictionClient";

// CORRECTION 1 : Validation souple pour accepter les liens complexes (Le Parisien, etc.)
function isValidHttpUrl(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  const [analysisMode, setAnalysisMode] = useState('vision');

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const urlIsValid = imageUrl && isValidHttpUrl(imageUrl);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginPage(false);
    resetAnalysis();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAnalysisMode('vision');
    resetAnalysis();
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreviewUrl(null);
    setImageUrl("");
    setResult(null);
    setError(null);
  };

  const handleImageSelected = (selectedFile) => {
    setFile(selectedFile);
    // On crée une URL pour l'aperçu du fichier local
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
    setResult(null);
  };

  // CORRECTION 2 : On rétablit la logique d'affichage de l'image URL
  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    setResult(null); // On reset les résultats si l'URL change

    // Si c'est une URL valide, on l'affiche en preview
    if (isValidHttpUrl(value)) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePredictImage = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      let prediction;
      if (file) {
        prediction = isLoggedIn ? await predictImageAzure(file) : await predictImageLocal(file);
      } else if (urlIsValid) {
        prediction = isLoggedIn ? await predictImageFromUrlAzure(imageUrl) : await predictImageFromUrlLocal(imageUrl);
      } else {
        throw new Error("Choisissez une image.");
      }

      // CORRECTION 3 : Filtre > 2% et Tri
      const rawPredictions = prediction.predictions || [];

      const formattedResults = rawPredictions
          .sort((a, b) => b.probability - a.probability) // On trie du plus grand au plus petit
          .filter(p => p.probability > 0.02)             // On garde seulement si > 2%
          .map(p => ({
            name: p.tagName,
            probability: Math.round(p.probability * 100)
          }));

      setResult(formattedResults);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCropSubmit = async (formData) => {
    setLoading(true); setError(null); setResult(null);
    try {
      const results = await predictCropRecommendation(formData);
      setResult(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="app-root">
        <div className="app-card">
          <header className="app-header-row">
            <div className="app-header-text">
              <h1>{isLoggedIn ? "Expert Agronome ☁️" : "Détection Fruits 🍎"}</h1>
              <p>{isLoggedIn ? "Services Cognitifs & Analyse de Données" : "IA Locale (Docker)"}</p>
            </div>
            <div className="app-header-actions">
              {isLoggedIn ?
                  <button className="nav-btn logout-btn" onClick={handleLogout}>Déconnexion</button> :
                  !showLoginPage && <button className="nav-btn login-btn" onClick={() => setShowLoginPage(true)}>Connexion</button>
              }
            </div>
          </header>

          <hr className="divider"/>

          {showLoginPage ? (
              <LoginPage onLogin={handleLoginSuccess} onBack={() => setShowLoginPage(false)} />
          ) : (
              <>
                {isLoggedIn && (
                    <div className="mode-switcher" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                      <button
                          className={`nav-btn ${analysisMode === 'vision' ? 'login-btn' : ''}`}
                          onClick={() => { setAnalysisMode('vision'); setResult(null); }}
                      >
                        📸 Analyse Visuelle
                      </button>
                      <button
                          className={`nav-btn ${analysisMode === 'soil' ? 'login-btn' : ''}`}
                          onClick={() => { setAnalysisMode('soil'); setResult(null); }}
                      >
                        🧪 Analyse Sol (Données)
                      </button>
                    </div>
                )}

                {(!isLoggedIn || analysisMode === 'vision') ? (
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
                          onClick={handlePredictImage}
                          disabled={loading || (!file && !urlIsValid)}
                      >
                        {loading ? "Analyse en cours..." : "Identifier le fruit"}
                      </button>
                    </>
                ) : (
                    <CropForm onAnalyze={handleCropSubmit} loading={loading} />
                )}

                {error && <div className="app-error">{error}</div>}

                <ResultPanel result={result} />
              </>
          )}
        </div>
      </div>
  );
}

export default App;