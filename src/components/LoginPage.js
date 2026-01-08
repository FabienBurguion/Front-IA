import React, { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onLogin, onBack }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        // Identifiants en dur
        if (username === "admin" && password === "admin") {
            onLogin();
        } else {
            setError("Identifiants incorrects (essayez admin/admin)");
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Connexion Expert 🌿</h2>
                <p className="login-subtitle">Accédez au modèle Cloud haute précision</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Utilisateur</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ex: admin"
                        />
                    </div>

                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    <div className="login-actions">
                        <button type="button" className="btn-secondary" onClick={onBack}>
                            Annuler
                        </button>
                        <button type="submit" className="btn-primary">
                            Se connecter
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;