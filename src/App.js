import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import { predictImage } from "./api/predictionClient";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await predictImage(file);

      if (!prediction || !Array.isArray(prediction.predictions)) {
        throw new Error("Réponse inattendue de l'API de prédiction.");
      }

      const best = prediction.predictions.reduce((acc, cur) =>
          cur.probability > acc.probability ? cur : acc
      );

      const percent = Math.round(best.probability * 100);
      const tag = (best.tagName || "").toLowerCase();
      const isFake = tag.includes("fake") || tag.includes("synthetic") || tag.includes("ai");

      setResult({
        percent,
        isFake,
      });
    } catch (e) {
      console.error(e);
      setError(e.message || "Une erreur est survenue pendant la prédiction.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="app-root">
        <div className="app-card">
          <header className="app-header">
            <h1>Détection d’images fake</h1>
            <p>
              Envoyez une image pour interroger notre IA Custom Vision.
            </p>
          </header>

          <ImageUploader
              previewUrl={previewUrl}
              onImageSelected={handleImageSelected}
          />

          <button
              className="app-button"
              onClick={handlePredict}
              disabled={!file || loading}
          >
            {loading ? "Analyse en cours..." : "Lancer la prédiction"}
          </button>

          {error && <div className="app-error">{error}</div>}

          <ResultPanel result={result} />
        </div>
      </div>
  );
}

export default App;
