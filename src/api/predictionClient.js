const API_URL = "/image";
const API_URL_URL = "/url";

export async function predictImage(file) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
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

export async function predictImageFromUrl(imageUrl) {
    if (!imageUrl || !imageUrl.trim()) {
        throw new Error("Veuillez fournir une URL d'image.");
    }

    const response = await fetch(API_URL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: imageUrl.trim() }),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
            `Erreur API (${response.status}) : ${text || "voir logs Docker ou CORS"}`
        );
    }

    return response.json();
}
