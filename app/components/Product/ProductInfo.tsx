"use client";

import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Product } from "@/app/lib/interfaces/product.interface";
import { CartContext } from "@/app/lib/CartContext";
import { FB_CURRENCY, fbTrack } from "@/app/lib/fbPixel";
import { GA_CURRENCY, gaEvent } from "@/app/lib/ga";
import WhatsAppOrderButton from "@/app/product/whatsAppButton";
import ColorDot from "@/app/components/ColorDot";
import { activeDiscountPercent, discountedPrice as priceWithDiscount } from "@/app/lib/discount";
import { parseProperties } from "@/app/lib/productProperties";
import { Choice, buildSelection, formatSelection, productOptions } from "@/app/lib/productOptions";
import { formatPrice } from "@/app/lib/money";
import { usePricingNow } from "@/app/lib/PricingClock";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

/** Раскрывающийся раздел, как «ХАРАКТЕРИСТИКИ» и «ОПИСАНИЕ» на Интертопе. */
function Accordion({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-qgray-border">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
        <span className="text-[15px] font-700 uppercase tracking-wide text-qblack">{title}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
          className="shrink-0 transition-transform group-open:rotate-180"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="pb-5">{children}</div>
    </details>
  );
}

export default function ProductInfo({ product, className }: ProductInfoProps) {
  const { addItemToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [choice, setChoice] = useState<Choice>({});
  const [showMissing, setShowMissing] = useState(false);
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addFailed, setAddFailed] = useState(false);
  // Адрес для «Поделиться» берётся только в браузере: прочитанный при рендере
  // window.location давал на сервере пустую ссылку, а в браузере полную — ошибка гидрации
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);

  const now = usePricingNow();
  const discountedPrice = priceWithDiscount(product, now);
  const discount = activeDiscountPercent(product, now);

  // Цена, по которой товар реально уходит в корзину: со скидкой, если она есть
  const effectivePrice = discountedPrice ?? product.price;
  const productName = product.name || product.title;

  const options = productOptions(product);
  const selection = buildSelection(options, choice);

  // Характеристики сгруппированы: «Размер: 36, 37, 38» вместо трёх строк
  const grouped = new Map<string, string[]>();
  for (const row of parseProperties(product.propertiesJson)) {
    const name = row.Название.trim();
    const value = row.Значение.trim();
    if (!name || !value) continue;
    const values = grouped.get(name) ?? [];
    // В данных цвет бывает записан несколько раз подряд — показываем один
    if (!values.some((v) => v.toLowerCase() === value.toLowerCase())) values.push(value);
    grouped.set(name, values);
  }

  // ViewContent — один раз на товар. Ref, а не только зависимость эффекта:
  // в dev включён reactStrictMode, эффекты прогоняются дважды.
  const viewTrackedId = useRef<string | null>(null);
  useEffect(() => {
    if (viewTrackedId.current === product.id) return;
    viewTrackedId.current = product.id;

    fbTrack("ViewContent", {
      content_ids: [product.id],
      content_name: productName,
      content_type: "product",
      value: effectivePrice,
      currency: FB_CURRENCY,
    });
    gaEvent("view_item", {
      currency: GA_CURRENCY,
      value: effectivePrice,
      items: [{ item_id: product.id, item_name: productName, price: effectivePrice, quantity: 1, item_category: product.categoryName || undefined }],
    });
  }, [product.id, productName, effectivePrice, product.categoryName]);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2500);
    return () => clearTimeout(t);
  }, [added]);

  const handleAddToCart = async () => {
    // Без размера продавец не знает, что отправлять, — не кладём, а подсвечиваем выбор
    if (selection.missing.length > 0) {
      setShowMissing(true);
      return;
    }

    setAdding(true);
    setAddFailed(false);
    const ok = await addItemToCart({
      productId: product.id,
      name: productName,
      price: effectivePrice,
      imageUrl: product.images?.[0]?.imagePath || product.image || "",
      quantity: quantity,
      selectedProperties: selection.json,
    });
    setAdding(false);

    // «Добавлено» и событие Pixel — только когда сервер товар принял
    if (!ok) {
      setAddFailed(true);
      return;
    }
    setAdded(true);

    fbTrack("AddToCart", {
      content_ids: [product.id],
      content_name: productName,
      content_type: "product",
      // Со страницы товара можно положить сразу несколько штук
      value: effectivePrice * quantity,
      currency: FB_CURRENCY,
      contents: [{ id: product.id, quantity }],
    });
    gaEvent("add_to_cart", {
      currency: GA_CURRENCY,
      value: effectivePrice * quantity,
      items: [{
        item_id: product.id,
        item_name: productName,
        price: effectivePrice,
        quantity,
        item_category: product.categoryName || undefined,
        item_variant: formatSelection(selection.json) || undefined,
      }],
    });
  };

  const choose = (key: keyof Choice, value: string) => {
    setChoice((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`product-info ${className || ""}`}>
      <h1 className="text-[24px] font-700 leading-tight text-qblack sm:text-[30px]">
        {productName}
      </h1>
      {product.categoryName && (
        <Link
          href={`/shop?category=${product.categoryId}`}
          className="mt-1 inline-block text-[16px] text-qgray hover:text-qbrand"
        >
          {product.categoryName}
        </Link>
      )}

      {/* Цена */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        {discountedPrice !== null ? (
          <>
            <span className="text-[26px] font-700 text-qred sm:text-[28px]">
              {formatPrice(discountedPrice)}
            </span>
            <span className="text-[16px] text-qgray line-through">
              {formatPrice(product.price)}
            </span>
            <span className="self-center bg-qred px-2 py-1 text-[12px] font-700 leading-none text-white">
              −{Math.round(discount)}%
            </span>
          </>
        ) : (
          <span className="text-[26px] font-700 text-qblack sm:text-[28px]">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Выбор размера и цвета */}
      {options.map(({ facet, values }) => {
        const current = values.length === 1 ? values[0] : choice[facet.key];
        const missing = showMissing && selection.missing.includes(facet);
        return (
          <div key={facet.key} className="mt-6">
            <p className="mb-3 text-[15px] text-qblack">
              <span className="font-600">{facet.label}:</span>{" "}
              {current ? (
                <span>{facet.format ? facet.format(current) : current}</span>
              ) : (
                <span className={missing ? "text-qred" : "text-qgray"}>
                  {missing ? `выберите ${facet.label.toLowerCase()}` : "не выбран"}
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={facet.label}>
              {values.map((value) => {
                const on = current === value;
                const label = facet.format ? facet.format(value) : value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => choose(facet.key, value)}
                    className={`flex h-11 min-w-[48px] items-center justify-center gap-2 border px-3 text-[14px] transition-colors ${
                      on
                        ? "border-qblack font-600 text-qblack shadow-[inset_0_-2px_0_0_theme(colors.qbrand)]"
                        : missing
                          ? "border-qred/60 text-qblack hover:border-qblack"
                          : "border-qgray-border text-qblack hover:border-qblack"
                    }`}
                  >
                    {facet.key === "color" && <ColorDot color={value} size={16} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Количество и корзина */}
      <div className="mt-7 flex gap-3">
        <div className="flex h-[52px] w-[120px] shrink-0 items-center justify-between border border-qgray-border px-4">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            type="button"
            aria-label="Меньше"
            className="text-lg text-qgray transition-colors hover:text-qblack"
          >
            −
          </button>
          <span className="font-medium text-qblack">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            type="button"
            aria-label="Больше"
            className="text-lg text-qgray transition-colors hover:text-qblack"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding}
          className="flex h-[52px] flex-1 items-center justify-center bg-qbrand text-[16px] font-600 text-white transition-colors hover:bg-qblack disabled:cursor-wait disabled:opacity-70"
        >
          {adding ? "Добавляем…" : added ? "Добавлено в корзину ✓" : "Добавить в корзину"}
        </button>
      </div>
      {addFailed && (
        <p role="alert" className="mt-2 text-[14px] text-qred">
          Не удалось добавить в корзину. Проверьте интернет и попробуйте ещё раз.
        </p>
      )}
      {added && (
        <Link href="/basket" className="mt-2 inline-block text-[14px] font-600 text-qbrand hover:underline">
          Перейти в корзину →
        </Link>
      )}

      {/* Характеристики и описание */}
      <div className="mt-8 border-t border-qgray-border">
        <Accordion title="Характеристики" defaultOpen>
          <dl className="space-y-2 text-[14px]">
            {Array.from(grouped).map(([name, values]) => (
              <div key={name} className="flex gap-4">
                <dt className="w-1/3 shrink-0 text-qgray">{name}</dt>
                <dd className="text-qblack">{values.join(", ")}</dd>
              </div>
            ))}
            {product.sku && (
              <div className="flex gap-4">
                <dt className="w-1/3 shrink-0 text-qgray">Артикул</dt>
                <dd className="text-qblack">{product.sku}</dd>
              </div>
            )}
            {product.categoryName && (
              <div className="flex gap-4">
                <dt className="w-1/3 shrink-0 text-qgray">Категория</dt>
                <dd className="text-qblack">{product.categoryName}</dd>
              </div>
            )}
          </dl>
        </Accordion>

        {product.description && (
          <Accordion title="Описание">
            <p className="whitespace-pre-line text-[14px] leading-7 text-qblack">
              {product.description}
            </p>
          </Accordion>
        )}

        <Accordion title="Поделиться">
          <div className="flex items-center gap-5">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-qblack hover:text-[#25D366]"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-qblack hover:text-[#3E75B2]"
            >
              Facebook
            </a>
          </div>
        </Accordion>
      </div>

      {/* Заказ в WhatsApp. Кнопка плавающая (position: fixed в whatsApp.scss),
          поэтому место в разметке роли не играет — важно лишь, что она есть
          на карточке товара и знает его название. */}
      <WhatsAppOrderButton productName={productName} />
    </div>
  );
}
