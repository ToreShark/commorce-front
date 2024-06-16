// useUserData.ts
import { UserData } from '@/app/lib/AuthContext';
import { getUser } from '@/app/lib/data';
import { useState, useEffect } from 'react';

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUser();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { userData, loading, error };
}