const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const AWS = require("aws-sdk");

const app = express();
app.use(express.json());
