import { describe, expect, it } from "vitest";
import { OTP_CODE_LENGTH, isCompleteOtp, sanitizeOtpInput } from "./otp";

describe("Код подтверждения", () => {
  it("шестизначный, как и на бэкенде", () => {
    expect(OTP_CODE_LENGTH).toBe(6);
  });

  it("оставляет только цифры", () => {
    expect(sanitizeOtpInput("12a3b4")).toBe("1234");
    expect(sanitizeOtpInput("12 34-56")).toBe("123456");
    expect(sanitizeOtpInput("абв")).toBe("");
  });

  it("обрезает лишние цифры при вставке из буфера", () => {
    expect(sanitizeOtpInput("1234567890")).toBe("123456");
  });

  it("считает готовым только полный код", () => {
    expect(isCompleteOtp("123456")).toBe(true);
    expect(isCompleteOtp("12345")).toBe(false);
    expect(isCompleteOtp("1234567")).toBe(false);
    expect(isCompleteOtp("")).toBe(false);
  });

  it("не принимает четырёхзначный код", () => {
    // До перехода на 6 цифр форма пропускала такой код на сервер
    expect(isCompleteOtp("1234")).toBe(false);
  });
});
