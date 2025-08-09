// Removed useQuery - standalone operation

export function useAuth() {
  // Standalone mode - no backend dependency
  const user = null;
  const isLoading = false;

  return {
    user,
    isLoading,
    isAuthenticated: false, // Always false in standalone mode
  };
}
