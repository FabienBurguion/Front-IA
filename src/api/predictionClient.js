const API_URL = "/image";

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
