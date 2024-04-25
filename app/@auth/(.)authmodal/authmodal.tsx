// app/(.)authmodal/AuthModal.tsx
"use client";

import { useState } from "react";
import SendCode from "../(.)sendcode/sendcode";
import SendPhone from "../(.)sendphone/sendphone";

export default function AuthModal() {
  const [showSendCode, setShowSendCode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSendPhoneSuccess = (phoneNumber: string) => {
    setPhoneNumber(phoneNumber);
    setShowSendCode(true);
  };

  return (
    <>
      {!showSendCode && <SendPhone onSuccess={handleSendPhoneSuccess} />}
      {showSendCode && <SendCode />}
    </>
  );
}