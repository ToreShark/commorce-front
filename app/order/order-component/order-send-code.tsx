"use client";
import { useEffect, useRef } from "react";
export default function OrderSendCodeModal() {
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-lg sm:text-xl lg:text-3xl"
    >
      <div className="p-4 sm:p-8 md:p-16 flex items-center justify-center">
        <p>Hello World!</p>
      </div>
    </dialog>
  );
}
