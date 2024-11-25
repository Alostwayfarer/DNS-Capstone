const {
    CloudWatchLogsClient,
    GetLogEventsCommand,
    DescribeLogStreamsCommand,
} = require("@aws-sdk/client-cloudwatch-logs");

const awsConfig = {
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
};

const cloudWatchClient = new CloudWatchLogsClient(awsConfig);

async function getCloudWatchLogs(logGroupName) {
    console.log(
        "================================================================================="
    );
    console.log("Fetching logs for log group:", logGroupName);
    try {
        // Get the latest log stream
        const describeStreamsCommand = new DescribeLogStreamsCommand({
            logGroupName,
            orderBy: "LastEventTime",
            descending: true,
            limit: 1,
        });

        const streamResponse = await cloudWatchClient.send(
            describeStreamsCommand
        );

        if (
            !streamResponse.logStreams ||
            streamResponse.logStreams.length === 0
        ) {
            return { logs: [], nextToken: null };
        }

        const logStreamName = streamResponse.logStreams[0].logStreamName;

        // Get logs from the stream
        const getLogsCommand = new GetLogEventsCommand({
            logGroupName,
            logStreamName,
            startFromHead: true,
            limit: 100,
        });

        const logsResponse = await cloudWatchClient.send(getLogsCommand);

        const formattedLogs = logsResponse.events.map((event) => ({
            timestamp: event.timestamp,
            message: event.message,
            id: event.eventId,
        }));

        return {
            logs: formattedLogs,
            nextToken: logsResponse.nextForwardToken,
        };
    } catch (error) {
        console.error("Error fetching CloudWatch logs:", error);
        throw error;
    }
}

module.exports = { getCloudWatchLogs };
