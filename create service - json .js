import { ECSClient, CreateServiceCommand } from "@aws-sdk/client-ecs"; // ES Modules import
// const { ECSClient, CreateServiceCommand } = require("@aws-sdk/client-ecs"); // CommonJS import
const client = new ECSClient(config);
const input = {
    // CreateServiceRequest
    cluster: process.env.ECS_CLUSTER_NAME,
    serviceName: "user webiste name ", // required
    taskDefinition: "STRING_VALUE", // something i decice
    loadBalancers: [
        // LoadBalancers
        {
            // LoadBalancer
            targetGroupArn: "STRING_VALUE",
            loadBalancerName: "STRING_VALUE",
            containerName: "STRING_VALUE",
            containerPort: Number("int"),
        },
    ],
    // serviceRegistries: [
    //     // ServiceRegistries
    //     {
    //         // ServiceRegistry
    //         registryArn: "STRING_VALUE",
    //         port: Number("int"),
    //         containerName: "STRING_VALUE",
    //         containerPort: Number("int"),
    //     },
    // ],
    desiredCount: 3,
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
            // DeploymentAlarms
            // alarmNames: [
            //     // StringList // required
            //     "STRING_VALUE",
            // ],
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
    // placementStrategy: [
    //     // PlacementStrategies
    //     {
    //         // PlacementStrategy
    //         type: "random" || "spread" || "binpack",
    //         field: "STRING_VALUE",
    //     },
    // ],
    // enableExecuteCommand: true || false,
};
const command = new CreateServiceCommand(input);
const response = await client.send(command);
// { // CreateServiceResponse
//   service: { // Service
//     serviceArn: "STRING_VALUE",
//     serviceName: "STRING_VALUE",
//     clusterArn: "STRING_VALUE",
//     loadBalancers: [ // LoadBalancers
//       { // LoadBalancer
//         targetGroupArn: "STRING_VALUE",
//         loadBalancerName: "STRING_VALUE",
//         containerName: "STRING_VALUE",
//         containerPort: Number("int"),
//       },
//     ],
//     serviceRegistries: [ // ServiceRegistries
//       { // ServiceRegistry
//         registryArn: "STRING_VALUE",
//         port: Number("int"),
//         containerName: "STRING_VALUE",
//         containerPort: Number("int"),
//       },
//     ],
//     status: "STRING_VALUE",
//     desiredCount: Number("int"),
//     runningCount: Number("int"),
//     pendingCount: Number("int"),
//     launchType: "EC2" || "FARGATE" || "EXTERNAL",
//     capacityProviderStrategy: [ // CapacityProviderStrategy
//       { // CapacityProviderStrategyItem
//         capacityProvider: "STRING_VALUE", // required
//         weight: Number("int"),
//         base: Number("int"),
//       },
//     ],
//     platformVersion: "STRING_VALUE",
//     platformFamily: "STRING_VALUE",
//     taskDefinition: "STRING_VALUE",
//     deploymentConfiguration: { // DeploymentConfiguration
//       deploymentCircuitBreaker: { // DeploymentCircuitBreaker
//         enable: true || false, // required
//         rollback: true || false, // required
//       },
//       maximumPercent: Number("int"),
//       minimumHealthyPercent: Number("int"),
//       alarms: { // DeploymentAlarms
//         alarmNames: [ // StringList // required
//           "STRING_VALUE",
//         ],
//         rollback: true || false, // required
//         enable: true || false, // required
//       },
//     },
//     taskSets: [ // TaskSets
//       { // TaskSet
//         id: "STRING_VALUE",
//         taskSetArn: "STRING_VALUE",
//         serviceArn: "STRING_VALUE",
//         clusterArn: "STRING_VALUE",
//         startedBy: "STRING_VALUE",
//         externalId: "STRING_VALUE",
//         status: "STRING_VALUE",
//         taskDefinition: "STRING_VALUE",
//         computedDesiredCount: Number("int"),
//         pendingCount: Number("int"),
//         runningCount: Number("int"),
//         createdAt: new Date("TIMESTAMP"),
//         updatedAt: new Date("TIMESTAMP"),
//         launchType: "EC2" || "FARGATE" || "EXTERNAL",
//         capacityProviderStrategy: [
//           {
//             capacityProvider: "STRING_VALUE", // required
//             weight: Number("int"),
//             base: Number("int"),
//           },
//         ],
//         platformVersion: "STRING_VALUE",
//         platformFamily: "STRING_VALUE",
//         networkConfiguration: { // NetworkConfiguration
//           awsvpcConfiguration: { // AwsVpcConfiguration
//             subnets: [ // required
//               "STRING_VALUE",
//             ],
//             securityGroups: [
//               "STRING_VALUE",
//             ],
//             assignPublicIp: "ENABLED" || "DISABLED",
//           },
//         },
//         loadBalancers: [
//           {
//             targetGroupArn: "STRING_VALUE",
//             loadBalancerName: "STRING_VALUE",
//             containerName: "STRING_VALUE",
//             containerPort: Number("int"),
//           },
//         ],
//         serviceRegistries: [
//           {
//             registryArn: "STRING_VALUE",
//             port: Number("int"),
//             containerName: "STRING_VALUE",
//             containerPort: Number("int"),
//           },
//         ],
//         scale: { // Scale
//           value: Number("double"),
//           unit: "PERCENT",
//         },
//         stabilityStatus: "STEADY_STATE" || "STABILIZING",
//         stabilityStatusAt: new Date("TIMESTAMP"),
//         tags: [ // Tags
//           { // Tag
//             key: "STRING_VALUE",
//             value: "STRING_VALUE",
//           },
//         ],
//         fargateEphemeralStorage: { // DeploymentEphemeralStorage
//           kmsKeyId: "STRING_VALUE",
//         },
//       },
//     ],
//     deployments: [ // Deployments
//       { // Deployment
//         id: "STRING_VALUE",
//         status: "STRING_VALUE",
//         taskDefinition: "STRING_VALUE",
//         desiredCount: Number("int"),
//         pendingCount: Number("int"),
//         runningCount: Number("int"),
//         failedTasks: Number("int"),
//         createdAt: new Date("TIMESTAMP"),
//         updatedAt: new Date("TIMESTAMP"),
//         capacityProviderStrategy: [
//           {
//             capacityProvider: "STRING_VALUE", // required
//             weight: Number("int"),
//             base: Number("int"),
//           },
//         ],
//         launchType: "EC2" || "FARGATE" || "EXTERNAL",
//         platformVersion: "STRING_VALUE",
//         platformFamily: "STRING_VALUE",
//         networkConfiguration: {
//           awsvpcConfiguration: {
//             subnets: [ // required
//               "STRING_VALUE",
//             ],
//             securityGroups: [
//               "STRING_VALUE",
//             ],
//             assignPublicIp: "ENABLED" || "DISABLED",
//           },
//         },
//         rolloutState: "COMPLETED" || "FAILED" || "IN_PROGRESS",
//         rolloutStateReason: "STRING_VALUE",
//         serviceConnectConfiguration: { // ServiceConnectConfiguration
//           enabled: true || false, // required
//           namespace: "STRING_VALUE",
//           services: [ // ServiceConnectServiceList
//             { // ServiceConnectService
//               portName: "STRING_VALUE", // required
//               discoveryName: "STRING_VALUE",
//               clientAliases: [ // ServiceConnectClientAliasList
//                 { // ServiceConnectClientAlias
//                   port: Number("int"), // required
//                   dnsName: "STRING_VALUE",
//                 },
//               ],
//               ingressPortOverride: Number("int"),
//               timeout: { // TimeoutConfiguration
//                 idleTimeoutSeconds: Number("int"),
//                 perRequestTimeoutSeconds: Number("int"),
//               },
//               tls: { // ServiceConnectTlsConfiguration
//                 issuerCertificateAuthority: { // ServiceConnectTlsCertificateAuthority
//                   awsPcaAuthorityArn: "STRING_VALUE",
//                 },
//                 kmsKey: "STRING_VALUE",
//                 roleArn: "STRING_VALUE",
//               },
//             },
//           ],
//           logConfiguration: { // LogConfiguration
//             logDriver: "json-file" || "syslog" || "journald" || "gelf" || "fluentd" || "awslogs" || "splunk" || "awsfirelens", // required
//             options: { // LogConfigurationOptionsMap
//               "<keys>": "STRING_VALUE",
//             },
//             secretOptions: [ // SecretList
//               { // Secret
//                 name: "STRING_VALUE", // required
//                 valueFrom: "STRING_VALUE", // required
//               },
//             ],
//           },
//         },
//         serviceConnectResources: [ // ServiceConnectServiceResourceList
//           { // ServiceConnectServiceResource
//             discoveryName: "STRING_VALUE",
//             discoveryArn: "STRING_VALUE",
//           },
//         ],
//         volumeConfigurations: [ // ServiceVolumeConfigurations
//           { // ServiceVolumeConfiguration
//             name: "STRING_VALUE", // required
//             managedEBSVolume: { // ServiceManagedEBSVolumeConfiguration
//               encrypted: true || false,
//               kmsKeyId: "STRING_VALUE",
//               volumeType: "STRING_VALUE",
//               sizeInGiB: Number("int"),
//               snapshotId: "STRING_VALUE",
//               iops: Number("int"),
//               throughput: Number("int"),
//               tagSpecifications: [ // EBSTagSpecifications
//                 { // EBSTagSpecification
//                   resourceType: "volume", // required
//                   tags: [
//                     {
//                       key: "STRING_VALUE",
//                       value: "STRING_VALUE",
//                     },
//                   ],
//                   propagateTags: "TASK_DEFINITION" || "SERVICE" || "NONE",
//                 },
//               ],
//               roleArn: "STRING_VALUE", // required
//               filesystemType: "ext3" || "ext4" || "xfs" || "ntfs",
//             },
//           },
//         ],
//         fargateEphemeralStorage: {
//           kmsKeyId: "STRING_VALUE",
//         },
//       },
//     ],
//     roleArn: "STRING_VALUE",
//     events: [ // ServiceEvents
//       { // ServiceEvent
//         id: "STRING_VALUE",
//         createdAt: new Date("TIMESTAMP"),
//         message: "STRING_VALUE",
//       },
//     ],
//     createdAt: new Date("TIMESTAMP"),
//     placementConstraints: [ // PlacementConstraints
//       { // PlacementConstraint
//         type: "distinctInstance" || "memberOf",
//         expression: "STRING_VALUE",
//       },
//     ],
//     placementStrategy: [ // PlacementStrategies
//       { // PlacementStrategy
//         type: "random" || "spread" || "binpack",
//         field: "STRING_VALUE",
//       },
//     ],
//     networkConfiguration: {
//       awsvpcConfiguration: {
//         subnets: "<StringList>", // required
//         securityGroups: "<StringList>",
//         assignPublicIp: "ENABLED" || "DISABLED",
//       },
//     },
//     healthCheckGracePeriodSeconds: Number("int"),
//     schedulingStrategy: "REPLICA" || "DAEMON",
//     deploymentController: { // DeploymentController
//       type: "ECS" || "CODE_DEPLOY" || "EXTERNAL", // required
//     },
//     tags: "<Tags>",
//     createdBy: "STRING_VALUE",
//     enableECSManagedTags: true || false,
//     propagateTags: "TASK_DEFINITION" || "SERVICE" || "NONE",
//     enableExecuteCommand: true || false,
//   },
// };
