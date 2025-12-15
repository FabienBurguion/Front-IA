import React from "react";
import "./ResultPanel.css";

function ResultPanel({ result }) {
    // result est maintenant un tableau d'objets : [{ name: "Apple", probability: 98 }, ...]
    if (!result || result.length === 0) return null;

    const mainResult = result[0]; // Le gagnant
    const otherResults = result.slice(1); // Les autres (> 2%)

    return (
        <div className="result-box">
            <div className="result-header">
                <span className="result-label">Analysis Result</span>
                {mainResult.probability < 100 && otherResults.length > 0 && (
                    <span className="result-badge">Multiple Matches</span>
                )}
            </div>

            {/* --- GAGNANT PRINCIPAL --- */}
            <div className="result-main">
                <div className="result-name">{mainResult.name}</div>
                <div className="result-confidence">
                    Confidence: <strong>{mainResult.probability}%</strong>
                </div>
            </div>

            {/* Barre de progression principale */}
            <div className="result-bar-container">
                <div
                    className="result-bar-fill"
                    style={{ width: `${mainResult.probability}%` }}
                ></div>
            </div>

            <div className="result-caption">
                Our AI is {mainResult.probability}% sure this is a <strong>{mainResult.name}</strong>.
            </div>

            {/* --- AUTRES RÉSULTATS (Si existants) --- */}
            {otherResults.length > 0 && (
                <div className="result-others">
                    <div className="result-others-title">Other possibilities detected:</div>
                    <ul className="result-list">
                        {otherResults.map((item, index) => (
                            <li key={index} className="result-list-item">
                                <span className="result-item-name">{item.name}</span>
                                <div className="result-item-right">
                                    <div className="result-item-bar-bg">
                                        <div
                                            className="result-item-bar-fill"
                                            style={{ width: `${item.probability}%` }}
                                        ></div>
                                    </div>
                                    <span className="result-item-percent">{item.probability}%</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ResultPanel;