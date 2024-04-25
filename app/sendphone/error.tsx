// File: sendphone/error.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  errorMessage?: string;
}

export default function ErrorPage({ errorMessage = "An unknown error has occurred." }: ErrorPageProps) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Возвращение на предыдущую страницу
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-4 text-center">
        <h1 className="mb-4 text-xl font-semibold text-red-500">Error</h1>
        <p className="mb-4">{errorMessage}</p>
        <Button onClick={handleGoBack} variant="outline">
          Go Back
        </Button>
      </div>
    </div>
  );
}
