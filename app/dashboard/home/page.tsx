"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import SideBar from "../sidebar/SideBar";
import Widget from "../widget/Widget";

// Динамический импорт компонентов
const DynamicFeatured = dynamic(() => import("../featured/featured"), {
  loading: () => <p>Загрузка Featured...</p>,
});
const DynamicChart = dynamic(() => import("../chart/chart"), {
  loading: () => <p>Загрузка Chart...</p>,
});
const DynamicTable = dynamic(() => import("../table/table"), {
  loading: () => <p>Загрузка Table...</p>,
});
const DynamicUsers = dynamic(() => import("../users/users"), {
  loading: () => <p>Загрузка Users...</p>,
});
const DynamicSingle = dynamic(() => import("../single/single"), {
  loading: () => <p>Загрузка Single...</p>,
});
const DynamicProducts = dynamic(() => import("../products/products"), {
  loading: () => <p>Загрузка Products...</p>,
});
const DynamicOrders = dynamic(() => import("../order/orders"), {
  loading: () => <p>Загрузка Orders...</p>,
});
const DynamicStaticPages = dynamic(() => import("../staticpages/StaticPagesAdmin"), {
  loading: () => <p>Загрузка Pages...</p>,
});

type PageType = "home" | "users" | "single" | "products" | "orders" | "pages";

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
      case "orders":
        return (
          <Suspense fallback={<div>Загрузка Orders...</div>}>
            <DynamicOrders />
          </Suspense>
        );
      case "pages":
        return (
          <Suspense fallback={<div>Загрузка Pages...</div>}>
            <DynamicStaticPages />
          </Suspense>
        );
      case "home":
      default:
        return (
          <>
            {/* Widgets Row */}
            <div className="row">
              <div className="col-12">
                <div className="sherah-breadcrumb mg-top-30">
                  <h2 className="sherah-breadcrumb__title">Панель управления</h2>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="row mg-top-30">
              <Widget type="categories" />
              <Widget type="user" />
              <Widget type="order" />
              <Widget type="balance" />
            </div>

            {/* Charts Row */}
            <div className="row mg-top-30">
              <div className="col-lg-4 col-md-6 col-12">
                <Suspense fallback={<div>Загрузка Featured...</div>}>
                  <DynamicFeatured />
                </Suspense>
              </div>
              <div className="col-lg-8 col-md-6 col-12">
                <Suspense fallback={<div>Загрузка Chart...</div>}>
                  <DynamicChart />
                </Suspense>
              </div>
            </div>

            {/* Table */}
            <div className="row mg-top-30">
              <div className="col-12">
                <div className="sherah-table sherah-page-inner sherah-border sherah-default-bg mg-top-25">
                  <h3 className="sherah-table__title">Последние транзакции</h3>
                  <Suspense fallback={<div>Загрузка Table...</div>}>
                    <DynamicTable />
                  </Suspense>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* Sidebar */}
      <SideBar setActivePage={setActivePage} />

      {/* Header */}
      <header className="sherah-header">
        <div className="container g-0">
          <div className="row g-0">
            <div className="col-12">
              <div className="sherah-header__inner">
                <div className="sherah-header__middle">
                  <div className="sherah-header__left">
                    <div className="sherah-header__form">
                      <form className="sherah-header__form-inner" action="#">
                        <button className="search-btn" type="submit">
                          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.6888 18.2542C10.5721 22.0645 4.46185 20.044 1.80873 16.2993C-0.984169 12.3585 -0.508523 7.01726 2.99926 3.64497C6.41228 0.362739 11.833 0.112279 15.5865 3.01273C19.3683 5.93475 20.8252 11.8651 17.3212 16.5826C17.431 16.6998 17.5417 16.8246 17.6599 16.9437C19.6263 18.9117 21.5973 20.8751 23.56 22.8468C24.3105 23.601 24.0666 24.7033 23.104 24.9575C22.573 25.0972 22.1724 24.8646 21.8075 24.4988C19.9218 22.6048 18.0276 20.7194 16.1429 18.8245C15.9674 18.65 15.8314 18.4361 15.6888 18.2542ZM2.39508 10.6363C2.38758 14.6352 5.61109 17.8742 9.62079 17.8977C13.6502 17.9212 16.9018 14.6914 16.9093 10.6597C16.9169 6.64673 13.7046 3.41609 9.69115 3.39921C5.66457 3.38232 2.40259 6.61672 2.39508 10.6363Z" fill="currentColor"/>
                          </svg>
                        </button>
                        <input name="s" type="text" placeholder="Поиск..." />
                      </form>
                    </div>
                  </div>
                  <div className="sherah-header__right">
                    <div className="sherah-header__group">
                      <div className="sherah-header__author">
                        <div className="sherah-header__author-img">
                          <img src="/sherah/img/author.png" alt="Admin" />
                        </div>
                        <span className="sherah-header__author-name">Админ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="sherah-adashboard">
        <div className="container">
          {renderPage()}
        </div>
      </section>
    </>
  );
}
