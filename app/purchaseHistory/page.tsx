"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { fetchPurchaseHistory } from "@/app/lib/data";
import { Order } from "@/app/lib/interfaces/orderResponse";
import { OrderItem } from "@/app/lib/interfaces/orderItem";

export default function PurchaseHistoryPage() {
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "История заказов", path: "/purchaseHistory" },
  ];

  useEffect(() => {
    const getPurchaseHistory = async () => {
      try {
        const data = await fetchPurchaseHistory();
        if (data.success) {
          setHistory(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Не удалось загрузить историю заказов");
      } finally {
        setLoading(false);
      }
    };

    getPurchaseHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full bg-white min-h-[60vh] flex items-center justify-center">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-qyellow" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-qgray">Загрузка истории заказов...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full bg-white pb-[60px]">
          <div className="w-full bg-[#F6F6F6] py-[40px] mb-[30px]">
            <div className="container-x mx-auto">
              <h1 className="text-[30px] font-bold text-qblack mb-2">
                История заказов
              </h1>
              <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
            </div>
          </div>
          <div className="container-x mx-auto">
            <div className="w-full py-[60px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-qgray text-center mb-4">{error}</p>
              <Link href="/sendphone">
                <button className="h-[45px] px-6 bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-sm rounded transition-colors">
                  Войти в аккаунт
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="purchase-history-wrapper w-full bg-white pb-[60px]">
        {/* Page Header */}
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[30px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">
              История заказов
            </h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          {history.length === 0 ? (
            /* Empty State */
            <div className="w-full py-[100px] flex flex-col items-center justify-center">
              <div className="mb-8">
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-qgray"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-qblack mb-4">
                История заказов пуста
              </h2>
              <p className="text-qgray text-center mb-8 max-w-md">
                Вы еще не совершали покупок. Перейдите в каталог и выберите
                понравившиеся товары.
              </p>
              <Link href="/shop">
                <button className="h-[50px] px-8 bg-qyellow hover:bg-qyellow/90 text-qblack font-semibold text-sm rounded transition-colors">
                  Перейти в каталог
                </button>
              </Link>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-4">
              {history.map((order) => (
                <div
                  key={order.orderId}
                  className="border border-[#EDEDED] rounded-lg overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => toggleOrder(order.orderId)}
                    className="w-full px-6 py-4 bg-[#F6F6F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EDEDED] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-qgray">Заказ</span>
                        <span className="text-[14px] font-semibold text-qblack">
                          #{order.referenceId || order.orderId.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-qgray">от</span>
                        <span className="text-[14px] text-qblack">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[16px] font-bold text-qblack">
                        {order.totalPrice.toLocaleString()} ₸
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`transition-transform ${
                          expandedOrder === order.orderId ? "rotate-180" : ""
                        }`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {/* Order Details (Expanded) */}
                  {expandedOrder === order.orderId && (
                    <div className="px-6 py-5 border-t border-[#EDEDED]">
                      {/* Delivery Info */}
                      <div className="mb-5 pb-5 border-b border-[#EDEDED]">
                        <h4 className="text-[14px] font-semibold text-qblack mb-3">
                          Информация о доставке
                        </h4>
                        {order.isPickup ? (
                          <div className="space-y-1">
                            <p className="text-[13px] text-qgray">
                              <span className="font-medium text-qblack">
                                Способ:
                              </span>{" "}
                              Самовывоз
                            </p>
                            {order.pickupLocation && (
                              <p className="text-[13px] text-qgray">
                                <span className="font-medium text-qblack">
                                  Адрес:
                                </span>{" "}
                                {order.pickupLocation}
                              </p>
                            )}
                            {order.pickupHours && (
                              <p className="text-[13px] text-qgray">
                                <span className="font-medium text-qblack">
                                  Время:
                                </span>{" "}
                                {order.pickupHours}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-[13px] text-qgray">
                              <span className="font-medium text-qblack">
                                Способ:
                              </span>{" "}
                              Доставка курьером
                            </p>
                            {order.deliveryAddress && (
                              <p className="text-[13px] text-qgray">
                                <span className="font-medium text-qblack">
                                  Адрес:
                                </span>{" "}
                                {order.deliveryAddress}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <h4 className="text-[14px] font-semibold text-qblack mb-3">
                        Товары в заказе
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item: OrderItem) => (
                          <div
                            key={item.productId}
                            className="flex items-center justify-between py-3 px-4 bg-[#F9F9F9] rounded"
                          >
                            <div className="flex-1">
                              <p className="text-[14px] font-medium text-qblack">
                                {item.productName}
                              </p>
                              <p className="text-[12px] text-qgray">
                                {item.quantity} шт. x{" "}
                                {item.price.toLocaleString()} ₸
                              </p>
                            </div>
                            <p className="text-[14px] font-semibold text-qblack ml-4">
                              {item.totalPrice.toLocaleString()} ₸
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-end mt-4 pt-4 border-t border-[#EDEDED]">
                        <div className="text-right">
                          <span className="text-[13px] text-qgray">Итого:</span>
                          <span className="text-[18px] font-bold text-qblack ml-3">
                            {order.totalPrice.toLocaleString()} ₸
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
