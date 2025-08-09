import { apiRequest } from './queryClient';

// Helper functions for common API operations

export const categoryApi = {
  getAll: () => apiRequest('GET', '/categories'),
  getBySlug: (slug: string) => apiRequest('GET', `/categories/${slug}`),
  seedCategories: () => apiRequest('POST', '/SeedData/categories'),
};

export const listingApi = {
  getAll: (params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest('GET', `/listings?${searchParams.toString()}`);
  },
  getById: (id: string) => apiRequest('GET', `/listings/${id}`),
  create: (data: any) => apiRequest('POST', '/listings', data),
  update: (id: string, data: any) => apiRequest('PUT', `/listings/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/listings/${id}`),
};

export const userApi = {
  getCurrent: () => apiRequest('GET', '/auth/user'),
  update: (data: any) => apiRequest('PUT', '/auth/user', data),
};

export const healthApi = {
  check: () => apiRequest('GET', '/health'),
};