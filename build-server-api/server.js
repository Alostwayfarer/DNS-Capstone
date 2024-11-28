const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const client = require("prom-client"); //Metric collection

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register }); //Collecting default metrics

// At the top of the file
const { DeploymentType } = require("@prisma/client");
const { randomUUID } = require("crypto");

// ///////////////////AWS
const {
    ECRClient,
    DescribeRegistryCommand,
    GetAuthorizationTokenCommand,
} = require("@aws-sdk/client-ecr");

const {
    ECSClient,
    CreateServiceCommand,
    RegisterTaskDefinitionCommand,
    ListClustersCommand,
} = require("@aws-sdk/client-ecs");

const {
    ElasticLoadBalancingV2Client,
    CreateLoadBalancerCommand,
    CreateListenerCommand,
    CreateTargetGroupCommand,
} = require("@aws-sdk/client-elastic-load-balancing-v2"); // CommonJS import
// /////////////////////AWS END

///////////// my files

const { createECRRepository, cloneRepository } = require("./services/services");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

const awsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
};

const ecrClient = new ECRClient(awsCredentials);
// Configure ECS Client
const ecsClient = new ECSClient(awsCredentials);
// configure ELB client
const elbClient = new ElasticLoadBalancingV2Client(awsCredentials);

//metrics
app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    res.send(metrics);
});

const validateAndParseDeploymentType = (type) => {
    // Convert to uppercase to match enum format
    const normalizedType = type.toUpperCase();

    // Check if valid deployment type
    if (!Object.values(DeploymentType).includes(normalizedType)) {
        throw new Error(
            `Invalid deployment type: ${type}. Must be one of: ${Object.values(
                DeploymentType
            ).join(", ")}`
        );
    }

    return normalizedType;
};

