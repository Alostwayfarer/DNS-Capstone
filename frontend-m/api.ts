// api.ts
import axios from 'axios';

// Create axios instances for different services
const buildServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUILD_SERVER_URL || 'http://localhost:8011'
});

const clientServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CLIENT_SERVER_URL || 'http://localhost:8012'
});

// Test function
export const testConnection = async () => {
  try {
    const response = await buildServerApi.get('/health');
    console.log('Connection successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

