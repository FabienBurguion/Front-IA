import React, { useState } from "react";
import "./App.css";
import ImageUploader from "./components/ImageUploader";
import ResultPanel from "./components/ResultPanel";
import { predictImage, predictImageFromUrl } from "./api/predictionClient";

function isValidHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "data:";
  } catch {
    return false;
  }
}

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const urlIsValid = imageUrl && isValidHttpUrl(imageUrl.trim());

  const handleImageSelected = (selectedFile) => {
    setResult(null);
    setError(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

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

    // Si l'utilisateur tape une URL, on oublie le fichier local
    if (file) {
      setFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    const trimmed = value.trim();
    if (trimmed && isValidHttpUrl(trimmed)) {
      // URL OK → on affiche l’aperçu directement
      setPreviewUrl(trimmed);
    } else {
      // URL vide ou invalide → pas d’aperçu (ou on garde celui du fichier si existait)
      if (!file) {
        setPreviewUrl(null);
      }
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let prediction;

      if (file) {
        prediction = await predictImage(file);
      } else if (urlIsValid) {
        prediction = await predictImageFromUrl(imageUrl);
      } else {
        throw new Error("Veuillez sélectionner une image ou fournir une URL valide.");
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
            <h1>Reconnaissance d’Œuvres Générées par IA</h1>
            <p>Utilisez une URL ou un fichier local pour analyser une image avec votre IA.</p>
          </header>

          <ImageUploader
              previewUrl={previewUrl}
              onImageSelected={handleImageSelected}
              imageUrl={imageUrl}
              onImageUrlChange={handleImageUrlChange}
              urlIsValid={urlIsValid}
          />

          <button
              className="app-button"
              onClick={handlePredict}
              disabled={loading || (!file && !urlIsValid)}
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
