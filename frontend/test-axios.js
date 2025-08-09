// Test axios integration
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Test the health endpoint
async function testHealthEndpoint() {
  try {
    const response = await apiClient.get('/health');
    console.log('Health check:', response.data);
  } catch (error) {
    console.error('Health check failed:', error.message);
  }
}

// Test categories endpoint
async function testCategoriesEndpoint() {
  try {
    const response = await apiClient.get('/categories');
    console.log('Categories:', response.data);
  } catch (error) {
    console.error('Categories fetch failed:', error.message);
  }
}

testHealthEndpoint();
testCategoriesEndpoint();