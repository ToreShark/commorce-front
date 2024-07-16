//app/dashboard/widget/page.tsx
"use client";
import "@/app/dashboard/widget/widget.scss";
import AuthContext from "@/app/lib/AuthContext";
import { getCategories, getOrderCount, getOrderTotalPrice, getUsers } from "@/app/lib/data";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useContext, useEffect, useMemo, useState } from "react";
import { WidgetProps } from "./interface";
import Cookies from "js-cookie";
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function Widget({ type }: WidgetProps) {
  const authContext = useContext(AuthContext);
  const [data, setData] = useState<{
    categories: any[],
    users: any[],
    totalOrders: number,
    totalOrderPrice: number
  }>({
    categories: [],
    users: [],
    totalOrders: 0,
    totalOrderPrice: 0
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authContext?.user) {
        try {
          const token = Cookies.get("token");
          if (token) {
            const [categoriesResponse, usersResponse, orderCountResponse, orderTotalPriceResponse] = await Promise.all([
              getCategories(token),
              getUsers(token),
              getOrderCount(token),
              getOrderTotalPrice(token)
            ]);
    
            setData({
              categories: categoriesResponse.categories,
              users: usersResponse.users,
              totalOrders: orderCountResponse.totalOrders,
              totalOrderPrice: orderTotalPriceResponse.totalOrderPrice
            });
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

  const memoizedData = useMemo(() => {
    let title = "";
    let linkText = "";
    let counter;
    let IconComponent = PersonOutlineIcon;
  
    switch (type) {
      case "categories":
        title = "Категории";
        linkText = "Увидеть все категории";
        counter = data.categories.length;
        IconComponent = CategoryIcon;
        break;
      case "user":
        title = "Пользователи";
        linkText = "Увидеть всех пользователей";
        counter = data.users.length;
        IconComponent = PersonOutlineIcon;
        break;
      case "order":
        title = "Заказы";
        linkText = "Увидеть все заказы";
        counter = data.totalOrders;
        IconComponent = ShoppingCartCheckoutIcon;
        break;
      case "balance":
        title = "Общая сумма заказов";
        linkText = "Увидеть все заказы";
        counter = data.totalOrderPrice;
        IconComponent = AccountBalanceWalletIcon;
        break;
      default:
        title = "Unknown Widget";
        linkText = "";
        counter = 0;
    }
  
    return { title, linkText, counter, IconComponent };
  }, [type, data]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="widget">
      <div className="left">
        <span className="title">{memoizedData.title}</span>
        <span className="counter">{memoizedData.counter}</span>
        <span className="link">{memoizedData.linkText}</span>
      </div>
      <div className="right">
        <div className="widget-percentage positive">
          <KeyboardArrowUpIcon />
          20%
        </div>
        <memoizedData.IconComponent className="icon" />
      </div>
    </div>
  );
}
