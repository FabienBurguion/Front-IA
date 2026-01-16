const AZURE_PREDICTION_KEY = process.env.REACT_APP_AZURE_KEY;
const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT;
const AZURE_ML_REAL_URL = "https://api-fruit-conseil-v2.francecentral.inference.ml.azure.com/score";
const CROP_API_KEY = process.env.REACT_APP_CROP_API_KEY;

if (!AZURE_PREDICTION_KEY || !AZURE_ENDPOINT || !CROP_API_KEY) {
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

// --- IA DONNÉES SOL (Formulaire Manuel) ---
export async function predictCropRecommendation(formData) {
    // --- FIX "Missing Input Path" ---
    const dataWithFix = {
        ...formData,
        "Path": "fictive_path"
    };

    // Formatage Azure AutoML
    const columns = Object.keys(dataWithFix);
    const values = Object.values(dataWithFix);

    const payload = {
        "input_data": {
            "columns": columns,
            "index": [0],
            "data": [ values ]
        }
    };

    // --- LOGIQUE INTELLIGENTE LOCAL vs PROD ---
    let targetUrl;

    if (window.location.hostname === "localhost") {
        // En LOCAL : On utilise le proxy setupProxy.js pour éviter les soucis
        targetUrl = "/api-azure/score";
    } else {
        // EN PROD (Azure Static Web App) : Pas de proxy local !
        // On utilise un "CORS Proxy" public pour contourner la sécurité du navigateur
        // C'est l'astuce indispensable pour que ça marche sans Backend dédié.
        targetUrl = "https://corsproxy.io/?" + encodeURIComponent(AZURE_ML_REAL_URL);
    }

    console.log("Appel vers :", targetUrl);

    const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + CROP_API_KEY,
            "Content-Type": "application/json"
            // Pas de header deployment ici car trafic à 100%
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Erreur Azure Crop (${response.status}): ${txt}`);
    }

    const resultJSON = await response.json();

    // Parsing résultat
    let cropName = "Inconnu";
    if (Array.isArray(resultJSON)) cropName = resultJSON[0];
    else if (resultJSON.Results) cropName = resultJSON.Results[0];
    else if (resultJSON.predictions) cropName = resultJSON.predictions[0];
    else if (typeof resultJSON === 'string') cropName = JSON.parse(resultJSON)[0];

    if (typeof cropName === 'object') cropName = JSON.stringify(cropName);

    return [{ name: cropName, probability: 100 }];
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

// --- CHATBOT LLM (Local 8000) ---
export async function askFruitExpert(fruitName) {
    // Le backend attend : { "fruit": "Apple" }
    const response = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ fruit: fruitName })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Erreur Chatbot (${response.status}): ${text}`);
    }

    return await response.json();
}