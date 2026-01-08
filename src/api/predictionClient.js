const AZURE_PREDICTION_KEY = process.env.REACT_APP_AZURE_KEY;
const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT;

// Vérification de sécurité (optionnel mais recommandé pour débugger)
if (!AZURE_PREDICTION_KEY || !AZURE_ENDPOINT) {
    console.error("ERREUR: Les clés Azure sont manquantes dans le fichier .env");
}

// --- IA LOCALE (Docker) ---
export async function predictImageLocal(file) {
    const response = await fetch("/image", {
        method: "POST",
        headers: {
            "Content-Type": "application/octet-stream"
        },
        body: file,
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur IA Locale (${response.status}): ${text}`);
    }
    return await response.json();
}

export async function predictImageFromUrlLocal(imageUrl) {
    const response = await fetch("/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Url: imageUrl }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur IA Locale URL (${response.status}): ${text}`);
    }
    return await response.json();
}

// --- IA CLOUD (Azure) ---
export async function predictImageAzure(file) {
    const response = await fetch(`${AZURE_ENDPOINT}/image`, {
        method: "POST",
        headers: {
            "Prediction-Key": AZURE_PREDICTION_KEY,
            "Content-Type": "application/octet-stream",
        },
        body: file,
    });

    if (!response.ok) throw new Error("Erreur Azure Cloud");
    return await response.json();
}

export async function predictImageFromUrlAzure(imageUrl) {
    const response = await fetch(`${AZURE_ENDPOINT}/url`, {
        method: "POST",
        headers: {
            "Prediction-Key": AZURE_PREDICTION_KEY,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ Url: imageUrl }),
    });

    if (!response.ok) throw new Error("Erreur Azure Cloud (URL)");
    return await response.json();
}