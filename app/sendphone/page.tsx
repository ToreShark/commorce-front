// app/sendphone/page.tsx
"use client";
import SendPhone from "../@auth/(.)sendphone/sendphone";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const handleSuccess = (phoneNumber: string) => {
    router.push(`/sendcode?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  };

  return (
    <>
      <SendPhone onSuccess={handleSuccess} />
    </>
  );
}
