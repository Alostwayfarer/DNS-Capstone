const express = require("express");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');
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

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType)
    const metrics = await client.register.metrics();
    res.send(metrics);
});


app.post('/login', async (req, res) => {
    try {
        const { user_id, name, email } = req.query;

        // Validate input
        if (!user_id || !name || !email) {
            return res.status(400).json({ error: "Missing user_id, name, or email" });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { user_id: user_id },
        });

        if (user) {
            // Update the user's name and email
            const updatedUser = await prisma.user.update({
                where: { user_id: user_id },
                data: { name: name, email: email },
            });

            res.status(200).json({
                message: "User updated successfully",
                user: {
                    user_id: updatedUser.user_id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                },
            });
        } else {
            // User not found
            res.status(404).json({ error: "User not found" });
    }
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

app.get('/:user_id/deployment', (req, res) => {
    try {
        const { user } = req.params;
        // Return user's deployment logs - implementation needed
        res.status(200).json({ message: `Deployments for user: ${user}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/:user_id/:deployment_id/log', (req, res) => {
    try {
        const { user, deployment } = req.params;
        // Return specific deployment logs - implementation needed
        res.status(200).json({ 
            message: `Logs for user: ${user}, deployment: ${deployment}` 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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
    res.status(200).send("OK done");
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
