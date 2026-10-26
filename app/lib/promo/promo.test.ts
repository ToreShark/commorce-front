import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { formatKzt, formatShortDate, formatLongDate, isFrozen, rankEntries, timeLeft } from "./format";
import { PROMO_CONFIG } from "./config";
import { getPromoData } from "./data";
import { interleave } from "./products";
import type { Product } from "@/app/lib/interfaces/product.interface";

const NBSP = /[  ]/g;

describe("форматирование", () => {
  it("сумма в тенге с пробелами-разделителями", () => {
    expect(formatKzt(118000).replace(NBSP, " ")).toBe("118 000 ₸");
  });

  it("даты по Алматы, а не по UTC", () => {
    // 20:00 UTC 12.11 — уже 01:00 13.11 в Алматы
    expect(formatShortDate("2026-11-12T20:00:00Z")).toBe("13.11");
    expect(formatLongDate(PROMO_CONFIG.endsAt)).toBe("30 ноября");
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

  it("getPromoData на финале не отдаёт сумм вовсе", async () => {
    const now = new Date(Date.parse(PROMO_CONFIG.endsAt) - 3600_000);
    const data = await getPromoData(now);
    expect(data.frozen).toBe(true);
    expect(data.leaderboard.every((e) => e.amount === null)).toBe(true);
  });

  it("до финала табло отсортировано по убыванию суммы", async () => {
    const now = new Date(Date.parse(PROMO_CONFIG.startsAt) + 3600_000);
    const data = await getPromoData(now);
    const amounts = data.leaderboard.map((e) => e.amount ?? 0);
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
  });

  it("rankEntries не трогает исходный массив", () => {
    const src = [
      { label: "a", amount: 1, status: "confirmed" as const },
      { label: "b", amount: 5, status: "pending" as const },
    ];
    expect(rankEntries(src).map((e) => e.label)).toEqual(["b", "a"]);
    expect(src[0].label).toBe("a");
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
