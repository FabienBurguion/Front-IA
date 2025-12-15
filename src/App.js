import React, { useState } from "react";
import "./App.css";
// I assume these components still exist in your project
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

    if (file) {
      setFile(null);
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    }

    const trimmed = value.trim();
    if (trimmed && isValidHttpUrl(trimmed)) {
      setPreviewUrl(trimmed);
    } else {
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
        throw new Error("Please select a file or enter a valid URL.");
      }

      if (!prediction || !Array.isArray(prediction.predictions)) {
        throw new Error("Unexpected response from the Vision API.");
      }

      // 1. On trie du plus probable au moins probable
      const sortedPredictions = prediction.predictions.sort(
          (a, b) => b.probability - a.probability
      );

      // 2. On garde ceux > 2% (0.02)
      const relevantPredictions = sortedPredictions.filter(
          (p) => p.probability > 0.02
      );

      // 3. On formate les données pour l'affichage
      const formattedResults = relevantPredictions.map((p) => ({
        name: p.tagName,
        probability: Math.round(p.probability * 100),
      }));

      // Si aucun résultat > 2%, on prend quand même le meilleur (même si très bas)
      if (formattedResults.length === 0 && sortedPredictions.length > 0) {
        const best = sortedPredictions[0];
        formattedResults.push({
          name: best.tagName,
          probability: Math.round(best.probability * 100)
        });
      }

      setResult(formattedResults); // On envoie un tableau maintenant
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
          <header className="app-header">
            <h1>Fruit Detector 🍎</h1>
            <p>Upload an image or paste a URL to identify fruits and vegetables.</p>
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
            {loading ? "Analyzing Nature..." : "Identify Produce"}
          </button>

          {error && <div className="app-error">{error}</div>}

          {/* Ensure ResultPanel can handle { name, probability } props */}
          <ResultPanel result={result} />
        </div>
      </div>
  );
}

export default App;