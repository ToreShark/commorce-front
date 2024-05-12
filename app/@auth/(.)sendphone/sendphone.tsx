"use client";
import { sendPhone } from "@/app/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SendPhoneProps {
  onSuccess: (phoneNumber: string) => void;
}

export default function SendPhone({ onSuccess }: SendPhoneProps) {
  const router = useRouter();
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeModal = () => {
    dialogRef.current?.close();
    router.back();
  };
  const handleSendPhone = async () => {
    try {
      const result = await sendPhone(phoneNumber);
      if (result.success) {
        localStorage.setItem("phoneNumber", result.phoneNumber);
        localStorage.setItem("hashedCode", result.hashedCode);
        localStorage.setItem("salt", result.salt);
        onSuccess(phoneNumber);
        router.push(`/sendcode?phoneNumber=${encodeURIComponent(phoneNumber)}`);
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
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+7700 000 00 000"
        />
        <Button type="submit" onClick={handleSendPhone}>
          Отправить номер
        </Button>
      </div>

      <Button variant="link" onClick={closeModal}>
        Закрыть
      </Button>
    </dialog>
  );
}
