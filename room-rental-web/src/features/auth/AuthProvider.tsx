import { createContext, useContext, type ReactNode } from "react";

import { useCurrentUser } from "./hooks/useCurrentUser";
import { useLogout } from "./hooks/useLogout";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const currentUser = useCurrentUser();
  const logoutMutation = useLogout();

  const isAuthenticated = currentUser.data != null;
  const isLoading = currentUser.isLoading || logoutMutation.isPending;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
