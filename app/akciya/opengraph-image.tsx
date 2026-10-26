import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { formatLongDate } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";

/**
 * Превью ссылки для Instagram и WhatsApp — PNG 1200×630, собирается на сборке.
 * Только текст в фирменных цветах: фото приза пока нет, а изображения Apple
 * использовать нельзя. Когда появится своё фото — добавить его сюда.
 * Шрифт берём свой (Inter с кириллицей): встроенный в next/og кириллицу не рисует.
 */
export const alt = "Акция CrysShop «Покупатель месяца»";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fonts = join(process.cwd(), "public/assets/fonts");
  const [bold, regular] = await Promise.all([
    readFile(join(fonts, "Inter-Bold.ttf")),
    readFile(join(fonts, "Inter-Regular.ttf")),
  ]);
  const t = getPromoTexts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#7A1F35",
          color: "#FFFFFF",
          fontFamily: "Inter",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, opacity: 0.8 }}>CRYSSHOP</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, opacity: 0.85, marginBottom: 20 }}>{t.hero.eyebrow}</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.08, maxWidth: 960 }}>
            {t.hero.title(PROMO_CONFIG.prizeShortName)}
          </div>
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>
          {`до ${formatLongDate(PROMO_CONFIG.endsAt)} · crysshop.kz/akciya`}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: bold, weight: 700, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
      ],
    }
  );
}
