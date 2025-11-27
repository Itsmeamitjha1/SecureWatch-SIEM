import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/user", {
      credentials: "include",
    });
    
    if (response.status === 401) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    
    return response.json();
  } catch {
    return null;
  }
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: user ?? undefined,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
