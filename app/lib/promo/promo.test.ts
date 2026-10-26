import { afterEach, describe, expect, it, vi } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { formatKzt, formatShortDate, formatLongDate, isFrozen, timeLeft } from "./format";
import { parseLeaderboard, parsePromoConfig, parsePromoMe, isRunning } from "./api";
import { computeOffset } from "./clock";
import { PROMO_CONFIG } from "./config";
import { getPromoData, mergeConfig, PRIZE_PLACEHOLDER } from "./data";
import { interleave } from "./products";
import { getPromoRules } from "./rules";
import type { Product } from "@/app/lib/interfaces/product.interface";

const NBSP = /[  ]/g;

describe("форматирование", () => {
  it("сумма в тенге с пробелами-разделителями", () => {
    expect(formatKzt(118000).replace(NBSP, " ")).toBe("118 000 ₸");
  });

  it("даты по Алматы, а не по UTC", () => {
    // 20:00 UTC 12.11 — уже 01:00 13.11 в Алматы
    expect(formatShortDate("2026-11-12T20:00:00Z")).toBe("13.11");
    expect(formatLongDate("2026-12-30T23:59:59+05:00")).toBe("30 декабря");
  });

  it("остаток времени", () => {
    expect(timeLeft(1000, 2000)).toBeNull();
    expect(timeLeft(90_061_000, 0)).toEqual({ days: 1, hours: 1, minutes: 1, seconds: 1 });
  });
});

describe("заморозка табло", () => {
  const config = { ...PROMO_CONFIG, endsAt: "2026-11-30T23:59:59+05:00", freezeHoursBeforeEnd: 24 };

  it("за 10 часов до конца суммы скрыты", () => {
    const now = new Date(Date.parse(config.endsAt) - 10 * 3600_000);
    expect(isFrozen(config, now)).toBe(true);
  });

  it("за 2 дня до конца суммы видны", () => {
    const now = new Date(Date.parse(config.endsAt) - 48 * 3600_000);
    expect(isFrozen(config, now)).toBe(false);
  });

  it("после конца остаются скрытыми", () => {
    expect(isFrozen(config, new Date(Date.parse(config.endsAt) + 3600_000))).toBe(true);
  });
});

const API_CONFIG = {
  slug: "pokupatel-mesyaca",
  title: "Покупатель месяца",
  prizeName: "Смартфон iPhone 17 Pro Max, 256 ГБ",
  startsAt: "2026-10-25T19:00:00Z",
  endsAt: "2026-12-30T18:59:59Z",
  freezeHoursBeforeEnd: 24,
  holdDays: 14,
  minOrderAmount: 15000,
  rulesVersion: "2026-10-26",
  isFrozen: false,
  serverTime: "2026-10-26T08:58:04.4557237Z",
};

const API_BOARD = {
  isFrozen: false,
  updatedAt: "2026-10-26T08:58:00Z",
  entries: [
    { place: 1, label: "7Q4K", amount: 118000, status: "pending", activatesAt: "2026-11-04T08:57:54Z" },
    { place: 2, label: "M2XA", amount: 96500, status: "confirmed", activatesAt: null },
  ],
};

describe("разбор ответов API", () => {
  it("настройки по контракту принимаются", () => {
    expect(parsePromoConfig(API_CONFIG)?.minOrderAmount).toBe(15000);
  });

  it("неполные настройки — null, а не падение", () => {
    expect(parsePromoConfig({ ...API_CONFIG, endsAt: "вчера" })).toBeNull();
    expect(parsePromoConfig(null)).toBeNull();
  });

  it("табло: место и метка от сервера", () => {
    const board = parseLeaderboard(API_BOARD);
    expect(board?.entries.map((e) => [e.place, e.label])).toEqual([[1, "7Q4K"], [2, "M2XA"]]);
  });

  it("табло с чужим статусом отклоняется целиком", () => {
    const bad = { ...API_BOARD, entries: [{ ...API_BOARD.entries[0], status: "removed" }] };
    expect(parseLeaderboard(bad)).toBeNull();
  });

  it("на финале суммы не показываются, даже если сервер их прислал", () => {
    const board = parseLeaderboard({ ...API_BOARD, isFrozen: true });
    expect(board?.entries.every((e) => e.amount === null)).toBe(true);
  });

  it("/me: участник и не участник", () => {
    expect(parsePromoMe({ participating: false, label: null })).toEqual({ participating: false });
    const me = parsePromoMe({ participating: true, label: "7Q4K", place: 1, amount: 118000, status: "pending", activatesAt: null });
    expect(me).toMatchObject({ participating: true, label: "7Q4K", place: 1 });
  });
});

describe("часы акции", () => {
  it("смещение считается от середины запроса", () => {
    // Устройство отстаёт на час, запрос шёл 200 мс
    const server = Date.parse("2026-12-01T12:00:00Z");
    const sent = server - 3_600_000 - 100;
    expect(computeOffset(new Date(server).toISOString(), sent, sent + 200)).toBe(3_600_000);
  });

  it("акция идёт между началом и концом", () => {
    expect(isRunning(API_CONFIG, Date.parse("2026-11-01T00:00:00Z"))).toBe(true);
    expect(isRunning(API_CONFIG, Date.parse("2026-12-31T00:00:00Z"))).toBe(false);
  });
});

