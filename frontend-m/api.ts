// api.ts
import axios from 'axios';

// Create axios instances for different services
export const buildServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUILD_SERVER_URL || 'http://localhost:8011',
  timeout: 10000 // 10 seconds
});

export const clientServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CLIENT_SERVER_URL || 'http://localhost:8012',
  timeout: 10000 // 10 seconds
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


// module.exports = { clientServerApi, buildServerApi, testConnection };