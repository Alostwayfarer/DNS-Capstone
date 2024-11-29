const express = require('express');
const promClient = require('prom-client');

const app = express();
const register = new promClient.Registry();

// Collect default metrics
promClient.collectDefaultMetrics({ register });

// Define the /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3003, () => {
  console.log('App listening on port 3003');
});