describe("getPromoData", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubFetch = (handler: (url: string) => Response | Promise<Response>) =>
    vi.stubGlobal("fetch", vi.fn((url: string) => Promise.resolve(handler(url))));
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

  it("сроки и порог берутся из API", async () => {
    stubFetch((url) => (url.includes("/leaderboard") ? json(API_BOARD) : json({ ...API_CONFIG, minOrderAmount: 20000 })));
    const data = await getPromoData();
    expect(data.status).toBe("ok");
    expect(data.config.minOrderAmount).toBe(20000);
    expect(data.boardAvailable).toBe(true);
    expect(data.leaderboard).toHaveLength(2);
  });

  it("API недоступно — статус error: акцию не рекламируем", async () => {
    stubFetch(() => {
      throw new Error("сеть");
    });
    const data = await getPromoData();
    expect(data.status).toBe("error");
    expect(data.boardAvailable).toBe(false);
    expect(data.leaderboard).toEqual([]);
    expect(data.config.minOrderAmount).toBe(PROMO_CONFIG.minOrderAmount);
  });

  it("акция выключена (404) — статус disabled, лендинг отдаст 404", async () => {
    stubFetch(() => new Response("", { status: 404 }));
    expect((await getPromoData()).status).toBe("disabled");
  });

  it("ответ 500 или не по контракту — error, а не disabled", async () => {
    stubFetch(() => new Response("", { status: 500 }));
    expect((await getPromoData()).status).toBe("error");
    stubFetch(() => json({ slug: "pokupatel-mesyaca" }));
    expect((await getPromoData()).status).toBe("error");
  });
});

describe("товары акции", () => {
  const p = (id: string, withImage = true) =>
    ({ id, images: withImage ? [{ id, imagePath: `/images/${id}.jpg`, order: 0 }] : [] }) as unknown as Product;

  it("берёт по кругу из категорий и пропускает товары без фото", () => {
    const clothes = [p("c1"), p("c2", false), p("c3")];
    const shoes = [p("s1"), p("s2")];
    expect(interleave([clothes, shoes], 4).map((x) => x.id)).toEqual(["c1", "s1", "s2", "c3"]);
  });
});

describe("правила акции", () => {
  const text = getPromoRules(PROMO_CONFIG)
    .flatMap((s) => [s.title, ...s.items])
    .join(" ")
    .replace(NBSP, " ");

  it("сроки, порог и приз берутся из настроек", () => {
    expect(text).toContain(`от ${formatKzt(PROMO_CONFIG.minOrderAmount).replace(NBSP, " ")}`);
    expect(text).toContain("30 декабря 2026 г.");
    expect(text).toContain(PROMO_CONFIG.prizeName);
    expect(text).toContain(`${PROMO_CONFIG.confirmDays} дней`);
  });

  it("совпадают с бэкендом: только карта, один чек, снятие при возврате", () => {
    expect(text).toMatch(/наличными[^.]*не участвуют/);
    expect(text).toContain("Суммы разных заказов не складываются");
    expect(text).toMatch(/возвращён полностью или частично/);
  });

  it("строятся из тех же настроек API, что лендинг: смена порога и срока в базе видна и в правилах", () => {
    const config = mergeConfig(PROMO_CONFIG, {
      slug: "pokupatel-mesyaca", title: "Покупатель месяца", prizeName: "Другой приз",
      startsAt: "2026-10-25T19:00:00Z", endsAt: "2027-01-15T18:59:59Z", freezeHoursBeforeEnd: 12,
      holdDays: 10, minOrderAmount: 25000, rulesVersion: "2026-11-05", isFrozen: false,
      serverTime: "2026-11-05T00:00:00Z",
    });
    const rules = getPromoRules(config).flatMap((s) => s.items).join(" ").replace(NBSP, " ");
    expect(rules).toContain("от 25 000 ₸");
    expect(rules).toContain("15 января 2027 г.");
    expect(rules).toContain("Другой приз");
    expect(rules).toContain("10 дней");
    expect(rules).toContain("За 12 часа");
  });

  it("сменили приз на бэкенде — короткое имя и фото не остаются от старого", () => {
    const api = { ...API_CONFIG, prizeName: "Ноутбук" };
    const changed = mergeConfig(PROMO_CONFIG, api);
    expect(changed.prizeShortName).toBe("Ноутбук");
    expect(changed.prizeImage).toBe(PRIZE_PLACEHOLDER);
    const same = mergeConfig(PROMO_CONFIG, API_CONFIG);
    expect(same.prizeShortName).toBe(PROMO_CONFIG.prizeShortName);
    expect(same.prizeImage).toBe(PROMO_CONFIG.prizeImage);
  });

  it("якоря оглавления уникальны", () => {
    const ids = getPromoRules(PROMO_CONFIG).map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("тексты лендинга", () => {
  // Модерация Meta и закон РК о рекламе
  const FORBIDDEN = ["бесплатн", "розыгрыш", "лотере", "билет", "выигр", "шанс"];
  const roots = [join(process.cwd(), "app/lib/promo"), join(process.cwd(), "app/components/Promo"), join(process.cwd(), "app/akciya")];

  const files = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
      d.isDirectory() ? files(join(dir, d.name)) : /\.tsx?$/.test(d.name) && !d.name.endsWith(".test.ts") ? [join(dir, d.name)] : []
    );

  it("нет запрещённых слов", () => {
    const hits = roots.flatMap(files).flatMap((file) => {
      const text = readFileSync(file, "utf8").toLowerCase();
      return FORBIDDEN.filter((w) => text.includes(w)).map((w) => `${file}: ${w}`);
    });
    expect(hits).toEqual([]);
  });
});
