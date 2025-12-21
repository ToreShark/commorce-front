"use client";

import { useContext, useState } from "react";
import { CartContext } from "@/app/lib/CartContext";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import {
  CheckoutForm,
  CheckoutOrderSummary,
  SmsVerificationModal,
} from "@/app/components/Checkout";
import Link from "next/link";

export default function OrderPage() {
  const { cartItems, totalPrice } = useContext(CartContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("Pickup");

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Корзина", path: "/basket" },
    { name: "Оформление заказа", path: "/order" },
  ];

  const handleOrderSubmit = (phone: string) => {
    setPhoneNumber(phone);
    setIsModalOpen(true);
  };

  const isEmpty = !cartItems || cartItems.length === 0;

  if (isEmpty) {
    return (
      <Layout>
        <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
          {/* Page Header */}
          <div className="w-full bg-[#F6F6F6] py-[40px] mb-[30px]">
            <div className="container-x mx-auto">
              <h1 className="text-[30px] font-bold text-qblack mb-2">
                Оформление заказа
              </h1>
              <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
            </div>
          </div>

          {/* Empty Cart State */}
          <div className="container-x mx-auto">
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
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-qblack mb-4">
                Корзина пуста
              </h2>

              <p className="text-qgray text-center mb-8 max-w-md">
                Добавьте товары в корзину, чтобы оформить заказ.
              </p>

              <Link href="/shop">
                <button
                  type="button"
                  className="h-[50px] px-8 bg-qyellow hover:bg-qyellow/90 text-qblack font-semibold text-sm rounded transition-colors flex justify-center items-center"
                >
                  Перейти в каталог
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
      <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
        {/* Page Header */}
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[30px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">
              Оформление заказа
            </h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          <div className="w-full lg:flex lg:gap-[30px]">
            {/* Left Column - Checkout Form */}
            <div className="lg:w-[65%] w-full mb-8 lg:mb-0">
              <CheckoutForm
                onOrderSubmit={handleOrderSubmit}
                onDeliveryMethodChange={setDeliveryMethod}
              />
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:w-[35%] w-full">
              <div className="sticky top-[100px]">
                <CheckoutOrderSummary
                  items={cartItems}
                  totalPrice={totalPrice}
                  deliveryMethod={deliveryMethod}
                />

                {/* Security Badge */}
                <div className="mt-6 p-4 bg-[#F6F6F6] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-qblack">
                        Безопасная оплата
                      </p>
                      <p className="text-[12px] text-qgray">
                        Ваши данные защищены
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SMS Verification Modal */}
      {isModalOpen && (
        <SmsVerificationModal
          phoneNumber={phoneNumber}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Layout>
  );
}
