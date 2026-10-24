"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/app/lib/interfaces/product.interface";
import DiscountBadge from "@/app/components/DiscountBadge";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  className?: string;
  /** Действующий процент скидки — плашка на главном фото, 0 — без плашки. */
  discountPercent?: number;
}

/**
 * Галерея как на Интертопе. ПК: миниатюры столбиком слева, большое фото 3:4 со
 * стрелками. Телефон: фото листаются пальцем (scroll-snap, без библиотек), под
 * ними точки. Фото товаров снимают 3:4 — рамка той же пропорции, без полей.
 */
export default function ProductGallery({
  images,
  productName,
  className,
  discountPercent = 0,
}: ProductGalleryProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const [selected, setSelected] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/images/product-img-1.jpg";
    return imagePath.startsWith("http") ? imagePath : `${apiUrl}${imagePath}`;
  };

  const list = images?.length ? images : [{ id: "placeholder", imagePath: "", order: 0 }];
  const count = list.length;
  const go = (index: number) => setSelected((index + count) % count);

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setSelected(Math.round(el.scrollLeft / el.clientWidth));
  };

  const scrollTo = (index: number) => {
    const el = trackRef.current;
    el?.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const arrow = (dir: "prev" | "next") => (
    <button
      type="button"
      onClick={() => go(selected + (dir === "prev" ? -1 : 1))}
      aria-label={dir === "prev" ? "Предыдущее фото" : "Следующее фото"}
      className={`absolute top-1/2 z-10 flex h-11 w-9 -translate-y-1/2 items-center justify-center bg-white/80 text-qblack transition-colors hover:bg-white ${
        dir === "prev" ? "left-0" : "right-0"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <path
          d={dir === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );

  return (
    <div className={`product-gallery ${className || ""}`}>
      {/* Телефон: лента фото */}
      <div className="relative md:hidden">
        <DiscountBadge percent={discountPercent} size="lg" />
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="-mx-4 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {list.map((img, index) => (
            <div key={img.id || index} className="relative aspect-[3/4] w-full shrink-0 snap-center bg-primarygray">
              <Image
                src={getImageUrl(img.imagePath)}
                alt={index === 0 ? productName : `${productName} — фото ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        {count > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {list.map((img, index) => (
              <button
                key={img.id || index}
                type="button"
                onClick={() => scrollTo(index)}
                aria-label={`Фото ${index + 1}`}
                className={`h-2 rounded-full transition-all ${
                  index === selected ? "w-5 bg-qblack" : "w-2 bg-qgray-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ПК: миниатюры + большое фото */}
      <div className="hidden gap-3 md:flex">
        {count > 1 && (
          <div className="flex w-[84px] shrink-0 flex-col gap-2">
            {list.map((img, index) => (
              <button
                key={img.id || index}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Фото ${index + 1}`}
                aria-current={index === selected}
                className={`relative aspect-[3/4] w-full overflow-hidden border bg-primarygray transition-colors ${
                  index === selected ? "border-qblack" : "border-transparent hover:border-qgray"
                }`}
              >
                <Image
                  src={getImageUrl(img.imagePath)}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="84px"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative aspect-[3/4] min-w-0 flex-1 overflow-hidden bg-primarygray">
          <DiscountBadge percent={discountPercent} size="lg" />
          <Image
            src={getImageUrl(list[selected]?.imagePath ?? "")}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 50vw, 600px"
            priority
          />
          {count > 1 && (
            <>
              {arrow("prev")}
              {arrow("next")}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
