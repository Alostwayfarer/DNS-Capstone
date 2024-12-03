"use client";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { NavBar } from "@/components/nav-bar";
import { clientServerApi } from "@/api";
import { useEffect, useState } from "react";

import { useDeploymentDataStore } from "@/store/deploymentStore";

// Define TypeScript interfaces
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

interface User {
    user_id: string;
    name: string;
    email: string | null;
    deployments: Deployment[];
}

export default function UserDeployments({
    params,
}: {
    params: { userId: string };
}) {
    // const [deployments, setDeployments] = useState<Deployment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const userId = params.userId;
    const deployments = useDeploymentDataStore((state) => state.deployments);
    const setDeployments = useDeploymentDataStore(
        (state) => state.setDeployments
    );

    useEffect(() => {
        const fetchDeployments = async () => {
            try {
                const response = await clientServerApi.get<User[]>("/data");
                // Find the user matching the userId
                const user = response.data.find(
                    (user) => user.user_id === userId
                );
                if (user) {
                    setDeployments(user.deployments);
                } else {
                    setError("No deployments found for this user.");
                }
            } catch (err) {
                console.error("Error fetching deployments:", err);
                setError("Failed to fetch deployments.");
            } finally {
                setLoading(false);
            }
        };

        // fetchDeployments();
        if (userId) {
            fetchDeployments();
        } else {
            setError("Invalid User ID.");
            setLoading(false);
        }
    }, [userId, setDeployments]);

    if (loading) {
        return <div className="text-center mt-10">Loading deployments...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center mt-10">{error}</div>;
    }
    return (
        <>
            <NavBar userId={params.userId} />

            <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-white">
                        Your Deployments
                    </h1>
                    <Button asChild>
                        <Link href="/">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Deployment
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deployments.length > 0 ? (
                        deployments.map((deployment) => (
                            <Card
                                key={deployment.deployment_id}
                                className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors"
                            >
                                <CardHeader>
                                    <CardTitle className="text-xl text-white">
                                        {deployment.subdomain}
                                    </CardTitle>
                                    <CardDescription className="text-gray-400">
                                        Type: {deployment.deployment_type}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <Badge
                                            variant={
                                                deployment.Status === "DEPLOYED"
                                                    ? "default"
                                                    : deployment.Status ===
                                                      "building"
                                                    ? "secondary"
                                                    : "destructive"
                                            }
                                        >
                                            {deployment.Status}
                                        </Badge>
                                        <Link
                                            href={`/${params.userId}/${deployment.deployment_id}`}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center text-white">
                            No deployments found.
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
