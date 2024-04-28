"use client"
import { createContext, useState, ReactNode, useEffect, SetStateAction } from "react";
import { getUser } from "./data";

export interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  roleId: number;
  orders: any[];
}

interface AuthContextValue {
  user: UserData | null;
  setUserInAuthContext: (userData: UserData | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  const setUserInAuthContext = (userData: UserData | null) => {
    setUser(userData);
  };

  

  return (
    <AuthContext.Provider value={{ user, setUserInAuthContext }}>{children}</AuthContext.Provider>
  );
}

export default AuthContext;