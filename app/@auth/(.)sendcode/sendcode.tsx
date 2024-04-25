"use client"
import { sendSmsCode } from "@/app/lib/data";
import { Modal } from "@/app/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";


interface SendCodeProps {
  phoneNumber: string;
}

export default function SendCode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phoneNumber") || "";
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  const [smsCode, setSmsCode] = useState('');

  useEffect(() => {
    dialogRef.current?.showModal();
    if (phoneNumber) {
      console.log("Переданный номер телефона: ", phoneNumber);
    }
  }, [phoneNumber]);

 


  const closeModal = () => {
    dialogRef.current?.close();
    router.back();
  };

  const handleSendCode = async () => {
    try {
      const hashedCode = localStorage.getItem('hashedCode');
      const salt = localStorage.getItem('salt');
  
      if (!hashedCode || !salt) {
        alert('Ошибка: hashedCode или salt не найдены в localStorage.');
        return;
      }
  
      const result = await sendSmsCode(phoneNumber, smsCode, hashedCode, salt);
  
      if (result.success) {
        // Очистка localStorage после успешного ответа
        localStorage.removeItem('phoneNumber');
        localStorage.removeItem('hashedCode');
        localStorage.removeItem('salt');
  
        router.push(result.redirectUrl);
        closeModal();
      } else {
        alert(`Ошибка: ${result.message}`);
      }
    } catch (error) {
      alert(`Ошибка: ${(error as Error).message}`);
    }
  };

  return (
    <dialog ref={dialogRef} onClose={closeModal} className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-3xl">
      <div className="p-32 flex items-center gap-4">
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