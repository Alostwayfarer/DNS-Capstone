"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { clientServerApi, buildServerApi, testConnection } from "@/api";

const deploymentSteps = [
    "Validating GitHub link...",
    "Cloning repository...",
    "Installing dependencies...",
    "Building project...",
    "Configuring server...",
    "Deploying to CDN...",
];

export default function Home() {
    const [githubLink, setGithubLink] = useState("");
    const [deploymentType, setDeploymentType] = useState("");
    const [isValidLink, setIsValidLink] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentStep, setDeploymentStep] = useState(0);
    const [error, setError] = useState("");
    const router = useRouter();

    const validateGithubLink = (link: string) => {
        const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+$/;
        return githubRegex.test(link);
    };

    const handleGithubLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const link = e.target.value;
        setGithubLink(link);
        setIsValidLink(validateGithubLink(link));
    };

    const simulateDeployment = async () => {
        for (let i = 0; i < deploymentSteps.length; i++) {
            setDeploymentStep(i);
            await new Promise((resolve) => setTimeout(resolve, 1500));
        }
    };

    const handleDeploy = async () => {
        testConnection();
        if (!isValidLink) {
            setError("Please enter a valid GitHub link.");
            return;
        }
        if (!deploymentType) {
            setError("Please select a deployment type.");
            return;
        }

        setError("");
        setIsDeploying(true);

        try {
            // Check if user has existing deployments (simulated)
            const hasExistingDeployments = Math.random() < 0.5; // 50% chance of having existing deployments

            if (hasExistingDeployments) {
                router.push("/login?redirect=deploy");
                return;
            }

            await simulateDeployment();

            // Generate a random user ID
            const userId = Math.random().toString(36).substr(2, 9);

            // Redirect to the deployments page
            router.push(`/${userId}`);
        } catch (error) {
            setError("An error occurred during deployment. Please try again.");
        } finally {
            setIsDeploying(false);
            setDeploymentStep(0);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gray-900 to-black">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-white">
                        DNS Hosting
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Deploy your project in seconds
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="github-link"
                                className="text-gray-200"
                            >
                                GitHub Link
                            </Label>
                            <Input
                                id="github-link"
                                placeholder="https://github.com/username/repo"
                                value={githubLink}
                                onChange={handleGithubLinkChange}
                                className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                                    !isValidLink && githubLink
                                        ? "border-red-500"
                                        : ""
                                }`}
                            />
                            {!isValidLink && githubLink && (
                                <p className="text-red-500 text-sm">
                                    Please enter a valid GitHub link.
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="deployment-type"
                                className="text-gray-200"
                            >
                                Deployment Type
                            </Label>
                            <Select onValueChange={setDeploymentType}>
                                <SelectTrigger
                                    id="deployment-type"
                                    className="bg-gray-700 border-gray-600 text-white"
                                >
                                    <SelectValue placeholder="Select deployment type" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                    <SelectItem value="FRONTEND">
                                        Frontend
                                    </SelectItem>
                                    <SelectItem value="BACKEND">
                                        Backend
                                    </SelectItem>
                                    <SelectItem value="PYTHON">
                                        Python
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleDeploy}
                            disabled={
                                isDeploying ||
                                !isValidLink ||
                                !githubLink ||
                                !deploymentType
                            }
                        >
                            {isDeploying ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {deploymentSteps[deploymentStep]}
                                </>
                            ) : (
                                "Deploy"
                            )}
                        </Button>
                    </form>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            <div className="mt-4 space-x-4">
                <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300"
                >
                    Login
                </Link>
                <Link
                    href="/signup"
                    className="text-blue-400 hover:text-blue-300"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
