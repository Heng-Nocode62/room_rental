import { useQuery } from "@tanstack/react-query";

import { tokenStorage } from "../../../lib/tokenStorage";
import { authApi } from "../api/authApi";

export const currentUserQueryKey = ["auth", "me"] as const;

const PUBLIC_ROUTES = ["/login", "/register"];

function isPublicRoute(): boolean {
  return PUBLIC_ROUTES.some((path) =>
    window.location.pathname.startsWith(path),
  );
}

export function useCurrentUser() {
  const hasToken = !!tokenStorage.getAccessToken();

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authApi.getMe,
    enabled: hasToken && !isPublicRoute(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
