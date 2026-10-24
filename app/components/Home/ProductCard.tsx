"use client";

import { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/app/lib/interfaces/product.interface";
import { CartContext } from "@/app/lib/CartContext";
import { FB_CURRENCY, fbTrack } from "@/app/lib/fbPixel";
import DiscountBadge from "@/app/components/DiscountBadge";
import ColorDot from "@/app/components/ColorDot";
import { activeDiscountPercent, discountedPrice as priceWithDiscount } from "@/app/lib/discount";
import { FACETS, compareFacetValues, productFacetValues } from "@/app/lib/catalogFilters";
import { buildSelection, needsChoice, productOptions } from "@/app/lib/productOptions";

interface ProductCardProps {
  product: Product;
}

const SIZE = FACETS.find((f) => f.key === "size")!;
const COLOR = FACETS.find((f) => f.key === "color")!;
const AGE = FACETS.find((f) => f.key === "age")!;

const MAX_SIZES = 7;
const MAX_COLORS = 6;
const CART_BUTTON =
  "flex h-9 w-9 items-center justify-center bg-qbrand text-white transition-colors hover:bg-qblack " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-qblack sm:h-10 sm:w-10";
const IMAGE_SIZES = "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw";

/**
 * Карточка в духе Интертопа: вертикальное фото на всю ширину, под ним цена с кнопкой
 * корзины, название, категория, размеры и цвета. Фото товаров снимают 3:4 (960×1280),
 * поэтому рамка тоже 3:4 — в квадрате оставались пустые поля по бокам.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addItemToCart } = useContext(CartContext);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const discount = activeDiscountPercent(product);
  const discountedPrice = priceWithDiscount(product);

  const rawImagePath = product.images?.[0]?.imagePath ?? product.image ?? "";
  const imageUrl = rawImagePath
    ? `${apiUrl}${rawImagePath}`
    : "/assets/images/product-img-1.jpg";
  // Второе фото проявляется при наведении — сразу видно товар с другой стороны
  const hoverPath = product.images?.[1]?.imagePath;
  const hoverUrl = hoverPath ? `${apiUrl}${hoverPath}` : null;

  const productName = product.name || product.title;
  const sizes = productFacetValues(product, SIZE).sort(compareFacetValues);
  const ages = productFacetValues(product, AGE).sort(compareFacetValues);
  const colors = productFacetValues(product, COLOR);
  // У детской одежды вместо размера часто записан возраст
  const sizeLabels = sizes.length > 0 ? sizes : ages.map((a) => AGE.format!(a));

  const handleAddToCart = async () => {
    const effectivePrice = discountedPrice ?? product.price;

    const ok = await addItemToCart({
      productId: product.id,
      name: productName,
      price: effectivePrice,
      imageUrl: rawImagePath, // тот же путь, что и в карточке — префикс добавляет вьюха корзины
      quantity: 1,
      // Единственный размер/цвет тоже уходит в заказ — продавцу виднее
      selectedProperties: buildSelection(productOptions(product), {}).json,
    });
    // Pixel — только если сервер товар принял
    if (!ok) return;

    fbTrack("AddToCart", {
      content_ids: [product.id],
      content_name: productName,
      content_type: "product",
      value: effectivePrice,
      currency: FB_CURRENCY,
      contents: [{ id: product.id, quantity: 1 }],
    });
  };

  const mustChoose = needsChoice(product);
  const cartIcon = (
    <svg
      width="16"
      height="18"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-current"
      aria-hidden
    >
      <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176ZM12.982 14.8037C12.9788 14.8266 12.953 14.8952 12.9079 14.9443L12.8435 15.0162H1.13943L0.971907 14.8331L1.63233 9.82901C1.86429 8.04766 2.07047 6.4951 2.19289 5.56684C2.24766 5.16154 2.27343 4.95563 2.28631 4.8543C2.72123 4.85103 4.62196 4.84776 6.98661 4.84776H11.6901L11.6966 4.88372C11.7481 5.1452 12.9594 14.5128 12.982 14.8037ZM4.77338 3.8574V3.48479C4.77338 3.23311 4.80559 2.88664 4.84103 2.72649C5.03111 1.90935 5.67864 1.24584 6.48726 1.03339C6.82553 0.948403 7.37964 0.97782 7.71791 1.10202H7.72113C8.0755 1.22296 8.36545 1.41907 8.63284 1.71978C9.06453 2.19698 9.2095 2.62516 9.2095 3.41615V3.8574H4.77338Z" />
    </svg>
  );

  return (
    <div className="product-card-one group relative h-full w-full">
      <div className="product-card-img relative aspect-[3/4] w-full overflow-hidden bg-primarygray">
        <DiscountBadge percent={discount} />
        {/* fill у Image требует позиционированного родителя — им служит сама ссылка */}
        <Link href={`/product/${product.slug}`} aria-label={productName} className="absolute inset-0 block">
          <Image
            src={imageUrl}
            alt={productName}
            fill
            className={`object-cover motion-safe:transition-[transform,opacity] motion-safe:duration-500 ${
              hoverUrl
                ? "[@media(hover:hover)]:group-hover:opacity-0"
                : "[@media(hover:hover)]:group-hover:scale-105"
            }`}
            sizes={IMAGE_SIZES}
          />
          {hoverUrl && (
            <Image
              src={hoverUrl}
              alt=""
              fill
              aria-hidden
              className="object-cover opacity-0 motion-safe:transition-opacity motion-safe:duration-500 [@media(hover:hover)]:group-hover:opacity-100"
              sizes={IMAGE_SIZES}
            />
          )}
        </Link>
      </div>

      <div className="product-card-details pt-3">
        {/* Цена и корзина в одну строку; кнопка в потоке и видна всегда — на телефоне ховера нет.
            Локаль задана явно: в контейнере LANG пустой, и сервер писал «40,900», а браузер
            «40 900» — React ловил расхождение при гидратации */}
        <div className="flex items-start justify-between gap-2">
          <p className="price flex min-w-0 flex-wrap items-baseline gap-x-2 pt-1">
            {discountedPrice ? (
              <>
                <span className="offer-price text-[15px] font-700 text-qred sm:text-[17px]">
                  {discountedPrice.toLocaleString("ru-RU")} ₸
                </span>
                <span className="main-price text-[12px] text-qgray line-through sm:text-[13px]">
                  {product.price.toLocaleString("ru-RU")} ₸
                </span>
              </>
            ) : (
              <span className="offer-price text-[15px] font-700 text-qblack sm:text-[17px]">
                {product.price.toLocaleString("ru-RU")} ₸
              </span>
            )}
          </p>
          <div className="shrink-0">
            {/* Товар с несколькими размерами или цветами без выбора в корзину не кладём:
                продавец не узнал бы, что отправлять. Кнопка ведёт на страницу товара */}
            {mustChoose ? (
              <Link
                href={`/product/${product.slug}`}
                aria-label="Выбрать размер"
                title="Выбрать размер"
                className={CART_BUTTON}
              >
                {cartIcon}
              </Link>
            ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label="В корзину"
              title="В корзину"
              className={CART_BUTTON}
            >
              {cartIcon}
            </button>
            )}
          </div>
        </div>

        <Link href={`/product/${product.slug}`}>
          <p className="title mt-1.5 line-clamp-2 text-[14px] font-600 leading-[20px] text-qblack transition-colors hover:text-qbrand">
            {productName}
          </p>
        </Link>
        {product.categoryName && (
          <p className="mt-0.5 truncate text-[13px] text-qgray">{product.categoryName}</p>
        )}

        {sizeLabels.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-x-2 text-[12px] text-qblack" aria-label="Размеры">
            {sizeLabels.slice(0, MAX_SIZES).map((s) => (
              <span key={s}>{s}</span>
            ))}
            {sizeLabels.length > MAX_SIZES && (
              <span className="text-qgray">+{sizeLabels.length - MAX_SIZES}</span>
            )}
          </p>
        )}

        {colors.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`Цвета: ${colors.join(", ")}`}>
            {colors.slice(0, MAX_COLORS).map((c) => (
              <ColorDot key={c} color={c} size={12} />
            ))}
            {colors.length > MAX_COLORS && (
              <span className="text-[12px] text-qgray">+{colors.length - MAX_COLORS}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
