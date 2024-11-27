const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 8001;

app.use(cors());
app.use(express.json());

// Routes
app.use("/", require("./routes/logs"));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
