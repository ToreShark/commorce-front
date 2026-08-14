/**
 * Код подтверждения из WhatsApp.
 *
 * Длина совпадает с VerificationCodeGenerator.Length на бэкенде: код шестизначный,
 * это 900 000 комбинаций против 9 000 у четырёхзначного при тех же трёх попытках ввода.
 */

export const OTP_CODE_LENGTH = 6;

/** Оставляет только цифры и обрезает до длины кода. */
export function sanitizeOtpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
}

/** Готов ли код к отправке на сервер. Сверяет код только бэкенд. */
export function isCompleteOtp(code: string): boolean {
  return new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`).test(code);
}
