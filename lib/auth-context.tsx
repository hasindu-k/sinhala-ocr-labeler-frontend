"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
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
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock user data
    const mockUser: User = {
      id: "1",
      name: "John Doe",
      email: email,
      role: "admin",
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    router.push("/documents");
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: string
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock user data
    const mockUser: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: role,
    };

    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    router.push("/documents");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    router.push("/login");
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
