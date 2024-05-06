"use client";
import {createContext, useEffect, useState} from 'react';
import { getUser } from './data';

export const UserContext = createContext({
  currentUser: null,
  setCurrentUser: (value: any) => {},
})

export const UserProvider = ({children}: {children: React.ReactNode}) => {
  const [currentUser, setCurrentUser] = useState(null);
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