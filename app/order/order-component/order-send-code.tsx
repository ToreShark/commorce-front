"use client";
import AuthContext from "@/app/lib/AuthContext";
import { getUser, sendSmsCodeOrder } from "@/app/lib/data";
import { useContext, useEffect, useRef, useState } from "react";

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

  const dialogRef = useRef<React.ElementRef<"dialog">>(null);

  useEffect(() => {
    console.log("isOpen", isOpen);
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleSendCode = async () => {
    try {
      const hashedCode = localStorage.getItem("hashedCode");
      const salt = localStorage.getItem("salt");
      const orderId = localStorage.getItem("orderId");
      const uniqueCode = localStorage.getItem("deliveryType");

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
        houseNumber
      );

      if (result.success) {
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");
        localStorage.removeItem("orderId");
        localStorage.removeItem("deliveryType");

        if (uniqueCode === "Courier") {
          localStorage.removeItem("region");
          localStorage.removeItem("city");
          localStorage.removeItem("street");
          localStorage.removeItem("houseNumber");
        }

        onClose();
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      alert(`Ошибка: ${(error as Error).message}`);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-lg sm:text-xl lg:text-3xl"
    >
      <div className="p-4 sm:p-8 md:p-16 flex items-center justify-center">
        <p>Hello World!</p>
      </div>
      <div className="p-4 sm:p-8 md:p-16 flex items-center justify-center">
        <input
          type="text"
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
          placeholder="Введите код из SMS"
          required
        />
        <button onClick={handleSendCode}>Подтвердить</button>
      </div>
    </dialog>
  );
}
