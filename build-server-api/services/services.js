// ///////////////////AWS
const { ECRClient, CreateRepositoryCommand } = require("@aws-sdk/client-ecr");
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);
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

const createECRRepository = async (repositoryName) => {
    const input = {
        repositoryName,
        imageTagMutability: "MUTABLE",
        imageScanningConfiguration: { scanOnPush: true },
        encryptionConfiguration: { encryptionType: "AES256" },
    };
    try {
        return await ecrClient.send(new CreateRepositoryCommand(input));
    } catch (error) {
        if (error.name === "RepositoryAlreadyExistsException") {
            console.log("Repository already exists, skipping creation.");
        } else {
            throw error;
        }
    }
};

const cloneRepository = async (repoUrl, tempDir) => {
    await execAsync(`git clone ${repoUrl} ${tempDir}`);
    console.log("Repository cloned successfully");
};

module.exports = { createECRRepository, cloneRepository };
