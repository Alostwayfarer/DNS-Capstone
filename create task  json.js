import { ECSClient, RegisterTaskDefinitionCommand } from "@aws-sdk/client-ecs"; // ES Modules import
// const { ECSClient, RegisterTaskDefinitionCommand } = require("@aws-sdk/client-ecs"); // CommonJS import
const client = new ECSClient(config);
const input = {
    // RegisterTaskDefinitionRequest
    family: "name of user repo - task def ", // required
    taskRoleArn: "arn:aws:iam::677276079200:role/ecsTaskExecutionRole",
    executionRoleArn: "arn:aws:iam::677276079200:role/ecsTaskExecutionRole",
    networkMode: "awsvpc",
    containerDefinitions: [
        // ContainerDefinitions // required
        {
            // ContainerDefinition
            name: "user repo container name", // required
            image: "my aws ecr image", // required
            cpu: 0,
            // repositoryCredentials: {
            //     // RepositoryCredentials
            //     credentialsParameter: "STRING_VALUE", // required
            // },
            // links: [
            //     // StringList
            //     "STRING_VALUE",
            // ],
            portMappings: [
                // PortMappingList
                {
                    // PortMapping
                    // name: "STRING_VALUE",
                    containerPort: "same ans user docker port ",
                    hostPort: "same ans user docker port ",
                    protocol: "tcp",
                    appProtocol: "http",
                },
            ],
            essential: true,

            environment: [
                // EnvironmentVariables
                {
                    // KeyValuePair
                    name: "STRING_VALUE",
                    value: "STRING_VALUE",
                },
            ],
            // environmentFiles: [
            //     // EnvironmentFiles
            //     {
            //         // EnvironmentFile
            //         value: "STRING_VALUE", // required
            //         type: "s3", // required
            //     },
            // ],
            // mountPoints: [
            //     // MountPointList
            //     {
            //         // MountPoint
            //         sourceVolume: "STRING_VALUE",
            //         containerPath: "STRING_VALUE",
            //         readOnly: true || false,
            //     },
            // ],
            // volumesFrom: [
            //     // VolumeFromList
            //     {
            //         // VolumeFrom
            //         sourceContainer: "STRING_VALUE",
            //         readOnly: true || false,
            //     },
            // ],
            // linuxParameters: {
            //     // LinuxParameters
            //     capabilities: {
            //         // KernelCapabilities
            //         add: ["STRING_VALUE"],
            //         drop: ["STRING_VALUE"],
            //     },
            //     devices: [
            //         // DevicesList
            //         {
            //             // Device
            //             hostPath: "STRING_VALUE", // required
            //             containerPath: "STRING_VALUE",
            //             permissions: [
            //                 // DeviceCgroupPermissions
            //                 "read" || "write" || "mknod",
            //             ],
            //         },
            //     ],
            //     initProcessEnabled: true || false,
            //     sharedMemorySize: Number("int"),
            //     tmpfs: [
            //         // TmpfsList
            //         {
            //             // Tmpfs
            //             containerPath: "STRING_VALUE", // required
            //             size: Number("int"), // required
            //             mountOptions: "<StringList>",
            //         },
            //     ],
            //     maxSwap: Number("int"),
            //     swappiness: Number("int"),
            // },
            // secrets: [
            //     // SecretList
            // ],

            // ulimits: [

            // ],

            logConfiguration: {
                // LogConfiguration
                logDriver: "awslogs", // required
                options: {
                    // LogConfigurationOptionsMap
                },
                secretOptions: [],
            },
            // healthCheck: {
            //     // HealthCheck
            //     command: "<StringList>", // required
            //     interval: Number("int"),
            //     timeout: Number("int"),
            //     retries: Number("int"),
            //     startPeriod: Number("int"),
            // },
            systemControls: [
                // SystemControls
                {
                    // SystemControl
                    namespace: "STRING_VALUE",
                    value: "STRING_VALUE",
                },
            ],
        },
    ],

    requiresCompatibilities: [
        // CompatibilityList
        "FARGATE",
    ],
    cpu: "512",
    memory: "2048",

    runtimePlatform: {
        cpuArchitecture: "X86_64",
        operatingSystemFamily: "LINUX",
    },
};
const command = new RegisterTaskDefinitionCommand(input);
const response = await client.send(command);
// { // RegisterTaskDefinitionResponse
//   taskDefinition: { // TaskDefinition
//     taskDefinitionArn: "STRING_VALUE",
//     containerDefinitions: [ // ContainerDefinitions
//       { // ContainerDefinition
//         name: "STRING_VALUE",
//         image: "STRING_VALUE",
//         repositoryCredentials: { // RepositoryCredentials
//           credentialsParameter: "STRING_VALUE", // required
//         },
//         cpu: Number("int"),
//         memory: Number("int"),
//         memoryReservation: Number("int"),
//         links: [ // StringList
//           "STRING_VALUE",
//         ],
//         portMappings: [ // PortMappingList
//           { // PortMapping
//             containerPort: Number("int"),
//             hostPort: Number("int"),
//             protocol: "tcp" || "udp",
//             name: "STRING_VALUE",
//             appProtocol: "http" || "http2" || "grpc",
//             containerPortRange: "STRING_VALUE",
//           },
//         ],
//         essential: true || false,
//         restartPolicy: { // ContainerRestartPolicy
//           enabled: true || false, // required
//           ignoredExitCodes: [ // IntegerList
//             Number("int"),
//           ],
//           restartAttemptPeriod: Number("int"),
//         },
//         entryPoint: [
//           "STRING_VALUE",
//         ],
//         command: [
//           "STRING_VALUE",
//         ],
//         environment: [ // EnvironmentVariables
//           { // KeyValuePair
//             name: "STRING_VALUE",
//             value: "STRING_VALUE",
//           },
//         ],
//         environmentFiles: [ // EnvironmentFiles
//           { // EnvironmentFile
//             value: "STRING_VALUE", // required
//             type: "s3", // required
//           },
//         ],
//         mountPoints: [ // MountPointList
//           { // MountPoint
//             sourceVolume: "STRING_VALUE",
//             containerPath: "STRING_VALUE",
//             readOnly: true || false,
//           },
//         ],
//         volumesFrom: [ // VolumeFromList
//           { // VolumeFrom
//             sourceContainer: "STRING_VALUE",
//             readOnly: true || false,
//           },
//         ],
//         linuxParameters: { // LinuxParameters
//           capabilities: { // KernelCapabilities
//             add: [
//               "STRING_VALUE",
//             ],
//             drop: [
//               "STRING_VALUE",
//             ],
//           },
//           devices: [ // DevicesList
//             { // Device
//               hostPath: "STRING_VALUE", // required
//               containerPath: "STRING_VALUE",
//               permissions: [ // DeviceCgroupPermissions
//                 "read" || "write" || "mknod",
//               ],
//             },
//           ],
//           initProcessEnabled: true || false,
//           sharedMemorySize: Number("int"),
//           tmpfs: [ // TmpfsList
//             { // Tmpfs
//               containerPath: "STRING_VALUE", // required
//               size: Number("int"), // required
//               mountOptions: "<StringList>",
//             },
//           ],
//           maxSwap: Number("int"),
//           swappiness: Number("int"),
//         },
//         secrets: [ // SecretList
//           { // Secret
//             name: "STRING_VALUE", // required
//             valueFrom: "STRING_VALUE", // required
//           },
//         ],
//         dependsOn: [ // ContainerDependencies
//           { // ContainerDependency
//             containerName: "STRING_VALUE", // required
//             condition: "START" || "COMPLETE" || "SUCCESS" || "HEALTHY", // required
//           },
//         ],
//         startTimeout: Number("int"),
//         stopTimeout: Number("int"),
//         hostname: "STRING_VALUE",
//         user: "STRING_VALUE",
//         workingDirectory: "STRING_VALUE",
//         disableNetworking: true || false,
//         privileged: true || false,
//         readonlyRootFilesystem: true || false,
//         dnsServers: "<StringList>",
//         dnsSearchDomains: "<StringList>",
//         extraHosts: [ // HostEntryList
//           { // HostEntry
//             hostname: "STRING_VALUE", // required
//             ipAddress: "STRING_VALUE", // required
//           },
//         ],
//         dockerSecurityOptions: "<StringList>",
//         interactive: true || false,
//         pseudoTerminal: true || false,
//         dockerLabels: { // DockerLabelsMap
//           "<keys>": "STRING_VALUE",
//         },
//         ulimits: [ // UlimitList
//           { // Ulimit
//             name: "core" || "cpu" || "data" || "fsize" || "locks" || "memlock" || "msgqueue" || "nice" || "nofile" || "nproc" || "rss" || "rtprio" || "rttime" || "sigpending" || "stack", // required
//             softLimit: Number("int"), // required
//             hardLimit: Number("int"), // required
//           },
//         ],
//         logConfiguration: { // LogConfiguration
//           logDriver: "json-file" || "syslog" || "journald" || "gelf" || "fluentd" || "awslogs" || "splunk" || "awsfirelens", // required
//           options: { // LogConfigurationOptionsMap
//             "<keys>": "STRING_VALUE",
//           },
//           secretOptions: [
//             {
//               name: "STRING_VALUE", // required
//               valueFrom: "STRING_VALUE", // required
//             },
//           ],
//         },
//         healthCheck: { // HealthCheck
//           command: "<StringList>", // required
//           interval: Number("int"),
//           timeout: Number("int"),
//           retries: Number("int"),
//           startPeriod: Number("int"),
//         },
//         systemControls: [ // SystemControls
//           { // SystemControl
//             namespace: "STRING_VALUE",
//             value: "STRING_VALUE",
//           },
//         ],
//         resourceRequirements: [ // ResourceRequirements
//           { // ResourceRequirement
//             value: "STRING_VALUE", // required
//             type: "GPU" || "InferenceAccelerator", // required
//           },
//         ],
//         firelensConfiguration: { // FirelensConfiguration
//           type: "fluentd" || "fluentbit", // required
//           options: { // FirelensConfigurationOptionsMap
//             "<keys>": "STRING_VALUE",
//           },
//         },
//         credentialSpecs: "<StringList>",
//       },
//     ],
//     family: "STRING_VALUE",
//     taskRoleArn: "STRING_VALUE",
//     executionRoleArn: "STRING_VALUE",
//     networkMode: "bridge" || "host" || "awsvpc" || "none",
//     revision: Number("int"),
//     volumes: [ // VolumeList
//       { // Volume
//         name: "STRING_VALUE",
//         host: { // HostVolumeProperties
//           sourcePath: "STRING_VALUE",
//         },
//         dockerVolumeConfiguration: { // DockerVolumeConfiguration
//           scope: "task" || "shared",
//           autoprovision: true || false,
//           driver: "STRING_VALUE",
//           driverOpts: { // StringMap
//             "<keys>": "STRING_VALUE",
//           },
//           labels: {
//             "<keys>": "STRING_VALUE",
//           },
//         },
//         efsVolumeConfiguration: { // EFSVolumeConfiguration
//           fileSystemId: "STRING_VALUE", // required
//           rootDirectory: "STRING_VALUE",
//           transitEncryption: "ENABLED" || "DISABLED",
//           transitEncryptionPort: Number("int"),
//           authorizationConfig: { // EFSAuthorizationConfig
//             accessPointId: "STRING_VALUE",
//             iam: "ENABLED" || "DISABLED",
//           },
//         },
//         fsxWindowsFileServerVolumeConfiguration: { // FSxWindowsFileServerVolumeConfiguration
//           fileSystemId: "STRING_VALUE", // required
//           rootDirectory: "STRING_VALUE", // required
//           authorizationConfig: { // FSxWindowsFileServerAuthorizationConfig
//             credentialsParameter: "STRING_VALUE", // required
//             domain: "STRING_VALUE", // required
//           },
//         },
//         configuredAtLaunch: true || false,
//       },
//     ],
//     status: "ACTIVE" || "INACTIVE" || "DELETE_IN_PROGRESS",
//     requiresAttributes: [ // RequiresAttributes
//       { // Attribute
//         name: "STRING_VALUE", // required
//         value: "STRING_VALUE",
//         targetType: "container-instance",
//         targetId: "STRING_VALUE",
//       },
//     ],
//     placementConstraints: [ // TaskDefinitionPlacementConstraints
//       { // TaskDefinitionPlacementConstraint
//         type: "memberOf",
//         expression: "STRING_VALUE",
//       },
//     ],
//     compatibilities: [ // CompatibilityList
//       "EC2" || "FARGATE" || "EXTERNAL",
//     ],
//     runtimePlatform: { // RuntimePlatform
//       cpuArchitecture: "X86_64" || "ARM64",
//       operatingSystemFamily: "WINDOWS_SERVER_2019_FULL" || "WINDOWS_SERVER_2019_CORE" || "WINDOWS_SERVER_2016_FULL" || "WINDOWS_SERVER_2004_CORE" || "WINDOWS_SERVER_2022_CORE" || "WINDOWS_SERVER_2022_FULL" || "WINDOWS_SERVER_20H2_CORE" || "LINUX",
//     },
//     requiresCompatibilities: [
//       "EC2" || "FARGATE" || "EXTERNAL",
//     ],
//     cpu: "STRING_VALUE",
//     memory: "STRING_VALUE",
//     inferenceAccelerators: [ // InferenceAccelerators
//       { // InferenceAccelerator
//         deviceName: "STRING_VALUE", // required
//         deviceType: "STRING_VALUE", // required
//       },
//     ],
//     pidMode: "host" || "task",
//     ipcMode: "host" || "task" || "none",
//     proxyConfiguration: { // ProxyConfiguration
//       type: "APPMESH",
//       containerName: "STRING_VALUE", // required
//       properties: [ // ProxyConfigurationProperties
//         {
//           name: "STRING_VALUE",
//           value: "STRING_VALUE",
//         },
//       ],
//     },
//     registeredAt: new Date("TIMESTAMP"),
//     deregisteredAt: new Date("TIMESTAMP"),
//     registeredBy: "STRING_VALUE",
//     ephemeralStorage: { // EphemeralStorage
//       sizeInGiB: Number("int"), // required
//     },
//   },
//   tags: [ // Tags
//     { // Tag
//       key: "STRING_VALUE",
//       value: "STRING_VALUE",
//     },
//   ],
// };
