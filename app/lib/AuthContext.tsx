import { createContext, useState, ReactNode } from 'react';
import { getUser } from './data';

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  roleId: number;
  orders: any[];
}

interface AuthContextType {
  user: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);

  const login = (userData: UserData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const fetchUserData = async () => {
    const userData = await getUser();
    console.log("Anzhela URAAA")
    if (userData) {
      setUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
};