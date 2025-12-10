import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import { predictImage, predictImageFromUrl } from "./api/predictionClient";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
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
      setImageUrl("");
    } else {
      setPreviewUrl(null);
    }
  };

  const handleImageUrlChange = (value) => {
    setImageUrl(value);
    setError(null);
    setResult(null);
    // si on tape une URL, on oublie le fichier
    if (file) {
      setFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  const handleLoadPreviewFromUrl = () => {
    if (!imageUrl || !imageUrl.trim()) {
      setError("Veuillez renseigner une URL d'image valide.");
      return;
    }
    setError(null);
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(imageUrl.trim());
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let prediction;

      if (file) {
        prediction = await predictImage(file);
      } else if (imageUrl && imageUrl.trim()) {
        prediction = await predictImageFromUrl(imageUrl);
      } else {
        throw new Error("Veuillez sélectionner une image ou fournir une URL.");
      }

      if (!prediction || !Array.isArray(prediction.predictions)) {
        throw new Error("Réponse inattendue de l'API de prédiction.");
      }

      const best = prediction.predictions.reduce((acc, cur) =>
          cur.probability > acc.probability ? cur : acc
      );

      const percent = Math.round(best.probability * 100);
      const tag = (best.tagName || "").toLowerCase();
      const isFake = tag.includes("fake");

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
            <p>Uploadez une image ou utilisez une URL pour interroger notre IA.</p>
          </header>

          <ImageUploader
              previewUrl={previewUrl}
              onImageSelected={handleImageSelected}
              imageUrl={imageUrl}
              onImageUrlChange={handleImageUrlChange}
              onLoadPreviewFromUrl={handleLoadPreviewFromUrl}
          />

          <button
              className="app-button"
              onClick={handlePredict}
              disabled={loading || (!file && !imageUrl.trim())}
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