// Create User
app.post("/users", async (req, res) => {
    try {
        const { name } = req.body;
        const user = await prisma.user.create({
            data: { name },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Deployment
app.post("/deployments", async (req, res) => {
    try {
        const { github_link, subdomain, deployment_type, userId } = req.body;
        const deployment = await prisma.deployment.create({
            data: {
                github_link,
                subdomain,
                deployment_type,
                userId,
            },
        });
        res.json(deployment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Proxy
app.post("/proxies", async (req, res) => {
    try {
        const { deployment_id, subdomain, AWS_link } = req.body;
        const proxy = await prisma.proxy.create({
            data: {
                deployment_id,
                subdomain,
                AWS_link,
            },
        });
        res.json(proxy);
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
// healthroute
app.get("/health", async (req, res) => {
    try {
        // Check ECR
        console.log("Checking ECR...");
        const ecrCommand = new DescribeRegistryCommand({});
        const ecrResponse = await ecrClient.send(ecrCommand);

        // Check ECS
        const ecsCommand = new ListClustersCommand({});
        const ecsResponse = await ecsClient.send(ecsCommand);
        //   console.log("Checking ECR...");
        res.status(200).json({
            status: "OK",
            ecr: ecrResponse,
            ecs: ecsResponse,
        });
    } catch (error) {
        res.status(500).json({ status: "Error", message: error.message });
    }
});

app.post("/deploy-repo", async (req, res) => {
    const { repoUrl, DeploymentName, buildType, userId, CMD, port } = req.body;

    const tempDir = path.join(__dirname, "temp-build", DeploymentName);
    // const dockerFilePath = path.join(tempDir, "Dockerfile");
    const ECRrepositoryName = `${DeploymentName}-repo`;
    const imageTag = "latest";
    let deleteimg;
    try {
        const validatedDeploymentType =
            validateAndParseDeploymentType(deploymentType);

        var ecrResponse = null;
        var taskDefResponse = null;
        var serviceResponse = null;
        var loadBalancerResponse = null;

        console.log(`Starting deployment for ${DeploymentName}`);
        ecrResponse = await createECRRepository(ECRrepositoryName);
        await cloneRepository(repoUrl, tempDir);
        // sfsdfsd

        let dockerFileName;
        let defaultPort;
        let defaultCMD;
        switch (buildType.toUpperCase()) {
            case "FRONTEND":
                dockerFileName = "Dockerfile";
                defaultPort = 80;
                defaultCMD = ["npm", "run", "dev"];
                break;
            case "BACKEND":
                dockerFileName = "Dockerfile";
                defaultPort = 3000;
                defaultCMD = ["npm", "run", "dev"];
                break;
            case "PYTHON":
                dockerFileName = "Dockerfile";
                defaultPort = 3000;
                defaultCMD = ["python", "app.py"];
                break;
            default:
                return res.status(400).json({ error: "Invalid buildType" });
        }

        console.log("default value=>", dockerFileName, defaultPort, defaultCMD);

        const dockerFilePath = path.join(tempDir, dockerFileName);

        // Create Dockerfile based on buildType if it doesn't exist
        if (!fs.existsSync(dockerFilePath)) {
            console.log("Dockerfile not found, creating template...");

            let dockerContent;
            let finalCMD = defaultCMD;
            if (CMD) {
                finalCMD = CMD.split(" ");
            }

            if (buildType.toUpperCase() === "FRONTEND") {
                dockerContent = `
                    FROM node:lts
                    WORKDIR /app
                    COPY package*.json ./
                    RUN npm install
                    COPY . .
                    EXPOSE ${port || defaultPort}
                    CMD ${JSON.stringify(finalCMD)}
                `;
            } else if (buildType.toUpperCase() === "BACKEND") {
                dockerContent = `
                FROM node:lts
                WORKDIR /app
                COPY package*.json ./
                RUN npm install
                COPY . .
                EXPOSE ${port || defaultPort}
                CMD ${JSON.stringify(finalCMD)}
                `;
            } else if (buildType.toUpperCase() === "PYTHON") {
                dockerContent = `
                    FROM python:3.9
                    WORKDIR /app
                    COPY requirements.txt ./
                    RUN pip install --no-cache-dir -r requirements.txt
                    COPY . .
                    EXPOSE ${port || defaultPort}
                    CMD ${JSON.stringify(finalCMD)}
                `;
            }

            console.log("dockerContent", dockerContent);
            fs.writeFileSync(dockerFilePath, dockerContent.trim());
            console.log(`${dockerFileName} created`);
        } else {
            console.log("Dockerfile found");
            const dockerFileContent = fs.readFileSync(dockerFilePath, "utf-8");
            console.log("Existing Dockerfile content:\n", dockerFileContent);
        }

        // Build Docker image
        console.log("Building Docker image...");
        const pp = await execAsync(
            `docker build -t ${ECRrepositoryName} ${tempDir}`
        );
        console.log("pp", pp);
        console.log("Docker image built successfully");

        // Authenticate and push Docker image to ECR
        console.log("Getting ECR authentication token...");
        const authCommand = new GetAuthorizationTokenCommand({});
        const authResponse = await ecrClient.send(authCommand);
        const authToken = Buffer.from(
            authResponse.authorizationData[0].authorizationToken,
            "base64"
        )
            .toString("utf-8")
            .split(":")[1];
        const registryUri =
            authResponse.authorizationData[0].proxyEndpoint.replace(
                "https://",
                ""
            );
        console.log("ECR authentication successful");

        console.log("Logging into Docker...");
        await execAsync(`docker login -u AWS -p ${authToken} ${registryUri}`);
        const remoteImageUri = `${registryUri}/${ECRrepositoryName}:${imageTag}`;
        deleteimg = remoteImageUri;

        console.log("Tagging Docker image...");
        console.log(
            `-----> docker tag ${ECRrepositoryName}:${imageTag} ${remoteImageUri}`
        );
        await execAsync(
            `docker tag ${ECRrepositoryName}:${imageTag} ${remoteImageUri}`
        );

        console.log("Pushing image to ECR...");
        console.log(`-----> docker push ${remoteImageUri}`);
        await execAsync(`docker push ${remoteImageUri}`);
        console.log("Image pushed to ECR successfully");

        // Register Task Definition
        console.log("Registering ECS task definition...");

        const ECStaskinput = {
            // RegisterTaskDefinitionRequest
            family: `${DeploymentName}-taskdef`, // required
            taskRoleArn: process.env.TASK_ROLE_ARN,
            executionRoleArn: process.env.TASK_ROLE_ARN,
            networkMode: "awsvpc",
            containerDefinitions: [
                // ContainerDefinitions // required
                {
                    // ContainerDefinition
                    name: `${DeploymentName}-container`, // required
                    image: remoteImageUri, // required
                    cpu: 0,

                    portMappings: [
                        // PortMappingList
                        {
                            // PortMapping
                            name: `${DeploymentName}-container-port`, // required
                            containerPort: port, // required
                            hostPort: port,
                            protocol: "tcp",
                            appProtocol: "http",
                        },
                    ],
                    essential: true,

                    environment: [
                        // EnvironmentVariables
                        {
                            // KeyValuePair
                            name: "PORT",
                            value: `${port}`,
                        },
                    ],

                    logConfiguration: {
                        logDriver: "awslogs", // required
                        options: {
                            "awslogs-group": `/ecs/${DeploymentName}-logs`,
                            mode: "non-blocking",
                            "awslogs-create-group": "true",
                            "max-buffer-size": "25m",
                            "awslogs-region": "ap-south-1",
                            "awslogs-stream-prefix": "ecs",
                        },
                    },
                },
            ],

            requiresCompatibilities: [
                // CompatibilityList
                "FARGATE",
            ],
            cpu: "512",
            memory: "1024",

            runtimePlatform: {
                cpuArchitecture: "X86_64",
                operatingSystemFamily: "LINUX",
            },
        };
        console.log(JSON.stringify(ECStaskinput, null, 2));
        taskDefResponse = await ecsClient.send(
            new RegisterTaskDefinitionCommand(ECStaskinput)
        );
        console.log(taskDefResponse);
        console.log("Task definition registered");

        console.log(JSON.stringify(taskDefResponse, null, 2));

        // Create Load Balancer
        console.log("Creating load balancer...");

        const laodBalancerinput = {
            Name: `${DeploymentName}-lb`,
            Subnets: process.env.SUBNET_IDS.split(","),
            SecurityGroups: [process.env.SECURITY_GROUP_ID],
            Scheme: "internet-facing",
            Type: "application",
        };
        const loadBalancercomman = new CreateLoadBalancerCommand(
            laodBalancerinput
        );

        loadBalancerResponse = await elbClient.send(loadBalancercomman);
        console.log("Load balancer created");

        // create task group
        console.log("Creating target group...");

        const targetGroupinput = {
            Name: `${DeploymentName}-tg`,
            Protocol: "HTTP",
            Port: 80,
            VpcId: process.env.VPC_ID,
            TargetType: "ip",
        };

        const targetGroupCommand = new CreateTargetGroupCommand(
            targetGroupinput
        );
        const targetGroupResponse = await elbClient.send(targetGroupCommand);

        console.log("output", targetGroupResponse);
        console.log("Target group created");

        // Create Listener

        console.log("Creating listener...");

        const listenerinput = {
            LoadBalancerArn:
                loadBalancerResponse.LoadBalancers[0].LoadBalancerArn,
            Protocol: "HTTP",
            Port: 80,
            DefaultActions: [
                {
                    Type: "forward",
                    TargetGroupArn:
                        targetGroupResponse.TargetGroups[0].TargetGroupArn,
                },
            ],
        };
        const listernercommand = new CreateListenerCommand(listenerinput);

        await elbClient.send(listernercommand);

        // console.log("Listener---", listenerresponse);
        console.log("Listener created");

        // Create ECS Service
        console.log("Creating ECS service...");
        const ECSServiceinput = {
            // CreateServiceRequest
            cluster: process.env.ECS_CLUSTER_NAME,
            serviceName: `${DeploymentName}-service`, // required
            taskDefinition: taskDefResponse.taskDefinition.taskDefinitionArn, // something i decice
            loadBalancers: [
                {
                    targetGroupArn:
                        targetGroupResponse.TargetGroups[0].TargetGroupArn, // required
                    // loadBalancerName: `${DeploymentName}-lb`, // required
                    containerName: `${DeploymentName}-container`, // Must match the container name in your task definition
                    containerPort: port, // Ensure this is a number
                },
            ],

            desiredCount: 2,
            // clientToken: "STRING_VALUE",

            capacityProviderStrategy: [
                // confused
                // CapacityProviderStrategy
                {
                    // CapacityProviderStrategyItem
                    capacityProvider: "FARGATE", // required
                    weight: 1,
                    base: 0,
                },
            ],
            platformVersion: "LATEST",
            // role: "STRING_VALUE",
            deploymentConfiguration: {
                // DeploymentConfiguration
                deploymentCircuitBreaker: {
                    // DeploymentCircuitBreaker
                    enable: true, // required
                    rollback: true, // required
                },
                maximumPercent: 200,
                minimumHealthyPercent: 100,
                alarms: {
                    rollback: false, // required
                    enable: false, // required
                },
            },

            networkConfiguration: {
                // NetworkConfiguration
                awsvpcConfiguration: {
                    // AwsVpcConfiguration
                    subnets: process.env.SUBNET_IDS.split(","),
                    securityGroups: [process.env.SECURITY_GROUP_ID],
                    assignPublicIp: "ENABLED",
                },
            },
            // healthCheckGracePeriodSeconds: Number("int"),
            deploymentController: {
                // DeploymentController
                type: "ECS", // required
            },
        };
        console.log("---------------------------<>---------------------------");

        // Validate deployment type
        if (!Object.values(DeploymentType).includes(deploymentType)) {
            throw new Error(
                `Invalid deployment type. Must be one of: ${Object.values(
                    DeploymentType
                ).join(", ")}`
            );
        }

        // console.log(JSON.stringify(ECSServiceinput, null, 2));
        serviceResponse = await ecsClient.send(
            new CreateServiceCommand(ECSServiceinput)
        );
        console.log("ECS service created");

        console.log("Deployment completed successfully!");

        let user;
        if (userId) {
            user = await prisma.user.findUnique({ where: { user_id: userId } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
        } else {
            user = await prisma.user.create({
                data: {
                    name: "",
                },
            });
        }

        const deployment = await prisma.deployment.create({
            data: {
                github_link: repoUrl,

                subdomain: DeploymentName,
                deployment_type: buildType.toUpperCase(),
                Status: "DEPLOYED",
                userId: user.user_id,
                Proxy: {
                    create: {
                        subdomain: DeploymentName,
                        AWS_link: loadBalancerResponse.LoadBalancers[0].DNSName,
                    },
                },
            },
        });

        /// proxy  "aws" niit , deveoplet id
        res.json({
            success: true,
            deployment: deployment,

            loadBalancer: loadBalancerResponse.LoadBalancers[0].DNSName,

            ECRrepository: ecrResponse,
            taskDefinition: taskDefResponse,
            service: serviceResponse,
            targetGroup: targetGroupResponse.TargetGroups[0].TargetGroupArn,
        });
    } catch (error) {
        console.error("Deployment failed:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    } finally {
        console.log("Cleaning up temporary files...");
        await execAsync(`rm -rf ${tempDir}`);
        await execAsync(`docker rmi ${ECRrepositoryName}:${imageTag}`);
        await execAsync(`docker rmi ${deleteimg}`);
        console.log("Cleanup completed");
    }
});

// listening at
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port} , `);
});
