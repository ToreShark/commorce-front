// UserProfile.tsx
"use client"
import { useContext, useEffect, useState } from 'react';
import AuthContext, { UserData } from './AuthContext';
import { getUser, refreshToken } from './data';
import { getCookie } from './getRefreshToken';

const UserProfile = () => {
  const authContext = useContext(AuthContext);
  const [user, setUser] = useState<UserData | null>(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUser();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  
  return (
    <div>
      <h2>Профиль пользователя</h2>
      <p>Имя: {user?.firstName}</p>
      <p>Фамилия: {user?.lastName}</p>
      <p>Номер телефона: {user?.phone}</p>
      <p>Роль: {user?.roleId}</p>
    </div>
  );
};

export default UserProfile;