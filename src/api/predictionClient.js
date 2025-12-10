const API_URL = "/image";
const PREDICTION_KEY = process.env.REACT_APP_PREDICTION_KEY || "MA_SUPER_CLEF_LOCALE";

if (!API_URL) {
    // eslint-disable-next-line no-console
    console.warn("REACT_APP_PREDICTION_API_URL n'est pas définie dans .env");
}
if (!PREDICTION_KEY) {
    // eslint-disable-next-line no-console
    console.warn("REACT_APP_PREDICTION_KEY n'est pas définie dans .env");
}

export async function predictImage(file) {
    if (!API_URL) {
        throw new Error("L'URL de l'API de prédiction n'est pas configurée.");
    }
    if (!PREDICTION_KEY) {
        throw new Error("La Prediction-Key n'est pas configurée.");
    }

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Prediction-Key": PREDICTION_KEY,
            "Content-Type": "application/octet-stream",
        },
        body: file,
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Erreur API (${response.status}) : ${text || "voir logs Docker ou CORS"}`
        );
    }

    return response.json();
}
