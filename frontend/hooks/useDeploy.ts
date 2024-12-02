import { useState } from 'react';
import { deployBuild } from '../api';

export const useDeploy = () => {
    const [isDeploying, setIsDeploying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const deploy = async () => {
        setIsDeploying(true);
        try {
            const response = await deployBuild();
            console.log('Deployment Successful:', response);
        } catch (err) {
            setError(err as Error);
            console.error('Deployment Failed:', err);
        } finally {
            setIsDeploying(false);
        }
    };

    return { isDeploying, deploy, error };
};
