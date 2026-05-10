// api.ts
import axios from 'axios';

// Create axios instances for different services
export const buildServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUILD_SERVER_URL || 'http://localhost:8011',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

});

export const clientServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CLIENT_SERVER_URL || 'http://localhost:8012',
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Test function
export const testConnection = async () => {
  try {
    const response = await buildServerApi.get('/health');
    const response2 = await clientServerApi.get('/health');
    console.log('Connection to build successful:', response.data);
    console.log('Connection server successful:', response2.data);
    return response.data;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

export const deployBuild = async (payload = {}) => {
  const response = await buildServerApi.post('/deploy-repo', payload);
  return response.data;
};

export const getLogs = async (repoName = '') => {
  if (!repoName) {
    return { logs: [], nextToken: null };
  }

  const response = await clientServerApi.get(`/logs/${repoName}`);
  return response.data;
};


// module.exports = { clientServerApi, buildServerApi, testConnection };
