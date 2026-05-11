"use client";

import { createContext, ReactNode, useState, useEffect } from "react";

type User = {
  id?: string;
  name: string;
  email: string;
} | null;

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export default function UserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: User;
}) {
  const [user, setUser] = useState<User>(initialUser || null);

  // Load from localStorage ONLY ONCE when component mounts
  useEffect(() => {
    if (user) return; // Skip if we already have user from server

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: payload.id,
        name: payload.name || "User",
        email: payload.email,
      });
    } catch (err) {
      console.error("Failed to decode token from localStorage");
    }
  }, []); // ← Empty dependency array (runs only once)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}