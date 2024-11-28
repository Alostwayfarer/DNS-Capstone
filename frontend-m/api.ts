// C:\Users\SHWETASINGH\DNS-Capstone\frontend-m\api.ts

const BUILD_SERVER_URL = process.env.NEXT_PUBLIC_BUILD_SERVER_URL || 'http://localhost:8011';
const CLIENT_SERVER_URL = process.env.NEXT_PUBLIC_CLIENT_SERVER_URL || 'http://localhost:8012';

export async function apiCall(
    endpoint: string,
    options: RequestInit = {},
    useBuildServer: boolean = false // Flag to choose between servers
): Promise<any> {
    const baseURL = useBuildServer ? BUILD_SERVER_URL : CLIENT_SERVER_URL;

    try {
        const response = await fetch(`${baseURL}/${endpoint}`, options);

        if (!response.ok) {
            throw new Error(
                `HTTP error! Status: ${response.status}, Message: ${response.statusText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error(`API Call Error [${endpoint}]:`, error);
        throw error; // Re-throw for caller handling
    }
}

// Example: Deploy Function (Uses Build Server)
export async function deployBuild(): Promise<any> {
    return apiCall('deploy', { method: 'POST' }, true); // `true` indicates using BUILD_SERVER_URL
}

// Example: Fetch Logs (Uses Client Server)
export async function getLogs(): Promise<any> {
    return apiCall('logs', { method: 'GET' }, false); // `false` indicates using CLIENT_SERVER_URL
}
