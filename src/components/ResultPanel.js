import React from "react";
import "./ResultPanel.css";

function ResultPanel({ result }) {
    if (!result) return null;

    const label = result.isFake ? "Fausse / Générée par une IA" : "Authentique";
    const text = result.isFake ? "artificielle" : "réelle";

    return (
        <div className="result-box">
            <div className="result-label">Résultat</div>
            <div className="result-main">
                <span className="result-percent">{result.percent}%</span>
                <span className="result-text">
          &nbsp;de chances que cette image soit{" "}
                    <span className={result.isFake ? "result-pill result-pill--fake" : "result-pill result-pill--real"}>
            {label}
          </span>
        </span>
            </div>
            <div className="result-caption">
                Votre image à {result.percent}% de chances d'être {text}, selon notre modèle d'IA.
            </div>
        </div>
    );
}

export default ResultPanel;
