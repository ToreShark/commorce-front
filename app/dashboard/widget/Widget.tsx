//app/dashboard/widget/Widget.tsx
"use client";
import AuthContext from "@/app/lib/AuthContext";
import { getCategories, getOrderCount, getOrderTotalPrice, getUsers } from "@/app/lib/data";
import { useContext, useEffect, useMemo, useState } from "react";
import { WidgetProps } from "./interface";
import Cookies from "js-cookie";

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
    let counter;
    let bgColor = "sherah-color1__bg";
    let iconSvg = "";

    switch (type) {
      case "categories":
        title = "Категории";
        counter = data.categories.length;
        bgColor = "sherah-color1__bg";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6v6H4z"/><path d="M14 4h6v6h-6z"/><path d="M4 14h6v6H4z"/><path d="M14 14h6v6h-6z"/></svg>`;
        break;
      case "user":
        title = "Пользователи";
        counter = data.users.length;
        bgColor = "sherah-color3__bg";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        break;
      case "order":
        title = "Заказы";
        counter = data.totalOrders;
        bgColor = "sherah-color2__bg";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
        break;
      case "balance":
        title = "Общая сумма";
        counter = `${data.totalOrderPrice.toLocaleString()} ₸`;
        bgColor = "sherah-color4__bg";
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
        break;
      default:
        title = "Unknown Widget";
        counter = 0;
    }

    return { title, counter, bgColor, iconSvg };
  }, [type, data]);


  if (loading) {
    return (
      <div className="col-lg-3 col-md-6 col-12">
        <div className="sherah-progress-card sherah-default-bg mg-top-25">
          <div className="sherah-progress-card__content">
            <p className="sherah-progress-card__title">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-lg-3 col-md-6 col-12">
        <div className="sherah-progress-card sherah-default-bg mg-top-25">
          <div className="sherah-progress-card__content">
            <p className="sherah-progress-card__title">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-lg-3 col-md-6 col-12">
      <div className={`sherah-progress-card ${memoizedData.bgColor} sherah-border mg-top-25`}>
        <div className="sherah-progress-card__icon sherah-default-bg sherah-border" dangerouslySetInnerHTML={{ __html: memoizedData.iconSvg }}>
        </div>
        <div className="sherah-progress-card__content">
          <div className="sherah-progress-card__heading">
            <p className="sherah-progress-card__title">{memoizedData.title}</p>
            <h4 className="sherah-progress-card__number">{memoizedData.counter}</h4>
          </div>
          <div className="sherah-progress-card__percent">
            <span className="sherah-progress-card__amount sherah-color1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2L10 7H2L6 2Z" fill="currentColor"/>
              </svg>
              +20%
            </span>
            <span className="sherah-progress-card__text">за месяц</span>
          </div>
        </div>
      </div>
    </div>
  );
}
