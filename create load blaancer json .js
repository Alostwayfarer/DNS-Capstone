const loadbalancerinput = {
    // CreateLoadBalancerInput
    Name: "repo name-lb", // required
    Subnets: [
        // Subnets
        process.env.SUBNET_IDS.split(","),
    ],
    SecurityGroups: [
        // SecurityGroups
        process.env.SECURITY_GROUP_ID,
    ],
    Scheme: "internet-facing",

    Type: "application",
    IpAddressType: "ipv4",
    CustomerOwnedIpv4Pool: "STRING_VALUE",
    EnablePrefixForIpv6SourceNat: "on" || "off",
};

const input = {
    // CreateTargetGroupInput
    Name: "repo name tg ", // required
    Protocol: "HTTP",
    ProtocolVersion: "HTTP1",
    Port: 80, // some port
    VpcId: process.env.VPC_ID,

    TargetType: "ip",

    IpAddressType: "ipv4",
};

// const createTGParams = {
//     Name: "my-ecs-tg",
//     Protocol: "HTTP",
//     Port: 80,
//     VpcId: "vpc-xxxxxx", // Replace with your VPC ID
//     HealthCheckProtocol: "HTTP",
//     HealthCheckPath: "/health", // Replace with your health check path
//     HealthCheckEnabled: true,
//     HealthCheckIntervalSeconds: 30,
//     HealthCheckTimeoutSeconds: 5,
//     HealthyThresholdCount: 2,
//     UnhealthyThresholdCount: 2,
//     TargetType: "ip", // Use 'ip' for ECS tasks with awsvpc network mode
//     Tags: [
//         {
//             Key: "Environment",
//             Value: "Production"
//         }
//     ]
// };

const listernerinput = {
    LoadBalancerArn: loadBalancerArn,
    Protocol: "HTTP", // Use HTTPS for production
    Port: 80,
    DefaultActions: [
        {
            Type: "forward",
            TargetGroupArn: targetGroupArn,
        },
    ],
};

laod;
target;

lsitneer;
