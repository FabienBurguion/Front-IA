const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/image",
        createProxyMiddleware({
            target: process.env.REACT_APP_API_PROXY || "http://localhost",
            changeOrigin: true,
        })
    );

    app.use(
        "/url",
        createProxyMiddleware({
            target: process.env.REACT_APP_API_PROXY || "http://localhost",
            changeOrigin: true,
        })
    );

    app.use(
        "/api-azure",
        createProxyMiddleware({
            target: "https://api-fruit-conseil-v2.francecentral.inference.ml.azure.com",
            changeOrigin: true,
            pathRewrite: { "^/api-azure": "" },
            secure: false,
        })
    );
};
