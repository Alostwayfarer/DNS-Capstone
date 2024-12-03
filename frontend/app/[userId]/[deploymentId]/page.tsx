"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { useDeploymentDataStore } from "@/store/deploymentStore";
import { clientServerApi } from "@/api";

// Define TypeScript interfaces
interface LogEntry {
    timestamp: number;
    message: string;
    id: string;
}

interface LogsResponse {
    logs: LogEntry[];
    nextToken: string;
}
interface Proxy {
    proxy_id: string;
    deployment_id: string;
    subdomain: string;
    AWS_link: string;
}

interface Deployment {
    deployment_id: string;
    github_link: string;
    subdomain: string;
    deployment_type: string;
    Status: string;
    userId: string;
    Proxy: Proxy[];
}

export default function DeploymentPage({
    params,
}: {
    params: { userId: string; deploymentId: string };
}) {
    const [activeTab, setActiveTab] = useState("info");
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const userId = params.userId;
    const deployment_id = params.deploymentId;
    const deployments = useDeploymentDataStore((state) => state.deployments);
    const [deployment, setDeployment] = useState<Deployment | null>(null);
    const [error, setError] = useState<string>("");

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loadingLogs, setLoadingLogs] = useState<boolean>(false);
    const [logsError, setLogsError] = useState<string>("");

    const handleDelete = async () => {
        setIsDeleting(true);
        // Implement delete logic here
        console.log(`Deleting deployment ${params.deploymentId}`);
        // Simulate deletion process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // After successful deletion, redirect to user's main page
        router.push(`/${params.userId}`);
    };

    useEffect(() => {
        if (userId && deployment_id) {
            const foundDeployment = deployments.find(
                (dep) =>
                    dep.deployment_id === deployment_id && dep.userId === userId
            );
            if (foundDeployment) {
                setDeployment(foundDeployment);
            } else {
                setError("Deployment not found.");
            }
        } else {
            setError("Invalid parameters.");
        }
    }, [userId, deployment_id, deployments]);

    const fetchLogs = async () => {
        if (!deployment) return;
        setLoadingLogs(true);
        setLogsError("");
        try {
            const response = await clientServerApi.get<LogsResponse>(
                `/logs/${deployment.subdomain}`
            );
            setLogs(response.data.logs);
        } catch (error) {
            console.error("Error fetching logs:", error);
            setLogsError("Failed to fetch logs.");
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [deployment]);

    if (!deployment) {
        return (
            <div className="text-center mt-10">
                Loading deployment details...
            </div>
        );
    }
    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }

    return (
        <>
            <NavBar userId={userId} />
            <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-white">
                    Deployment: {params.deploymentId}
                </h1>
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-4"
                >
                    <TabsList className="bg-gray-800">
                        <TabsTrigger
                            value="info"
                            className="data-[state=active]:bg-blue-600"
                        >
                            Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="data-[state=active]:bg-blue-600"
                        >
                            Security
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="data-[state=active]:bg-blue-600"
                        >
                            Logs
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="info">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Deployment Info
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Details about your deployment
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-gray-300">
                                <p>
                                    GitHub Link:{" "}
                                    <a
                                        href={deployment.github_link}
                                        className="text-blue-400 hover:underline"
                                    >
                                        {deployment.github_link}{" "}
                                    </a>
                                </p>
                                <p>
                                    Shortenlink:{" "}
                                    <a
                                        href={`http://${deployment.subdomain}.localhost:8000`}
                                        className="font-mono"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {deployment.subdomain}
                                    </a>
                                </p>
                                <p>
                                    AWS LINK:{" "}
                                    <a
                                        href={`http://${deployment.Proxy[0].AWS_link}`}
                                        className="font-mono"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {deployment.Proxy[0].AWS_link}
                                    </a>
                                </p>
                                <p>
                                    Deployment Type:{" "}
                                    <span className=" border-lime-800">
                                        {deployment.deployment_type}
                                    </span>
                                    {/* <Badge variant="outline"></Badge> */}
                                </p>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            className="mt-4"
                                        >
                                            Delete Deployment
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-white">
                                                Are you sure?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription className="text-gray-400">
                                                This action cannot be undone.
                                                This will permanently delete
                                                your deployment and remove all
                                                associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleDelete}
                                                className="bg-red-600 text-white hover:bg-red-700"
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    "Delete"
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="security">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Security Details
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Security information for your deployment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-2 text-gray-300">
                                    <li>
                                        SSL:{" "}
                                        <Badge variant="default">Enabled</Badge>
                                    </li>
                                    <li>Last security scan: 2 days ago</li>
                                    <li>
                                        Vulnerabilities detected:{" "}
                                        <Badge variant="outline">None</Badge>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="logs">
                        <Card className="bg-gray-800 border-gray-700">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">
                                    Deployment Logs
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Recent activity logs for your deployment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* <ul className="space-y-2 text-gray-300">
                                    <li className="flex items-center">
                                        <Badge
                                            variant="default"
                                            className="mr-2"
                                        >
                                            Success
                                        </Badge>
                                        Deployment successful (2 hours ago)
                                    </li>
                                    <li className="flex items-center">
                                        <Badge
                                            variant="secondary"
                                            className="mr-2"
                                        >
                                            Info
                                        </Badge>
                                        Build started (2 hours ago)
                                    </li>
                                    <li className="flex items-center">
                                        <Badge
                                            variant="secondary"
                                            className="mr-2"
                                        >
                                            Info
                                        </Badge>
                                        Code pushed to repository (2 hours ago)
                                    </li>
                                </ul> */}

                                {logsError && (
                                    <div className="text-red-500 mb-4">
                                        {logsError}
                                    </div>
                                )}
                                <div className="max-h-64 overflow-y-auto bg-gray-700 p-4 rounded">
                                    <ul className="space-y-2">
                                        {logs.map((log) => (
                                            <li
                                                key={log.id}
                                                className="text-gray-300 text-sm"
                                            >
                                                <span className="text-gray-500">
                                                    {new Date(
                                                        log.timestamp
                                                    ).toLocaleString()}
                                                    :
                                                </span>{" "}
                                                {log.message}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                <div className="mt-6">
                    <Link
                        href={`/${params.userId}`}
                        className="text-blue-400 hover:text-blue-300"
                    >
                        ← Back to All Deployments
                    </Link>
                </div>
            </div>
        </>
    );
}
