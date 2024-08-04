"use client";
import { fetchOk, fetchOrderDetails, getUser, sendSmsCodeOrder } from "@/app/lib/data";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OrderConfirmationModal from "./OrderConfirmationModal";
import { OrderDataViewModel } from "@/app/lib/interfaces/OrderDataViewModel.interface";

export default function OrderSendCodeModal({
  phoneNumber,
  isOpen,
  onClose,
}: {
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [smsCode, setSmsCode] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<OrderDataViewModel | null>(null);;
  const router = useRouter();

  const dialogRef = useRef<React.ElementRef<"dialog">>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const closeModal = () => {
    dialogRef.current?.close();
    router.push("/");
  };

  const handleSendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const hashedCode = localStorage.getItem("hashedCode");
      const salt = localStorage.getItem("salt");
      const orderId = localStorage.getItem("orderId");
      const uniqueCode = localStorage.getItem("deliveryType");
      const redirectUrl = localStorage.getItem("redirectUrl") || "";

      if (!hashedCode || !salt || !orderId || !uniqueCode) {
        alert("Ошибка: необходимые данные не найдены в localStorage.");
        return;
      }

      let region, city, street, houseNumber;

      if (uniqueCode === "Courier") {
        region = localStorage.getItem("region") || undefined;
        city = localStorage.getItem("city") || undefined;
        street = localStorage.getItem("street") || undefined;
        houseNumber = localStorage.getItem("houseNumber") || undefined;
      }

      const result = await sendSmsCodeOrder(
        phoneNumber,
        smsCode,
        salt,
        hashedCode,
        orderId,
        uniqueCode,
        region,
        city,
        street,
        houseNumber,
        redirectUrl
      );

      if (result.success) {
        const orderDetails = await fetchOrderDetails(orderId);
        setOrderData(orderDetails);
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");
        localStorage.removeItem("orderId");
        localStorage.removeItem("deliveryType");
        localStorage.removeItem("redirectUrl");

        if (uniqueCode === "Courier") {
          localStorage.removeItem("region");
          localStorage.removeItem("city");
          localStorage.removeItem("street");
          localStorage.removeItem("houseNumber");
        }
        
        // onClose();
        setIsConfirmationModalOpen(true);

        // if (redirectUrl) {
        //   router.push(redirectUrl);
        // } else {
        //   router.push("/basket");
        // }
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      alert(`Ошибка: ${(error as Error).message}`);
    }
  };

  return (
    <>
    <dialog
      ref={dialogRef}
      onClose={closeModal}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-lg sm:text-xl lg:text-3xl"
    >
      <div className="p-4 sm:p-8 md:p-16 flex flex-col sm:flex-row items-center gap-4 justify-center">
        <Input
          type="text"
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
          placeholder="Введите код из SMS"
        />
        <Button type="submit" onClick={handleSendCode}>
          Отправить код
        </Button>
      </div>
      <Button variant="link" onClick={closeModal}>
        Закрыть
      </Button>
    </dialog>
    {isConfirmationModalOpen && (
        <OrderConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={onClose}
          orderData={orderData}
        />
      )}
    </>
  );
}
