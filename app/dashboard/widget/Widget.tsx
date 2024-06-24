//app/dashboard/widget/page.tsx
"use client";
import "@/app/dashboard/widget/widget.scss";
import AuthContext from "@/app/lib/AuthContext";
import { getCategories, getUsers } from "@/app/lib/data";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useContext, useEffect, useState } from "react";
import { WidgetProps } from "./interface";
import Cookies from "js-cookie";

export default function Widget({ type }: WidgetProps) {
  const authContext = useContext(AuthContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authContext?.user) {
        try {
          const token = Cookies.get("token");
          if (token) {
            let result;
            switch (type) {
              case "categories":
                const response = await getCategories(token);
                result = response.categories;
                break;
              case "user":
                const usersResponse = await getUsers(token);
                result = usersResponse.users;
                break;
              // Add other cases for different widget types here
              default:
                result = [];
            }
            setData(result);
          }
        } catch (error) {
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [authContext?.user, type]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  let title = "";
  let linkText = "";
  switch (type) {
    case "categories":
      title = "Категории";
      linkText = "Увидеть все категории";
      break;
    case "user":
      title = "Пользователи";
      linkText = "Увидеть всех пользователей";
      break;
    default:
      title = "Unknown Widget";
      linkText = "";
  }
  const counter = data.length;

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{title}</span>
        <span className="counter">{counter}</span>
        <span className="link">{linkText}</span>
      </div>
      <div className="right">
        <div className="widget-percentage positive">
          <KeyboardArrowUpIcon />
          20%
        </div>
        <PersonOutlineIcon className="icon" />
      </div>
    </div>
  );
}
