const express = require("express");
const httpproxy = require("http-proxy");
const app = express();

const port = process.env.PORT || 8080;
const proxy = httpproxy.createProxy();

app.use((req, res) => {
    const hostname = req.hostname;
    const parts = hostname.split(".");

    if (parts.length === 1) {
        return res.json({
            error: "give sub domain",
            example: "api.localhost:8000",
        });
    }

    const subdomain = parts[0];
    const redirectTo =
        subdomain === "api"
            ? "http://junior-demo-lb-1475581589.ap-south-1.elb.amazonaws.com/"
            : "http://frontend-baba-lb-1898478087.ap-south-1.elb.amazonaws.com/";
    return proxy.web(req, res, { target: redirectTo, changeOrigin: true });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
