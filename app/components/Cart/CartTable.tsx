"use client";

import { CartItemInterface } from "@/app/lib/interfaces/cart.item.interface";
import CartItem from "./CartItem";

interface CartTableProps {
  items: CartItemInterface[];
  onUpdate: () => void;
  className?: string;
}

export default function CartTable({
  items,
  onUpdate,
  className,
}: CartTableProps) {
  return (
    <div className={`w-full ${className || ""}`}>
      <div className="relative w-full overflow-x-auto border border-[#EDEDED] rounded-lg">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[13px] font-medium text-qblack bg-[#F6F6F6] whitespace-nowrap border-b uppercase">
              <th className="py-4 pl-4 sm:pl-10 text-left min-w-[200px] sm:min-w-[300px]">
                Товар
              </th>
              <th className="py-4 px-2 text-center hidden sm:table-cell">
                Цена
              </th>
              <th className="py-4 px-2 text-center">Количество</th>
              <th className="py-4 px-2 text-center">Сумма</th>
              <th className="py-4 pr-4 sm:pr-10 text-right w-[60px] sm:w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <CartItem
                key={item.uniqueOrderId || item.productId}
                item={item}
                onUpdate={onUpdate}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
