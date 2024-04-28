"use client";
import AuthContext from "@/app/lib/AuthContext";
import { getUser, sendSmsCode } from "@/app/lib/data";
import { getCookie, setCookie } from "@/app/lib/getRefreshToken";
import { Modal } from "@/app/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";

interface SendCodeProps {
  phoneNumber: string;
}

export default function SendCode() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phoneNumber") || "";
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  const [smsCode, setSmsCode] = useState("");
  const [shouldSendCode, setShouldSendCode] = useState(false);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // Обработка случая, когда контекст не был предоставлен
    return null;
  }

  const { setUserInAuthContext } = authContext;

  useEffect(() => {
    dialogRef.current?.showModal();
    if (phoneNumber) {
      console.log("Переданный номер телефона: ", phoneNumber);
    }
  }, [phoneNumber]);

  const closeModal = () => {
    dialogRef.current?.close();
    router.push("/");
  };

  const handleSendCode = async () => {
    try {
      const hashedCode = localStorage.getItem("hashedCode");
      const salt = localStorage.getItem("salt");
      if (!hashedCode || !salt) {
        alert("Ошибка: hashedCode или salt не найдены в localStorage.");
        return;
      }

      const result = await sendSmsCode(phoneNumber, smsCode, hashedCode, salt);
      if (result.token) {
        localStorage.removeItem("phoneNumber");
        localStorage.removeItem("hashedCode");
        localStorage.removeItem("salt");

        sessionStorage.setItem('token', result.token);

        console.log("refreshToken", document.cookie); 
        
        const userData = await getUser();
        console.log("User data:", userData);
        setUserInAuthContext(userData);
        closeModal();
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
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-3xl"
    >
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
