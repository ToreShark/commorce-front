"use client";
import {createContext, useEffect, useState} from 'react';
import { UserData } from './AuthContext';
import { getUser } from './data';

export const UserContext = createContext<{
  currentUser: UserData | null;
  setCurrentUser: (value: UserData | null) => void;
}>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const UserProvider = ({children}: {children: React.ReactNode}) => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getUser(); // Функция для получения данных пользователя по токену
          setCurrentUser(userData);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
    };

    fetchUser();
  }, []);
  const value = {currentUser, setCurrentUser};
    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}