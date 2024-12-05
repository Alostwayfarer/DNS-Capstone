// server.test.js
const request = require("supertest");
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const client = require("prom-client");
const prisma = new PrismaClient();
// const express = require("express");
// const app = express();
const app = require("./server");

// Mock dependencies
jest.mock("@prisma/client", () => ({
    PrismaClient: jest.fn(() => ({
        // Add mock methods as needed
    })),
}));

jest.mock("prom-client", () => ({
    collectDefaultMetrics: jest.fn(),
    register: {
        contentType: "text/plain",
        metrics: jest.fn().mockResolvedValue("mock metrics data"),
    },
}));

describe("Express Server Tests", () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("Login Endpoint", () => {
        test("POST /login should return 200 and user data if user exists by user_id", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            prisma.user.update.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({
                    user_id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                })
                .expect(200);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 200 and user data if user exists by email", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({ email: "john@example.com" })
                .expect(200);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 201 and new user data if user does not exist", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({ name: "John Doe", email: "john@example.com" })
                .expect(201);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 400 if insufficient information is provided", async () => {
            const response = await request(app)
                .post("/login")
                .send({})
                .expect(400);

            expect(response.body.error).toBe(
                "Insufficient information. Provide either user_id or both name and email"
            );
        });

        test("POST /login should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .post("/login")
                .send({ user_id: 1 })
                .expect(500);

            expect(response.body.error).toBe("Internal server error");
        });
    });

    describe("Signup Endpoint", () => {
        test("POST /signup should return 200 and updated user data if user exists", async () => {
            const mockUser = {
                user_id: 1,
                email: "john@example.com",
                password: "password",
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            prisma.user.update.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/signup")
                .send({
                    user_id: 1,
                    email: "john@example.com",
                    password: "password",
                })
                .expect(200);

            expect(response.body).toEqual(mockUser);
        });

        test("POST /signup should return 201 and new user data if user does not exist", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
                password: "password",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/signup")
                .send({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password",
                })
                .expect(201);

            expect(response.body).toEqual(mockUser);
        });

        test("POST /signup should return 400 if missing required fields", async () => {
            const response = await request(app)
                .post("/signup")
                .send({})
                .expect(400);

            expect(response.body.error).toBe("Missing required fields");
        });

        test("POST /signup should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .post("/signup")
                .send({ user_id: 1 })
                .expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("Data Endpoint", () => {
        test("GET /data should return 200 and data", async () => {
            const mockData = [
                { user_id: 1, name: "John Doe", email: "john@example.com" },
            ];
            prisma.user.findMany.mockResolvedValueOnce(mockData);

            const response = await request(app).get("/data").expect(200);

            expect(response.body).toEqual(mockData);
        });

        test("GET /data should return 500 if there is a server error", async () => {
            prisma.user.findMany.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app).get("/data").expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("User Deployment Endpoint", () => {
        test("GET /:user_id/deployment should return 200 and user deployments", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
                deployments: [],
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .get("/1/deployment")
                .expect(200);

            expect(response.body).toEqual(mockUser);
        });

        test("GET /:user_id/deployment should return 404 if user not found", async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);

            const response = await request(app)
                .get("/1/deployment")
                .expect(404);

            expect(response.body.error).toBe("User not found");
        });

        test("GET /:user_id/deployment should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .get("/1/deployment")
                .expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("User Deployment Log Endpoint", () => {
        test("GET /:user_id/:deployment_id/log should return 200 and logs", async () => {
            const response = await request(app).get("/1/1/log").expect(200);

            expect(response.body.message).toBe(
                "Logs for user: 1, deployment: 1"
            );
        });

        test("GET /:user_id/:deployment_id/log should return 500 if there is a server error", async () => {
            const response = await request(app).get("/1/1/log").expect(500);

            expect(response.body.error).toBeDefined();
        });
    });

    describe("Health Endpoint", () => {
        test("GET /health should return 200 and OK message", async () => {
            const response = await request(app).get("/health").expect(200);

            expect(response.text).toBe("OK done");
        });
    });
    describe("Login Endpoint", () => {
        test("POST /login should return 200 and user data if user exists by user_id", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            prisma.user.update.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({
                    user_id: 1,
                    name: "John Doe",
                    email: "john@example.com",
                })
                .expect(200);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 200 and user data if user exists by email", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({ email: "john@example.com" })
                .expect(200);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 201 and new user data if user does not exist", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/login")
                .send({ name: "John Doe", email: "john@example.com" })
                .expect(201);

            expect(response.body.user).toEqual(mockUser);
        });

        test("POST /login should return 400 if insufficient information is provided", async () => {
            const response = await request(app)
                .post("/login")
                .send({})
                .expect(400);

            expect(response.body.error).toBe(
                "Insufficient information. Provide either user_id or both name and email"
            );
        });

        test("POST /login should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .post("/login")
                .send({ user_id: 1 })
                .expect(500);

            expect(response.body.error).toBe("Internal server error");
        });
    });

    describe("Signup Endpoint", () => {
        test("POST /signup should return 200 and updated user data if user exists", async () => {
            const mockUser = {
                user_id: 1,
                email: "john@example.com",
                password: "password",
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);
            prisma.user.update.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/signup")
                .send({
                    user_id: 1,
                    email: "john@example.com",
                    password: "password",
                })
                .expect(200);

            expect(response.body).toEqual(mockUser);
        });

        test("POST /signup should return 201 and new user data if user does not exist", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
                password: "password",
            };
            prisma.user.findUnique.mockResolvedValueOnce(null);
            prisma.user.create.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .post("/signup")
                .send({
                    name: "John Doe",
                    email: "john@example.com",
                    password: "password",
                })
                .expect(201);

            expect(response.body).toEqual(mockUser);
        });

        test("POST /signup should return 400 if missing required fields", async () => {
            const response = await request(app)
                .post("/signup")
                .send({})
                .expect(400);

            expect(response.body.error).toBe("Missing required fields");
        });

        test("POST /signup should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .post("/signup")
                .send({ user_id: 1 })
                .expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("Data Endpoint", () => {
        test("GET /data should return 200 and data", async () => {
            const mockData = [
                { user_id: 1, name: "John Doe", email: "john@example.com" },
            ];
            prisma.user.findMany.mockResolvedValueOnce(mockData);

            const response = await request(app).get("/data").expect(200);

            expect(response.body).toEqual(mockData);
        });

        test("GET /data should return 500 if there is a server error", async () => {
            prisma.user.findMany.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app).get("/data").expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("User Deployment Endpoint", () => {
        let server;

        beforeAll(() => {
            server = app.listen(8000, () => {
                console.log(`Server running on port 8000`);
            });
        });

        afterAll(() => {
            server.close();
        });
        test("GET /:user_id/deployment should return 200 and user deployments", async () => {
            const mockUser = {
                user_id: 1,
                name: "John Doe",
                email: "john@example.com",
                deployments: [],
            };
            prisma.user.findUnique.mockResolvedValueOnce(mockUser);

            const response = await request(app)
                .get("/1/deployment")
                .expect(200);

            expect(response.body).toEqual(mockUser);
        });

        test("GET /:user_id/deployment should return 404 if user not found", async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);

            const response = await request(app)
                .get("/1/deployment")
                .expect(404);

            expect(response.body.error).toBe("User not found");
        });

        test("GET /:user_id/deployment should return 500 if there is a server error", async () => {
            prisma.user.findUnique.mockRejectedValueOnce(
                new Error("Server error")
            );

            const response = await request(app)
                .get("/1/deployment")
                .expect(500);

            expect(response.body.error).toBe("Server error");
        });
    });

    describe("User Deployment Log Endpoint", () => {
        test("GET /:user_id/:deployment_id/log should return 200 and logs", async () => {
            const response = await request(app).get("/1/1/log").expect(200);

            expect(response.body.message).toBe(
                "Logs for user: 1, deployment: 1"
            );
        });

        test("GET /:user_id/:deployment_id/log should return 500 if there is a server error", async () => {
            const response = await request(app).get("/1/1/log").expect(500);

            expect(response.body.error).toBeDefined();
        });
    });

    describe("Health Endpoint", () => {
        test("GET /health should return 200 and OK message", async () => {
            const response = await request(app).get("/health").expect(200);

            expect(response.text).toBe("OK done");
        });
    });
});
