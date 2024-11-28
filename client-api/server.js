const express = require("express");
const cors = require("cors");
require("dotenv").config();
const client = require("prom-client"); //Metric collection
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT || 8001;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register }); //Collecting default metrics

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});

app.use(cors());
app.use(express.json());

// Routes
app.use("/", require("./routes/logs"));

// Get all data with relationships
app.get("/data", async (req, res) => {
    try {
        const data = await prisma.user.findMany({
            include: {
                deployments: {
                    include: {
                        Proxy: true,
                    },
                },
            },
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
