const express = require("express");
//const client = require("prom-client"); //Metric collection
const { doSomeHeavyTask } = require("./utils");
const app = express();
const PORT = process.env.PORT || 8010;
const client = require('prom-client');
const { collectDefaultMetrics } = client;

//const collectDefaultMetrics = client.collectDefaultMetrics();

collectDefaultMetrics({ register: client.register });
app.get("/", (req, res) => {
    res.send("Hello World!"); // Optional: Add a response for the root route
});

app.get("/slow", async (req, res) => {
    try {
        const timeTaken = await doSomeHeavyTask();
        return res.json({
            status: "Success",
            message: `Heavy task completed in ${timeTaken}ms`, // Use backticks here
        });
    } catch (error) {
        return res
            .status(500)
            .json({ status: "Error", error: error.message }); // Return the actual error message
    }
});
app.get('/metrics' , async (req,res)=>{
    res.setHeader('Content-Type', client.register.contentType)
    const metrics = await client.register.metrics();
    res.send(metrics);
})
app.listen(PORT, () =>
    console.log(`Express Server Started at http://localhost:${PORT}`) // Use backticks here
);
