const express = require("express");
const httpproxy = require("http-proxy");
const app = express();

const port = process.env.PORT || 8080;
const proxy = httpproxy.createProxy();

const http = require("http");

const checkHealth = (url) =>
    new Promise((resolve) => {
        http.get(url, (res) => resolve(res.statusCode === 200)).on(
            "error",
            () => resolve(false)
        );
    });

app.use(async (req, res) => {
    const hostname = req.hostname;
    const parts = hostname.split(".");

    console.log(parts);

    if (parts.length === 1) {
        return res.json({
            error: "give sub domain",
            example: "api.localhost:8000",
        });
    }

    if (parts[0] === "dns-bhkv" || parts[0] === "dns-1314295316.ap-south-1") {
        return res.json({
            error: "give sub domain",
            example: "api.localhost:8000",
        });
    }

    const subdomain = parts[0];
    const redirectTo =
        subdomain === "api"
            ? "http://nee-eg-lb-817668544.ap-south-1.elb.amazonaws.com"
            : "http://nee-eg-lb-817668544.ap-south-1.elb.amazonaws.com";

    const isHealthy = await checkHealth(redirectTo);
    if (!isHealthy) {
        return res.status(502).json({ error: "Target server is unreachable." });
    }
    return proxy.web(req, res, { target: redirectTo, changeOrigin: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
