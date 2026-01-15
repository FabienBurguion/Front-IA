const AZURE_PREDICTION_KEY = process.env.REACT_APP_AZURE_KEY;
const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT;
const CROP_API_URL = process.env.REACT_APP_CROP_API_URL;
const CROP_API_KEY = process.env.REACT_APP_CROP_API_KEY;

if (!AZURE_PREDICTION_KEY || !AZURE_ENDPOINT || !CROP_API_URL || !CROP_API_KEY) {
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
    const dataWithFix = {
        ...formData,
        "Path": "fictive_path"
    };

    const columns = Object.keys(dataWithFix);
    const values = Object.values(dataWithFix);

    const payload = {
        "input_data": {
            "columns": columns,
            "index": [0],
            "data": [ values ]
        }
    };

    console.log("Envoi corrigé vers :", CROP_API_URL);

    const response = await fetch(CROP_API_URL, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + CROP_API_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Erreur Azure Crop (${response.status}): ${txt}`);
    }

    const resultJSON = await response.json();

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