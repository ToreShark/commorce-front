import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SmsCodeForm from "./SmsCodeForm";
import { sendSmsCode } from "@/app/lib/data";

vi.mock("@/app/lib/data", () => ({
  sendSmsCode: vi.fn(),
  getUser: vi.fn().mockResolvedValue(null),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("Форма ввода кода", () => {
  beforeEach(() => {
    vi.mocked(sendSmsCode).mockResolvedValue({ success: true });
  });

  function renderForm() {
    render(<SmsCodeForm phoneNumber="+77011234567" />);
    return {
      input: screen.getByPlaceholderText("______"),
      submit: screen.getByRole("button", { name: /подтвердить|войти|продолжить/i }),
    };
  }

  it("принимает шесть цифр", async () => {
    const user = userEvent.setup();
    const { input, submit } = renderForm();

    await user.type(input, "123456");
    await user.click(submit);

    await waitFor(() =>
      expect(sendSmsCode).toHaveBeenCalledWith("+77011234567", "123456")
    );
  });

  it("не отправляет неполный код на сервер", async () => {
    const user = userEvent.setup();
    const { input, submit } = renderForm();

    await user.type(input, "1234");
    await user.click(submit);

    expect(await screen.findByText("Код состоит из 6 цифр")).toBeInTheDocument();
    expect(sendSmsCode).not.toHaveBeenCalled();
  });

  it("игнорирует буквы и лишние цифры при вводе", async () => {
    const user = userEvent.setup();
    const { input } = renderForm();

    await user.type(input, "12ab34cd5678");

    expect(input).toHaveValue("123456");
  });
});
