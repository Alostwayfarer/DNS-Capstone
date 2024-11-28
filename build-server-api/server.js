const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");
const cors = require("cors");
const execAsync = promisify(exec);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ///////////////////AWS
const {
    ECRClient,
    ListImagesCommand,
    DescribeRegistryCommand,
    DescribeRepositoriesCommand,
    CreateRepositoryCommand,
    GetAuthorizationTokenCommand,
    ECR,
} = require("@aws-sdk/client-ecr");

const {
    ECSClient,
    CreateServiceCommand,
    RegisterTaskDefinitionCommand,
    ListClustersCommand,
    ListTaskDefinitionsCommand,
} = require("@aws-sdk/client-ecs");

const {
    ElasticLoadBalancingV2Client,
    CreateLoadBalancerCommand,
    CreateListenerCommand,
    CreateTargetGroupCommand,
} = require("@aws-sdk/client-elastic-load-balancing-v2"); // CommonJS import
// /////////////////////AWS END
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

app.get("/images", async (req, res) => {
    try {
        const input = {};
        const command = new DescribeRepositoriesCommand(input);
        const response = await ecrClient.send(command);
        console.log("res", response);
        const { repositories } = await ecrClient.send(
            new DescribeRepositoriesCommand({})
        );
        const imagePromises = repositories.map(async (repo) => {
            const images = await ecrClient.send(
                new ListImagesCommand({
                    repositoryName: repo.repositoryName,
                    filter: { tagStatus: "TAGGED" },
                })
            );
            return { repository: repo.repositoryName, images: images.imageIds };
        });

        const repositoryImages = await Promise.all(imagePromises);
        res.status(200).json({
            one: repositories,
            repositories: repositoryImages,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post("/deploy-repo", async (req, res) => {
    const { repoUrl, DeploymentName, port } = req.body;
    const tempDir = path.join(__dirname, "temp-build", DeploymentName);
    const dockerFilePath = path.join(tempDir, "Dockerfile");
    const ECRrepositoryName = `${DeploymentName}-repo`;
    const imageTag = "latest";
    try {
        var ecrResponse = null;
        var taskDefResponse = null;
        var serviceResponse = null;
        var loadBalancerResponse = null;

        console.log(
            `Starting deployment for ${DeploymentName}... ${ECRrepositoryName}`
        );
        // Create ECR repository
        const ECRinput = {
            repositoryName: ECRrepositoryName, // required

            imageTagMutability: "MUTABLE",
            imageScanningConfiguration: {
                // ImageScanningConfiguration
                scanOnPush: true,
            },
            encryptionConfiguration: {
                // EncryptionConfiguration
                encryptionType: "AES256", // required
                // kmsKey: "STRING_VALUE",
            },
        };
        console.log("-->>>>>Checking/Creating ECR repository...");
        try {
            ecrResponse = await ecrClient.send(
                new CreateRepositoryCommand(ECRinput)
            );
            console.log(">>>>>>>>ECR repository created");
        } catch (error) {
            if (error.name === "RepositoryAlreadyExistsException") {
                console.log(
                    ">>>>>>>>Repository already exists, skipping creation"
                );
            } else {
                throw error;
            }
        }
        // Clone GitHub repository
        console.log(`>>>>>>Cloning repository from ${repoUrl}...`);
        const P = await execAsync(`git clone ${repoUrl} ${tempDir}`);
        console.log("P", P);
        console.log(">>>>>Repository cloned successfully");

        // Check if Dockerfile exists, if not use a template
        if (!fs.existsSync(dockerFilePath)) {
            console.log("Dockerfile not found, creating template...");
            fs.writeFileSync(
                dockerFilePath,
                `
                FROM node:lts
                WORKDIR /app
                COPY package*.json ./ 
                RUN npm install
                COPY . .
                EXPOSE ${port}
                CMD ["npm", "run","dev"]
            `
            );
            console.log("Dockerfile template created");
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

        const listenerresponse = await elbClient.send(listernercommand);

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

        // console.log(JSON.stringify(ECSServiceinput, null, 2));
        serviceResponse = await ecsClient.send(
            new CreateServiceCommand(ECSServiceinput)
        );
        console.log("ECS service created");

        console.log("Deployment completed successfully!");

        /// proxy  "aws" niit , pdeploemtn id
        res.json({
            success: true,
            ECRrepository: ecrResponse,
            taskDefinition: taskDefResponse,
            service: serviceResponse,
            loadBalancer: loadBalancerResponse,
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
        console.log("Cleanup completed");
    }
});

// listening at
app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port} , `);
});

// app.get("/put-image", async (req, res) => {
//     try {
//         const localImageName = "alpine";
//         const imageTag = "latest";
//         const ECRrepositoryName = "my-app-repo";
//         const authCommand = new GetAuthorizationTokenCommand({});
//         const authResponse = await ecrClient.send(authCommand);
//         // Decode authorization token
//         const authToken = Buffer.from(
//             authResponse.authorizationData[0].authorizationToken,
//             "base64"
//         )
//             .toString("utf-8")
//             .split(":")[1];

//         // console.log(authToken);
//         const registryUri =
//             authResponse.authorizationData[0].proxyEndpoint.replace(
//                 "https://",
//                 ""
//             );
//         console.log(registryUri);

//         console.log("Logging in to ECR...");
//         await execAsync(`docker login -u AWS -p ${authToken} ${registryUri}`);

//         // Tag the local image
//         const remoteImageUri = `${registryUri}/${ECRrepositoryName}:${imageTag}`;
//         console.log(
//             `Tagging local image ${localImageName} as ${remoteImageUri}...`
//         );
//         await execAsync(`docker tag ${localImageName} ${remoteImageUri}`);

//         // Push the image
//         console.log("Pushing image to ECR...");
//         await execAsync(`docker push ${remoteImageUri}`);

//         console.log("Image upload completed successfully!");
//         res.status(200).json({
//             authres: authResponse,
//             authToken: authToken,
//             registryUri: registryUri,
//         });
//     } catch (e) {
//         console.log(e);
//         res.status(500).json({ error: e });
//     }
// });

// app.post("/deploy", async (req, res) => {
//     try {
//         // Register Task Definition
//         const taskDefResponse = await ecsClient.send(
//             new RegisterTaskDefinitionCommand({
//                 family: "my-task-family",
//                 containerDefinitions: [
//                     {
//                         name: "my-container",
//                         image: `${process.env.AWS_ACCOUNT_ID}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/my-repo:latest`,
//                         memory: 512,
//                         cpu: 256,
//                         essential: true,
//                         portMappings: [
//                             {
//                                 containerPort: 80,
//                                 hostPort: 80,
//                                 protocol: "tcp",
//                             },
//                         ],
//                     },
//                 ],
//                 requiresCompatibilities: ["FARGATE"],
//                 networkMode: "awsvpc",
//                 cpu: "256",
//                 memory: "512",
//             })
//         );

//         // Create ECS Service
//         const serviceResponse = await ecsClient.send(
//             new CreateServiceCommand({
//                 cluster: process.env.ECS_CLUSTER_NAME,
//                 serviceName: "my-service",
//                 taskDefinition:
//                     taskDefResponse.taskDefinition.taskDefinitionArn,
//                 desiredCount: 1,
//                 launchType: "FARGATE",
//                 networkConfiguration: {
//                     awsvpcConfiguration: {
//                         subnets: [process.env.SUBNET_ID],
//                         securityGroups: [process.env.SECURITY_GROUP_ID],
//                         assignPublicIp: "ENABLED",
//                     },
//                 },
//             })
//         );

//         res.json({
//             success: true,
//             taskDefinition: taskDefResponse.taskDefinition.taskDefinitionArn,
//             service: serviceResponse.service.serviceArn,
//         });
//     } catch (error) {
//         console.error("Deployment failed:", error);
//         res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// });
