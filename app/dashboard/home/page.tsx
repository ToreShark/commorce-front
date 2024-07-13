//app/dashboard/home/page.tsx
"use client";
import "@/app/dashboard/home/home.scss";
import { useState } from "react";
import Chart from "../chart/chart";
import Featured from "../featured/featured";
import Products from "../products/products";
import SideBar from "../sidebar/SideBar";
import Single from "../single/single";
import Table from "../table/table";
import Users from "../users/users";
import Widget from "../widget/Widget";

type PageType = "home" | "users" | "single";

export default function Page() {
  const [activePage, setActivePage] = useState("home");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const renderPage = () => {
    switch (activePage) {
      case "users":
        return <Users onViewUser={(id: string) => {
          setSelectedUser(id);
          setActivePage("single");
        }}/>;
      case "single":
        return selectedUser ? <Single userId={selectedUser} /> : <div>Выберите пользователя</div>;
      case "products": // Добавляем case для страницы products
        return <Products />;
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
              <Featured />
              <Chart />
            </div>
            <div className="listContainer">
              <div className="listTitle">Последние транзакций</div>
              <Table />
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
