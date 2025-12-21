"use client";

import Image from "next/image";
import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";
import {
  increaseItemQuantity,
  decreaseItemQuantity,
  removeItemFromCart,
  fetchCartInfo,
} from "@/app/lib/data";

interface CartItemProps {
  item: CartItemInterface;
  onUpdate: () => void;
}

export default function CartItem({ item, onUpdate }: CartItemProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "/assets/images/product-img-1.jpg";
    return imagePath.startsWith("http") ? imagePath : `${apiUrl}${imagePath}`;
  };

  const handleIncrease = async () => {
    if (item.uniqueOrderId) {
      await increaseItemQuantity(item.uniqueOrderId);
      onUpdate();
    }
  };

  const handleDecrease = async () => {
    if (item.uniqueOrderId && item.quantity > 1) {
      await decreaseItemQuantity(item.uniqueOrderId);
      onUpdate();
    }
  };

  const handleRemove = async () => {
    await removeItemFromCart(item.productId);
    onUpdate();
  };

  const totalPrice = item.price * item.quantity;

  return (
    <tr className="bg-white border-b hover:bg-gray-50">
      {/* Product */}
      <td className="pl-4 sm:pl-10 py-4 min-w-[200px] sm:min-w-[300px]">
        <div className="flex space-x-4 sm:space-x-6 items-center">
          <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] overflow-hidden flex justify-center items-center border border-[#EDEDED] rounded flex-shrink-0">
            <Image
              src={getImageUrl(item.imageUrl)}
              alt={item.name}
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <p className="font-medium text-[13px] sm:text-[15px] text-qblack line-clamp-2">
              {item.name}
            </p>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="text-center py-4 px-2 hidden sm:table-cell">
        <span className="text-[15px] font-normal text-qgray">
          {item.price.toLocaleString()} ₸
        </span>
      </td>

      {/* Quantity */}
      <td className="py-4 px-2">
        <div className="flex justify-center items-center">
          <div className="w-[100px] sm:w-[120px] h-[40px] px-3 sm:px-[26px] flex items-center border border-qgray-border rounded">
            <div className="flex justify-between items-center w-full">
              <button
                onClick={handleDecrease}
                type="button"
                className="text-base text-qgray hover:text-qblack transition-colors"
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span className="text-qblack font-medium text-sm">
                {item.quantity}
              </span>
              <button
                onClick={handleIncrease}
                type="button"
                className="text-base text-qgray hover:text-qblack transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Total */}
      <td className="text-center py-4 px-2">
        <span className="text-[15px] font-medium text-qblack">
          {totalPrice.toLocaleString()} ₸
        </span>
      </td>

      {/* Remove */}
      <td className="text-right py-4 pr-4 sm:pr-10">
        <button
          onClick={handleRemove}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-50 transition-colors ml-auto"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-qgray hover:text-qred transition-colors"
          >
            <path
              d="M9.7 0.3C9.3 -0.1 8.7 -0.1 8.3 0.3L5 3.6L1.7 0.3C1.3 -0.1 0.7 -0.1 0.3 0.3C-0.1 0.7 -0.1 1.3 0.3 1.7L3.6 5L0.3 8.3C-0.1 8.7 -0.1 9.3 0.3 9.7C0.7 10.1 1.3 10.1 1.7 9.7L5 6.4L8.3 9.7C8.7 10.1 9.3 10.1 9.7 9.7C10.1 9.3 10.1 8.7 9.7 8.3L6.4 5L9.7 1.7C10.1 1.3 10.1 0.7 9.7 0.3Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
