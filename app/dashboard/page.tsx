"use client";

import { useContext, useEffect, useState } from "react";
import AuthContext from "../lib/AuthContext";
import { getCategories } from "../lib/data";

export default function Page() {
  const authContext = useContext(AuthContext);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    console.log("authContext", authContext);
    console.log("authContext.user", authContext?.user);
    const fetchCategories = async () => {
      if (authContext?.user) {
        try {
          const token = localStorage.getItem("accessToken");
          if (token) {
            const data = await getCategories(token);
            console.log("data", data);
            setCategories(data.categories);
          }
        } catch (error) {
          setError("Failed to load categories. Please try again later.");
        }
      }
    };

    fetchCategories();
  }, [authContext?.user]);

  console.log("categories", categories);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Dashboard Page</h1>
      <ul>
        {categories.map((category, index) => (
          <li key={index}>{category}</li>
        ))}
      </ul>
    </div>
  );
}