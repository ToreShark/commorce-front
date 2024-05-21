"use client";
import { getUser, sendSmsCodeOrder } from "@/app/lib/data";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const router = useRouter();

  const dialogRef = useRef<React.ElementRef<"dialog">>(null);

  useEffect(() => {
    console.log("isOpen", isOpen);
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

        onClose();

        if (redirectUrl) {
          router.push(redirectUrl);
        }
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
  );
}
