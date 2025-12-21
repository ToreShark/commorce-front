"use client";

import { AuthLayout, PhoneAuthForm } from "@/app/components/Auth";

export default function SendPhonePage() {
  return (
    <AuthLayout
      title="Вход в аккаунт"
      subtitle="Введите номер телефона для получения кода"
    >
      <PhoneAuthForm />
    </AuthLayout>
  );
}
