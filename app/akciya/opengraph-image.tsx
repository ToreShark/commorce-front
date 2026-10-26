import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { PROMO_CONFIG } from "@/app/lib/promo/config";
import { fetchPromoConfig } from "@/app/lib/promo/api";
import { mergeConfig } from "@/app/lib/promo/data";
import { formatLongDate } from "@/app/lib/promo/format";
import { getPromoTexts } from "@/app/lib/promo/texts";

/**
 * Превью ссылки для Instagram и WhatsApp — PNG 1200×630, собирается на сборке.
 * Слева текст в фирменных цветах, справа фото приза из config.prizeImage
 * (без логотипа Apple). Фото — JPEG/PNG: SVG next/og здесь не нарисует.
 * Шрифт берём свой (Inter с кириллицей): встроенный в next/og кириллицу не рисует.
 */
export const alt = "Акция CrysShop «Покупатель месяца»";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Срок акции на картинке — из API, как на странице
export const revalidate = 60;

export default async function OpengraphImage() {
  const config = mergeConfig(PROMO_CONFIG, await fetchPromoConfig(PROMO_CONFIG.slug));
  const fonts = join(process.cwd(), "public/assets/fonts");
  // Приз сменили на бэкенде — своего фото под него нет: картинка без фото, на всю ширину
  const hasPhoto = config.prizeImage === PROMO_CONFIG.prizeImage;
  const [bold, regular, prize] = await Promise.all([
    readFile(join(fonts, "Inter-Bold.ttf")),
    readFile(join(fonts, "Inter-Regular.ttf")),
    hasPhoto ? readFile(join(process.cwd(), "public", PROMO_CONFIG.prizeImage)) : Promise.resolve(null),
  ]);
  const prizeSrc = prize ? `data:image/jpeg;base64,${prize.toString("base64")}` : null;
  const t = getPromoTexts();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#7A1F35" }}>
        <div
          style={{
            width: prizeSrc ? 700 : 1200,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 56px 64px 72px",
            color: "#FFFFFF",
            fontFamily: "Inter",
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 6, opacity: 0.8 }}>CRYSSHOP</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, opacity: 0.85, marginBottom: 18 }}>{t.hero.eyebrow}</div>
            <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.08 }}>
              {t.hero.title(config.prizeShortName)}
            </div>
          </div>
          <div style={{ fontSize: 26, opacity: 0.85 }}>
            {`до ${formatLongDate(config.endsAt)} · crysshop.kz/akciya`}
          </div>
        </div>
        {prizeSrc && (
          // eslint-disable-next-line @next/next/no-img-element -- next/og рисует только <img>
          <img src={prizeSrc} alt="" width={500} height={630} style={{ objectFit: "cover" }} />
        )}
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
