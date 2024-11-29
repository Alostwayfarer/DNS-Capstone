const express = require("express");
const cors = require("cors");
require("dotenv").config();
const client = require("prom-client") //Metric collection 

const app = express();
const port = process.env.PORT || 8001;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({register: client.register}); //Collecting default metrics

app.use(cors());
app.use(express.json());

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType)
    const metrics = await client.register.metrics();
    res.send(metrics);
});

// Routes
app.use("/", require("./routes/logs"));

// Get all logs
app.get('/login', (req, res) => {
    try {
        // Return all logs - implementation needed
        res.status(200).json({ message: "All logs endpoint" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get logs for specific user's deployments
app.get('/:user_id/deployment', (req, res) => {
    try {
        const { user } = req.params;
        // Return user's deployment logs - implementation needed
        res.status(200).json({ message: `Deployments for user: ${user}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get logs for specific deployment
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

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
