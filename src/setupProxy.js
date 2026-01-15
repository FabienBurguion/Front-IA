const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    // 1. Docker Local (Images) - Port 5000
    app.use(
        ["/image", "/url"], // On peut grouper les routes
        createProxyMiddleware({
            target: "http://localhost:5000",
            changeOrigin: true,
        })
    );

    // 2. Azure ML (Cloud)
    app.use(
        "/api-azure",
        createProxyMiddleware({
            target: "https://api-fruit-conseil-v2.francecentral.inference.ml.azure.com",
            changeOrigin: true,
            pathRewrite: { "^/api-azure": "" },
            secure: false,
        })
    );

    // 3. Chatbot FastAPI (Ollama) - Port 8000
    app.use(
        "/chat",
        createProxyMiddleware({
            target: "http://localhost:8000",
            changeOrigin: true,
        })
    );
};