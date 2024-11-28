const express = require("express");
const httpproxy = require("http-proxy");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const port = process.env.PORT || 8000;
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
            example: `api.${hostname}`,
        });
    }

    const subdomain = parts[0];
    try {
        const proxyurl = await prisma.proxy.findUnique({
            where: {
                subdomain: subdomain,
            },
        });

        if (proxyurl) {
            const redirectTo = proxyurl.AWS_link;
            const isHealthy = await checkHealth(redirectTo);
            if (!isHealthy) {
                return res
                    .status(502)
                    .json({ error: "Target server is unreachable." });
            }
            return proxy.web(req, res, {
                target: redirectTo,
                changeOrigin: true,
            });
        } else {
            return res.status(404).json({ error: "Subdomain not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
