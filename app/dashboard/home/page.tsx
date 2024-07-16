"use client";

import "@/app/dashboard/home/home.scss";
import { useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import SideBar from "../sidebar/SideBar";
import Widget from "../widget/Widget";

// Динамический импорт компонентов
const DynamicFeatured = dynamic(() => import("../featured/featured"), {
  loading: () => <p>Загрузка Featured...</p>
});
const DynamicChart = dynamic(() => import("../chart/chart"), {
  loading: () => <p>Загрузка Chart...</p>
});
const DynamicTable = dynamic(() => import("../table/table"), {
  loading: () => <p>Загрузка Table...</p>
});
const DynamicUsers = dynamic(() => import("../users/users"), {
  loading: () => <p>Загрузка Users...</p>
});
const DynamicSingle = dynamic(() => import("../single/single"), {
  loading: () => <p>Загрузка Single...</p>
});
const DynamicProducts = dynamic(() => import("../products/products"), {
  loading: () => <p>Загрузка Products...</p>
});

type PageType = "home" | "users" | "single" | "products";

export default function Page() {
  const [activePage, setActivePage] = useState<PageType>("home");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const renderPage = () => {
    switch (activePage) {
      case "users":
        return (
          <Suspense fallback={<div>Загрузка Users...</div>}>
            <DynamicUsers
              onViewUser={(id: string) => {
                setSelectedUser(id);
                setActivePage("single");
              }}
            />
          </Suspense>
        );
      case "single":
        return selectedUser ? (
          <Suspense fallback={<div>Загрузка Single...</div>}>
            <DynamicSingle userId={selectedUser} />
          </Suspense>
        ) : (
          <div>Выберите пользователя</div>
        );
      case "products":
        return (
          <Suspense fallback={<div>Загрузка Products...</div>}>
            <DynamicProducts />
          </Suspense>
        );
      case "home":
      default:
        return (
          <>
            <div className="widgets">
              <Widget type="categories" />
              <Widget type="user" />
              <Widget type="order" />
              <Widget type="balance" />
            </div>
            <div className="charts">
              <Suspense fallback={<div>Загрузка Featured...</div>}>
                <DynamicFeatured />
              </Suspense>
              <Suspense fallback={<div>Загрузка Chart...</div>}>
                <DynamicChart />
              </Suspense>
            </div>
            <div className="listContainer">
              <div className="listTitle">Последние транзакций</div>
              <Suspense fallback={<div>Загрузка Table...</div>}>
                <DynamicTable />
              </Suspense>
            </div>
          </>
        );
    }
  };

  return (
    <div className="home">
      <SideBar setActivePage={setActivePage} />
      <div className="homeContainer">{renderPage()}</div>
    </div>
  );
}