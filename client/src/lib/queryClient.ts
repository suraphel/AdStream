import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axios, { AxiosResponse, AxiosError } from "axios";

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging and request modification
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const message = error.response?.data || error.message || 'An error occurred';
    const status = error.response?.status || 500;
    
    console.error(`API Error: ${status} ${error.config?.url}`, message);
    
    // Create a consistent error format
    const formattedError = new Error(`${status}: ${typeof message === 'string' ? message : JSON.stringify(message)}`);
    return Promise.reject(formattedError);
  }
);

export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<AxiosResponse> {
  // STANDALONE MODE: Return mock response instead of making API calls
  console.log(`Standalone Mode: Skipping ${method} request to ${endpoint}`);
  
  return {
    data: {},
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  } as AxiosResponse;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // STANDALONE MODE: Return appropriate empty data instead of making API calls
    console.log(`Standalone Mode: Skipping API call to ${queryKey.join("/")}`);
    if (unauthorizedBehavior === "returnNull") {
      return null as unknown as T;
    }
    return [] as unknown as T;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Don't cache to ensure fresh data
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});