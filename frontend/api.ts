// api.ts
import axios from 'axios';

// Create axios instances for different services
export const buildServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BUILD_SERVER_URL || 'http://localhost:8011',
  timeout: 300000, // 10 seconds,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

});

export const clientServerApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CLIENT_SERVER_URL || 'http://localhost:8012',
  timeout: 300000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Test function
export const testConnection = async () => {
  console.log('Testing connection to servers...');
  try {
    console.log('Testing connection to client server...');
    const response2 = await clientServerApi.get('/data');
    console.log('Connection server successful:', response2.data);
    const response = await buildServerApi.get('/data');
    console.log('Connection to build successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
};

export const getBuilds = async () => {

  const serverResponse = await buildServerApi.get('/metrics');
  return serverResponse.data;
}

// module.exports = { clientServerApi, buildServerApi, testConnection };