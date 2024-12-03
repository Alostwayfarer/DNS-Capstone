// import create from "zustand";

import { create } from "zustand";

//
export const useDeploymentStore = create((set) => ({
    userId: null,
    setUserId: (userId: string) => set({ userId }),
}));

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

interface DeploymentState {
    deployments: Deployment[];
    setDeployments: (deployments: Deployment[]) => void;
    addDeployment: (deployment: Deployment) => void;
    updateDeployment: (deployment_id: string, updatedDeployment: Deployment) => void;
    removeDeployment: (deployment_id: string) => void;
}

export const useDeploymentDataStore = create<DeploymentState>((set) => ({
    deployments: [],
    setDeployments: (deployments) => set({ deployments }),
    addDeployment: (deployment) =>
        set((state) => ({ deployments: [...state.deployments, deployment] })),
    updateDeployment: (deployment_id, updatedDeployment) =>
        set((state) => ({
            deployments: state.deployments.map((deployment) =>
                deployment.deployment_id === deployment_id
                    ? updatedDeployment
                    : deployment
            ),
        })),
    removeDeployment: (deployment_id) =>
        set((state) => ({
            deployments: state.deployments.filter(
                (deployment) => deployment.deployment_id !== deployment_id
            ),
        })),
}));