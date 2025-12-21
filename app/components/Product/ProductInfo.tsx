"use client";

import { useContext, useState } from "react";
import { Product } from "@/app/lib/interfaces/product.interface";
import { CartContext } from "@/app/lib/CartContext";
import { Star } from "@/app/components/icons";

interface ProductInfoProps {
  product: Product;
  className?: string;
}

export default function ProductInfo({ product, className }: ProductInfoProps) {
  const { addItemToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const discountedPrice = product.discountPercentage
    ? product.price - (product.price * product.discountPercentage) / 100
    : null;

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    addItemToCart({
      productId: product.id,
      name: product.name || product.title,
      price: discountedPrice || product.price,
      imageUrl: product.images?.[0]?.imagePath || product.image || "",
      quantity: quantity,
    });
  };

  // Parse properties JSON
  interface PropertyItem {
    id?: number;
    Название?: string;
    Значение?: string;
    name?: string;
    value?: string;
  }
  let propertiesArray: PropertyItem[] = [];
  try {
    if (product.propertiesJson) {
      const parsed = JSON.parse(product.propertiesJson);
      if (Array.isArray(parsed)) {
        propertiesArray = parsed;
      } else if (typeof parsed === 'object') {
        // Convert object to array format
        propertiesArray = Object.entries(parsed).map(([key, val]) => ({
          Название: key,
          Значение: String(val)
        }));
      }
    }
  } catch (e) {
    console.error("Failed to parse properties JSON");
  }

  return (
    <div className={`product-info ${className || ""}`}>
      {/* Category */}
      {product.categoryName && (
        <span className="text-qgray text-xs font-normal uppercase tracking-wider mb-2 inline-block">
          {product.categoryName}
        </span>
      )}

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-medium text-qblack mb-4">
        {product.name || product.title}
      </h1>

      {/* Rating */}
      <div className="flex space-x-[10px] items-center mb-6">
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className={index < 4 ? "text-qyellow" : "text-gray-300"}
            />
          ))}
        </div>
        <span className="text-[13px] font-normal text-qgray">
          (Нет отзывов)
        </span>
      </div>

      {/* Price */}
      <div className="flex space-x-2 items-center mb-7">
        {discountedPrice ? (
          <>
            <span className="text-sm font-500 text-qgray line-through mt-2">
              {product.price.toLocaleString()} ₸
            </span>
            <span className="text-2xl font-500 text-qred">
              {discountedPrice.toLocaleString()} ₸
            </span>
          </>
        ) : (
          <span className="text-2xl font-500 text-qblack">
            {product.price.toLocaleString()} ₸
          </span>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <p className="text-qgray text-sm text-normal mb-[30px] leading-7">
          {product.description.length > 200
            ? `${product.description.substring(0, 200)}...`
            : product.description}
        </p>
      )}

      {/* Properties */}
      {propertiesArray.length > 0 && (
        <div className="mb-[30px]">
          <span className="text-sm font-normal uppercase text-qgray mb-[14px] inline-block">
            Характеристики
          </span>
          <div className="space-y-2">
            {propertiesArray.slice(0, 4).map((prop, index) => (
              <div key={prop.id || index} className="flex items-center text-sm">
                <span className="text-qgray w-32">{prop.Название || prop.name}:</span>
                <span className="text-qblack">{prop.Значение || prop.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quantity and Add to Cart */}
      <div className="quantity-card-wrapper w-full flex flex-col sm:flex-row items-stretch sm:items-center sm:h-[50px] space-y-3 sm:space-y-0 sm:space-x-[10px] mb-[30px]">
        <div className="w-full sm:w-[120px] h-[50px] px-[26px] flex items-center border border-qgray-border rounded">
          <div className="flex justify-between items-center w-full">
            <button
              onClick={decrement}
              type="button"
              className="text-lg text-qgray hover:text-qblack transition-colors"
            >
              −
            </button>
            <span className="text-qblack font-medium">{quantity}</span>
            <button
              onClick={increment}
              type="button"
              className="text-lg text-qgray hover:text-qblack transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex-1 h-[50px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-full bg-qblack hover:bg-qyellow text-white hover:text-qblack font-semibold text-sm rounded transition-colors flex items-center justify-center space-x-2"
          >
            <svg
              width="14"
              height="16"
              viewBox="0 0 14 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="fill-current"
            >
              <path d="M12.5664 4.14176C12.4665 3.87701 12.2378 3.85413 11.1135 3.85413H10.1792V3.43576C10.1792 2.78532 10.089 2.33099 9.86993 1.86359C9.47367 1.01704 8.81003 0.425438 7.94986 0.150881C7.53106 0.0201398 6.90607 -0.0354253 6.52592 0.0234083C5.47246 0.193372 4.57364 0.876496 4.11617 1.85052C3.89389 2.32772 3.80368 2.78532 3.80368 3.43576V3.8574H2.8662C1.74187 3.8574 1.51313 3.88028 1.41326 4.15483C1.36172 4.32807 0.878481 8.05093 0.6723 9.65578C0.491891 11.0547 0.324369 12.3752 0.201948 13.3688C-0.0106763 15.0815 -0.00423318 15.1077 0.00220999 15.1371V15.1404C0.0312043 15.2515 0.317925 15.5424 0.404908 15.6274L0.781834 16H13.1785L13.4588 15.7483C13.5844 15.6339 14 15.245 14 15.0521C14 14.9214 12.5922 4.21694 12.5664 4.14176ZM12.982 14.8037C12.9788 14.8266 12.953 14.8952 12.9079 14.9443L12.8435 15.0162H1.13943L0.971907 14.8331L1.63233 9.82901C1.86429 8.04766 2.07047 6.4951 2.19289 5.56684C2.24766 5.16154 2.27343 4.95563 2.28631 4.8543C2.72123 4.85103 4.62196 4.84776 6.98661 4.84776H11.6901L11.6966 4.88372C11.7481 5.1452 12.9594 14.5128 12.982 14.8037ZM4.77338 3.8574V3.48479C4.77338 3.23311 4.80559 2.88664 4.84103 2.72649C5.03111 1.90935 5.67864 1.24584 6.48726 1.03339C6.82553 0.948403 7.37964 0.97782 7.71791 1.10202H7.72113C8.0755 1.22296 8.36545 1.41907 8.63284 1.71978C9.06453 2.19698 9.2095 2.62516 9.2095 3.41615V3.8574H4.77338Z" />
            </svg>
            <span>В корзину</span>
          </button>
        </div>
      </div>

      {/* Product Meta */}
      <div className="mb-[20px] space-y-1">
        {product.categoryName && (
          <p className="text-[13px] text-qgray leading-7">
            <span className="text-qblack">Категория:</span> {product.categoryName}
          </p>
        )}
        {product.sku && (
          <p className="text-[13px] text-qgray leading-7">
            <span className="text-qblack">Артикул:</span> {product.sku}
          </p>
        )}
      </div>

      {/* Share */}
      <div className="social-share flex items-center w-full">
        <span className="text-qblack text-[13px] mr-[17px] inline-block">
          Поделиться
        </span>
        <div className="flex space-x-5 items-center">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-qgray hover:text-[#3E75B2] transition-colors"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
              <path d="M3 16V9H0V6H3V4C3 1.3 4.7 0 7.1 0C8.3 0 9.2 0.1 9.5 0.1V2.9H7.8C6.5 2.9 6.2 3.5 6.2 4.4V6H10L9 9H6.3V16H3Z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.href : ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-qgray hover:text-[#25D366] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
