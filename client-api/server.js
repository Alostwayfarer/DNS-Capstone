const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const client = require("prom-client"); //Metric collection
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
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});

// app.post("/login", async (req, res) => {
//     try {
//         const { user_id, name, email } = req.body;

//         // Check if user exists
//         const user = await prisma.user.findUnique({
//             where: { user_id: user_id },
//         });

//         const userwithemail = await prisma.user.findUnique({
//             where: { email: email },
//         });

//         if (user) {
//             // Update the user's name and email
//             const updatedUser = await prisma.user.update({
//                 where: { user_id: user_id },
//                 data: { name: name, email: email },
//             });

//             res.status(200).json({
//                 message: "User updated successfully",
//                 user: {
//                     user_id: updatedUser.user_id,
//                     name: updatedUser.name,
//                     email: updatedUser.email,
//                 },
//             });
//         } else if (userwithemail) {
//             // User found
//             res.status(200).json({
//                 message: "User found",
//                 user: {
//                     user_id: userwithemail.user_id,
//                     name: userwithemail.name,
//                     email: userwithemail.email,
//                 },
//             });
//         } else {
//             // User not found
//             res.status(404).json({ error: "User not found" });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

app.post("/login", async (req, res) => {
    try {
        const { user_id, name, email } = req.body;

        // Case 1: Check by user_id if provided
        if (user_id) {
            const userById = await prisma.user.findUnique({
                where: { user_id: user_id },
            });

            if (userById) {
                // Update existing user if name or email changed
                const updatedUser = await prisma.user.update({
                    where: { user_id: user_id },
                    data: {
                        name: name || userById.name,
                        email: email || userById.email,
                    },
                });

                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        user_id: updatedUser.user_id,
                        name: updatedUser.name,
                        email: updatedUser.email,
                    },
                });
            }
        }

        // Case 2: Check by email
        if (email) {
            const userByEmail = await prisma.user.findUnique({
                where: { email: email },
            });

            if (userByEmail) {
                return res.status(200).json({
                    message: "Login successful",
                    user: {
                        user_id: userByEmail.user_id,
                        name: userByEmail.name,
                        email: userByEmail.email,
                    },
                });
            }
        }

        // Case 3: Create new user if name and email provided
        if (name && email) {
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                },
            });

            return res.status(201).json({
                message: "New user created",
                user: {
                    user_id: newUser.user_id,
                    name: newUser.name,
                    email: newUser.email,
                },
            });
        }

        // No matching cases
        return res.status(400).json({
            error: "Insufficient information. Provide either user_id or both name and email",
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
});

app.post("/signup", async (req, res) => {
    const { user_id, name, email } = req.body;

    try {
        if (user_id) {
            // Update existing user
            const user = await prisma.user.findUnique({
                where: { user_id: user_id },
            });

            if (user) {
                const updatedUser = await prisma.user.update({
                    where: { user_id: user_id },
                    data: {
                        email: email,
                        password: req.body.password, // Ensure password is provided in the request
                    },
                });

                res.status(200).json({
                    user_id: updatedUser.user_id,
                    email: updatedUser.email,
                    password: updatedUser.password,
                });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        } else if (name && email) {
            // Create new user
            const newUser = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: req.body.password, // Ensure password is provided in the request
                },
            });

            res.status(201).json({
                user_id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
            });
        } else {
            res.status(400).json({ error: "Missing required fields" });
        }
    } catch (error) {
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
app.get("/:user_id/deployment", async (req, res) => {
    try {
        const { user_id } = req.params;

        const userWithDeployments = await prisma.user.findUnique({
            where: {
                user_id: user_id,
            },
            include: {
                deployments: {
                    include: {
                        Proxy: true,
                    },
                },
            },
        });

        if (!userWithDeployments) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.status(200).json({
            user_id: userWithDeployments.user_id,
            name: userWithDeployments.name,
            email: userWithDeployments.email,
            deployments: userWithDeployments.deployments,
        });
    } catch (error) {
        console.error("Error fetching deployments:", error);
        res.status(500).json({
            error: "Internal server error",
            details: error.message,
        });
    }
});
app.get("/:user_id/:deployment_id/log", (req, res) => {
    try {
        const { user, deployment } = req.params;
        // Return specific deployment logs - implementation needed
        res.status(200).json({
            message: `Logs for user: ${user}, deployment: ${deployment}`,
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
