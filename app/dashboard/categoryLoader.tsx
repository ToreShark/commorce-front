"use client";

import { useContext, useEffect, useState } from "react";
import AuthContext from "../lib/AuthContext";
import { getCategories } from "../lib/data";

export default function CategoryLoader() {
  const authContext = useContext(AuthContext);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      if (authContext?.user) {
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            const data = await getCategories(token);
            setCategories(data.categories);
          }
        } catch (error) {
          setError("Failed to load categories. Please try again later.");
        }
      }
    };

    fetchCategories();
  }, [authContext?.user]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <ul>
      {categories.map((category, index) => (
        <li key={index}>{category}</li>
      ))}
    </ul>
  );
}