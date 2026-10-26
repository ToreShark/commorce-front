import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PromoAdmin from "./PromoAdmin";
import { allowedActions, type AdminEntry } from "@/app/lib/promo/admin";

const entry = (over: Partial<AdminEntry> = {}): AdminEntry => ({
  entryId: "11111111-1111-1111-1111-111111111111",
  place: 1,
  label: "7Q4K",
  amount: 118000,
  status: "Pending",
  removedReason: null,
  needsReview: false,
  returnRequestedAt: null,
  orderId: "aaaaaaaa-0000-0000-0000-000000000000",
  customerName: "Айгерим С.",
  phone: "+77011234567",
  deliveryMethod: "cdek_pvz",
  paidAt: "2026-11-02T10:00:00Z",
  deliveredAt: null,
  activatesAt: null,
  updatedAt: "2026-11-02T10:00:00Z",
  ...over,
});

const check = {
  canFinalize: false,
  alreadyFinalized: false,
  finalizableFrom: "2027-01-13T18:59:59Z",
  problems: ["Запись 7Q4K в первой пятёрке ещё на проверке"],
  top: [],
};

type Route = (url: string, init?: RequestInit) => { status?: number; body: unknown } | undefined;

function mockFetch(route: Route) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const hit = route(url, init) ?? (url.includes("FinalizeCheck")
      ? { body: check }
      : url.includes("GetWinners")
        ? { body: [] }
        : { body: [] });
    return new Response(JSON.stringify(hit.body), { status: hit.status ?? 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  document.cookie = "token=test-token";
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
});

describe("allowedActions", () => {
  it("снятой записи — только восстановить", () => {
    expect(allowedActions(entry({ status: "Removed" }))).toEqual(["restore"]);
  });

  it("открытое обращение — решение вместо нового запроса", () => {
    const actions = allowedActions(entry({ returnRequestedAt: "2026-11-05T00:00:00Z" }));
    expect(actions).toContain("resolveReturn");
    expect(actions).not.toContain("requestReturn");
  });

  it("подтверждённой — без запроса на возврат и без «выдан», если дата уже стоит", () => {
    const actions = allowedActions(entry({ status: "Confirmed", deliveredAt: "2026-11-04T00:00:00Z" }));
    expect(actions).toEqual(["remove"]);
  });

  it("«Проверено» только при флаге опта", () => {
    expect(allowedActions(entry())).not.toContain("reviewed");
    expect(allowedActions(entry({ needsReview: true }))).toContain("reviewed");
  });
});

describe("Раздел «Акция»", () => {
  it("показывает записи и проблемы итогов", async () => {
    mockFetch((url) => (url.includes("GetEntries") ? { body: [entry({ needsReview: true })] } : undefined));

    render(<PromoAdmin />);

    expect(await screen.findByText("7Q4K")).toBeInTheDocument();
    expect(screen.getByText("Опт — нужна проверка")).toBeInTheDocument();
    expect(await screen.findByText(check.problems[0])).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Подвести итоги" })).toBeDisabled();
  });

  it("фильтр «Нужна проверка» уходит в запрос", async () => {
    const fetchMock = mockFetch(() => undefined);
    render(<PromoAdmin />);

    await userEvent.click(await screen.findByRole("button", { name: "Нужна проверка" }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([u]) => String(u).includes("GetEntries?slug=pokupatel-mesyaca&needsReview=true"))).toBe(true)
    );
  });

  it("без комментария действие не отправляется", async () => {
    const fetchMock = mockFetch((url) => (url.includes("GetEntries") ? { body: [entry()] } : undefined));
    render(<PromoAdmin />);

    await userEvent.click(await screen.findByRole("button", { name: "Снять" }));
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(screen.getByRole("alert")).toHaveTextContent("комментарий");
    expect(fetchMock.mock.calls.some(([u]) => String(u).includes("RemoveEntry"))).toBe(false);
  });

  it("снятие уходит с причиной и комментарием, ошибка бэкенда видна текстом", async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes("GetEntries")) return { body: [entry()] };
      if (url.includes("RemoveEntry")) return { status: 400, body: { success: false, error: "Запись уже снята." } };
      return undefined;
    });
    render(<PromoAdmin />);

    await userEvent.click(await screen.findByRole("button", { name: "Снять" }));
    await userEvent.selectOptions(screen.getByLabelText("Причина"), "Fraud");
    await userEvent.type(screen.getByLabelText("Комментарий"), "два номера");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Запись уже снята.");
    const call = fetchMock.mock.calls.find(([u]) => String(u).includes("RemoveEntry"));
    expect(call?.[1]?.method).toBe("POST");
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({
      entryId: entry().entryId,
      reason: "Fraud",
      comment: "два номера",
    });
    const headers = call?.[1]?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer test-token");
  });

  it("подвести итоги — только после второго нажатия", async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes("FinalizeCheck")) return { body: { ...check, canFinalize: true, problems: [] } };
      if (url.includes("Finalize")) return { body: { success: true, winners: [] } };
      return undefined;
    });
    render(<PromoAdmin />);

    await userEvent.click(await screen.findByRole("button", { name: "Подвести итоги" }));
    expect(fetchMock.mock.calls.some(([u, i]) => String(u).endsWith("/Finalize") && i?.method === "POST")).toBe(false);

    const section = screen.getByRole("heading", { name: "Итоги" }).parentElement!;
    await userEvent.click(within(section).getByRole("button", { name: /Да, подвести итоги/ }));

    await waitFor(() =>
      expect(fetchMock.mock.calls.some(([u, i]) => String(u).endsWith("/Finalize") && i?.method === "POST")).toBe(true)
    );
  });
});
