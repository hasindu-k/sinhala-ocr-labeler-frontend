"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { signin, signup as apiSignup, signout } from "@/lib/auth-api";
import {
  clearAuthTokens,
  clearStoredUser,
  getAuthTokens,
  getStoredUser,
  isAccessTokenExpired,
  setAuthTokens,
  setStoredUser,
} from "@/lib/localStore";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = getStoredUser<User>();
      const tokens = getAuthTokens();

      // Consider user logged in if we have tokens and stored user,
      // even if the access token is currently expired (refresh will run client-side)
      if (storedUser && tokens) {
        setUser(storedUser);
      } else if (!tokens) {
        clearStoredUser();
        setUser(null);
      }
    };

    checkAuth();

    // Listen for logout events (e.g., when token refresh fails)
    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);

    // Listen for successful token refresh to re-check auth state
    const handleTokenRefreshed = () => {
      checkAuth();
    };
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);

    setIsLoading(false);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
  }, []);

  // Re-check auth when token is refreshed (listen to storage changes)
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = getStoredUser<User>();
      const tokens = getAuthTokens();

      if (storedUser && tokens && !isAccessTokenExpired()) {
        setUser(storedUser);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      const publicPaths = ["/", "/login", "/signup"];
      const isPublicPath = publicPaths.includes(pathname);

      if (!user && !isPublicPath) {
        router.push("/login");
      } else if (user && pathname === "/") {
        router.push("/documents");
      } else if (user && (pathname === "/login" || pathname === "/signup")) {
        router.push("/documents");
      }
    }
  }, [user, pathname, isLoading, router]);

  const login = async (email: string, password: string) => {
    const data = await signin(email, password);
    const authUser: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      is_active: data.user.is_active,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
    };

    setUser(authUser);
    setStoredUser(authUser);
    setAuthTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    router.push("/documents");
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    const data = await apiSignup({ name, email, password, role });
    const authUser: User = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      is_active: data.user.is_active,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
    };

    setUser(authUser);
    setStoredUser(authUser);
    setAuthTokens({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    router.push("/documents");
  };

  const logout = async () => {
    try {
      await signout();
    } catch (error) {
      console.warn("Signout request failed", error);
    } finally {
      setUser(null);
      clearStoredUser();
      clearAuthTokens();
      router.push("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
