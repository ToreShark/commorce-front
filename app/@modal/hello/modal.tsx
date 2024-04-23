// app/@modal/hello/modal.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Modal() {
  const router = useRouter();
  const dialogRef = useRef<React.ElementRef<"dialog">>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeModal = () => {
    dialogRef.current?.close();
    router.back();
  };

  return (
    <dialog ref={dialogRef} onClose={closeModal} className="backdrop:bg-black/60 backdrop:backdrop-blur-sm text-3xl">
      <div className="p-32">Привет, мир!</div>
      <Button variant="link" onClick={closeModal}>Закрыть</Button>
    </dialog>
  );
}
