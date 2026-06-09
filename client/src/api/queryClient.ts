import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // always refetch when invalidated
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
