const express = require("express");
const router = express.Router();
const { getCloudWatchLogs } = require("../services/cloudwatchlogs");

router.get("/logs/:repoName", async (req, res) => {
    try {
        const { repoName } = req.params;
        const logGroupName = `/ecs/${repoName}-logs`;
        const logsData = await getCloudWatchLogs(logGroupName);
        res.json(logsData);
    } catch (error) {
        console.error("Error in logs route:", error);
        res.status(500).json({ error: "Failed to fetch logs" });
    }
});

module.exports = router;
