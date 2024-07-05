//app/dashboard/home/page.tsx
"use client";
import "@/app/dashboard/home/home.scss";
import { useState } from "react";
import Chart from "../chart/chart";
import Featured from "../featured/featured";
import SideBar from "../sidebar/SideBar";
import Table from "../table/table";
import Users from "../users/users";
import Widget from "../widget/Widget";
export default function Page() {
  const [activePage, setActivePage] = useState("home");

  const renderPage = () => {
    switch (activePage) {
      case "users":
        return <Users />;
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
