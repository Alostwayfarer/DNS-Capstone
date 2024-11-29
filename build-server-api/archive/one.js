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
// ----------------------------------------------------/

// Clone GitHub repository
// console.log(`>>>>>>Cloning repository from ${repoUrl}...`);
// const P = await execAsync(`git clone ${repoUrl} ${tempDir}`);
// console.log("P", P);
// console.log(">>>>>Repository cloned successfully");

// Clone GitHub Repository
