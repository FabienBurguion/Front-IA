import React, { useState } from "react";
import "./CropForm.css";

function CropForm({ onAnalyze, loading }) {
    const [formData, setFormData] = useState({
        N: 90,
        P: 42,
        K: 43,
        temperature: 20.8,
        humidity: 82.0,
        ph: 6.5,
        rainfall: 202.9
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: parseFloat(e.target.value)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAnalyze(formData);
    };

    return (
        <form className="crop-form" onSubmit={handleSubmit}>
            <h3>🧪 Données du Sol (Analyse Agronome)</h3>
            <div className="form-grid">
                <div className="input-group">
                    <label>Azote (N)</label>
                    <input type="number" name="N" value={formData.N} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Phosphore (P)</label>
                    <input type="number" name="P" value={formData.P} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Potassium (K)</label>
                    <input type="number" name="K" value={formData.K} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Température (°C)</label>
                    <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Humidité (%)</label>
                    <input type="number" step="0.1" name="humidity" value={formData.humidity} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>pH</label>
                    <input type="number" step="0.1" name="ph" value={formData.ph} onChange={handleChange} />
                </div>
                <div className="input-group">
                    <label>Pluviométrie (mm)</label>
                    <input type="number" step="0.1" name="rainfall" value={formData.rainfall} onChange={handleChange} />
                </div>
            </div>

            <button type="submit" className="app-button app-button-azure" disabled={loading}>
                {loading ? "Calcul en cours..." : "Recommander une culture"}
            </button>
        </form>
    );
}

export default CropForm;