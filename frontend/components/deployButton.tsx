import { useDeploy } from '../hooks/useDeploy';

const DeployButton = () => {
    const { isDeploying, deploy, error } = useDeploy();

    return (
        <div>
            <button onClick={deploy} disabled={isDeploying}>
                {isDeploying ? 'Deploying...' : 'Deploy'}
            </button>
            {error && <p style={{ color: 'red' }}>Error: {String(error)}</p>}
        </div>
    );
};

export default DeployButton;
