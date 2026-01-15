import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import LoginPage from "./components/LoginPage";
import CropForm from "./components/CropForm";
import ChatPanel from "./components/ChatPanel";

import {
  predictImageLocal, predictImageFromUrlLocal,
  predictImageAzure, predictImageFromUrlAzure,
  predictCropRecommendation,
  askFruitExpert
} from "./api/predictionClient";

// Validation URL souple
function isValidHttpUrl(value) {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

function App() {
  // --- ÉTATS GLOBAUX ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [analysisMode, setAnalysisMode] = useState('vision'); // 'vision' ou 'soil'

  // --- ÉTATS VISION (IMAGE) ---
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // --- ÉTATS CHATBOT ---
  const [chatData, setChatData] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  const urlIsValid = imageUrl && isValidHttpUrl(imageUrl);

  // --- HANDLERS AUTH ---
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

  // Remise à zéro complète
  const resetAnalysis = () => {
    setFile(null);
    setPreviewUrl(null);
    setImageUrl("");
    setResult(null);
    setError(null);
    // Reset Chat
    setChatData(null);
    setChatError(null);
  };

  // --- HANDLERS IMAGE ---
  const handleImageSelected = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile) setPreviewUrl(URL.createObjectURL(selectedFile));
    else setPreviewUrl(null);

    setResult(null);
    setChatData(null);
  };

  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    setResult(null);
    setChatData(null);

    if (isValidHttpUrl(value)) setPreviewUrl(value);
    else setPreviewUrl(null);
  };

  // --- ACTION : IDENTIFIER FRUIT (VISION) ---
  const handlePredictImage = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setChatData(null);

    try {
      let prediction;
      if (file) {
        prediction = isLoggedIn ? await predictImageAzure(file) : await predictImageLocal(file);
      } else if (urlIsValid) {
        prediction = isLoggedIn ? await predictImageFromUrlAzure(imageUrl) : await predictImageFromUrlLocal(imageUrl);
      } else {
        throw new Error("Choisissez une image.");
      }

      const rawPredictions = prediction.predictions || [];
      const formattedResults = rawPredictions
          .sort((a, b) => b.probability - a.probability)
          .filter(p => p.probability > 0.02)
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

  // --- ACTION : ANALYSE SOL (CROP) ---
  const handleCropSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const results = await predictCropRecommendation(formData);
      // On s'assure que results est bien au format attendu par ResultPanel
      setResult(results);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION : CHATBOT (OLLAMA) ---
  const handleAskExperts = async () => {
    if (!result || result.length === 0) return;

    const fruitName = result[0].name;
    setChatLoading(true);
    setChatError(null);

    try {
      const data = await askFruitExpert(fruitName);
      setChatData(data);
    } catch (e) {
      setChatError(e.message);
    } finally {
      setChatLoading(false);
    }
  };

  return (
      <div className="app-root">
        <div className="app-card">

          {/* HEADER */}
          <header className="app-header-row">
            <div className="app-header-text">
              <h1>{isLoggedIn ? "Expert Agronome ☁️" : "Détection Fruits 🍎"}</h1>
              <p>{isLoggedIn ? "Services Cognitifs & Analyse de Données" : "IA Locale (Docker) & Llama 3.2"}</p>
            </div>

            <div className="app-header-actions">
              {isLoggedIn ? (
                  <button className="nav-btn logout-btn" onClick={handleLogout}>Déconnexion</button>
              ) : (
                  !showLoginPage && (
                      <button className="nav-btn login-btn" onClick={() => setShowLoginPage(true)}>Connexion</button>
                  )
              )}
            </div>
          </header>

          <hr className="divider"/>

          {/* PAGE LOGIN OU APP */}
          {showLoginPage ? (
              <LoginPage onLogin={handleLoginSuccess} onBack={() => setShowLoginPage(false)} />
          ) : (
              <>
                {/* MENU ONGLETS (SI CONNECTÉ) */}
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

                {/* --- BLOC D'ENTRÉE (VISION OU SOL) --- */}
                {(!isLoggedIn || analysisMode === 'vision') ? (
                    /* MODE VISION */
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
                    /* MODE SOL */
                    <CropForm onAnalyze={handleCropSubmit} loading={loading} />
                )}

                {/* --- RÉSULTATS & ERREURS (COMMUN À TOUS LES MODES) --- */}
                {/* C'est ici que j'ai corrigé : le panel est sorti du bloc conditionnel */}

                {error && <div className="app-error">{error}</div>}

                <ResultPanel result={result} />

                {/* --- CHATBOT (Uniquement si Non Connecté + Résultat Vision) --- */}
                {!isLoggedIn && result && result.length > 0 && analysisMode === 'vision' && !chatData && (
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <button
                          className="app-button"
                          style={{ background: '#4f46e5', marginTop: '10px' }}
                          onClick={handleAskExperts}
                          disabled={chatLoading}
                      >
                        {chatLoading ? "Connexion à Ollama..." : `💬 Demander infos sur "${result[0].name}"`}
                      </button>
                    </div>
                )}

                {/* AFFICHER LE CHAT PANEL */}
                <ChatPanel chatData={chatData} loading={chatLoading} error={chatError} />

              </>
          )}
        </div>
      </div>
  );
}

export default App;