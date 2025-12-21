"use client";

import { useContext, useCallback } from "react";
import { CartContext } from "@/app/lib/CartContext";
import { fetchCartInfo } from "@/app/lib/data";
import Layout from "@/app/components/Layout";
import { Breadcrumb } from "@/app/components/Shop";
import { CartTable, CartSummary, EmptyCart } from "@/app/components/Cart";

export default function BasketPage() {
  const { cartItems, setCartItems, cartCount, setCartCount, totalPrice, setTotalPrice } =
    useContext(CartContext);

  const breadcrumbPaths = [
    { name: "Главная", path: "/" },
    { name: "Корзина", path: "/basket" },
  ];

  const handleCartUpdate = useCallback(async () => {
    const cartInfo = await fetchCartInfo();
    if (cartInfo) {
      setCartItems(cartInfo.items);
      setCartCount(cartInfo.totalCount);
      setTotalPrice(cartInfo.totalPrice);
    }
  }, [setCartItems, setCartCount, setTotalPrice]);

  const isEmpty = !cartItems || cartItems.length === 0;

  return (
    <Layout>
      <div className="cart-page-wrapper w-full bg-white pb-[60px]">
        {/* Page Header */}
        <div className="w-full bg-[#F6F6F6] py-[40px] mb-[30px]">
          <div className="container-x mx-auto">
            <h1 className="text-[30px] font-bold text-qblack mb-2">Корзина</h1>
            <Breadcrumb paths={breadcrumbPaths} className="mb-0" />
          </div>
        </div>

        <div className="container-x mx-auto">
          {isEmpty ? (
            <EmptyCart />
          ) : (
            <>
              {/* Cart Table */}
              <CartTable
                items={cartItems}
                onUpdate={handleCartUpdate}
                className="mb-[30px]"
              />

              {/* Cart Summary */}
              <div className="w-full flex sm:justify-end">
                <CartSummary totalPrice={totalPrice} itemCount={cartCount} />
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
