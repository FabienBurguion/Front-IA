const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    app.use(
        "/image",
        createProxyMiddleware({
            target: process.env.REACT_APP_API_PROXY || "http://localhost",
            changeOrigin: true,
        })
    );
};
