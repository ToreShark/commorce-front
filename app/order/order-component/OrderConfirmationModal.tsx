"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Order } from "@/app/lib/interfaces/orderResponse";



export default function OrderConfirmationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
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
        <h1>Hello World!</h1>
        <Button variant="link" onClick={closeModal}>
          Закрыть
        </Button>
      </div>
    </dialog>
  );
}