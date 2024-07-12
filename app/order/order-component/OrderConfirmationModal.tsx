"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Order } from "@/app/lib/interfaces/orderResponse";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

export default function OrderConfirmationModal({
  isOpen,
  onClose,
  orderData,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderData: OrderDataViewModel | null;
}) {
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else if (dialogRef.current?.open) {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const closeModal = () => {
    dialogRef.current?.close();
    onClose();
    const redirectUrl = localStorage.getItem("redirectUrl") || "";

    if (redirectUrl) {
      router.push(redirectUrl);
    } else {
      router.push("/basket");
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-lg sm:text-xl lg:text-3xl"
    >
      <div className="p-4 sm:p-8 md:p-16 flex flex-col items-center gap-4 justify-center">
        <h1>Подтверждение заказа</h1>
        {orderData ? (
          <div className="text-left">
            <p>
              <strong>Дата и время оформления заказа:</strong>{" "}
              {new Date(orderData.orderDate).toLocaleString()}
            </p>
            {orderData.delivery ? (
              <>
                <p>
                  <strong>Метод доставки:</strong>{" "}
                  {orderData.delivery.description}
                </p>
                {orderData.delivery.uniqueCode === "Courier" &&
                  orderData.deliveryAddress && (
                    <>
                      <p>
                        <strong>Адрес доставки:</strong>
                      </p>
                      <p>
                        {orderData.deliveryAddress.region},{" "}
                        {orderData.deliveryAddress.city}
                      </p>
                      <p>
                        {orderData.deliveryAddress.street},{" "}
                        {orderData.deliveryAddress.houseNumber}
                      </p>
                    </>
                  )}
              </>
            ) : (
              <p>
                <strong>Метод доставки:</strong> Не указано
              </p>
            )}
            <p>
              <strong>Метод оплаты:</strong>{" "}
              {orderData.payment ? orderData.payment.description : "Не указано"}
            </p>
            <h2>Товары в заказе:</h2>
            <ul>
              {orderData.items.map(item => (
                <li key={item.productId}>
                  <p><strong>Название:</strong> {item.productName}</p>
                  <p><strong>Количество:</strong> {item.quantity}</p>
                  <p><strong>Цена за единицу:</strong> {item.price}</p>
                  <p><strong>Общая цена:</strong> {item.itemTotalPrice}</p>
                </li>
              ))}
            </ul>
            <p><strong>Общая сумма заказа:</strong> {orderData.totalPrice}</p>
          </div>
        ) : (
          <p>Загрузка деталей заказа...</p>
        )}
        <Button variant="link" onClick={closeModal}>
          Закрыть
        </Button>
      </div>
    </dialog>
  );
}
