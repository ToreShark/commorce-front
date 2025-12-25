"use client";

import { DeliveryOption } from "@/app/lib/interfaces/cdek.interface";

interface DeliveryOptionsProps {
  options: DeliveryOption[];
  selectedType: string | null;
  onSelect: (option: DeliveryOption) => void;
  isLoading?: boolean;
}

export default function DeliveryOptions({
  options,
  selectedType,
  onSelect,
  isLoading = false,
}: DeliveryOptionsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 h-20 rounded-lg"
          ></div>
        ))}
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Выберите город для расчёта доставки
      </div>
    );
  }

  const getDeliveryIcon = (type: string) => {
    switch (type) {
      case "pickup":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "cdek_pvz":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        );
      case "cdek_courier":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDeliveryDays = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Сегодня";
    if (min === max) return `${min} дн.`;
    return `${min}-${max} дн.`;
  };

  const formatCost = (cost: number) => {
    if (cost === 0) return "Бесплатно";
    return `${cost.toLocaleString("ru-RU")} ₸`;
  };

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <div
          key={option.type}
          onClick={() => onSelect(option)}
          className={`
            flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all
            ${
              selectedType === option.type
                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex items-center gap-4">
            <div
              className={`
              p-2 rounded-full
              ${selectedType === option.type ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}
            `}
            >
              {getDeliveryIcon(option.type)}
            </div>
            <div>
              <div className="font-medium">{option.name}</div>
              <div className="text-sm text-gray-500">
                {formatDeliveryDays(option.daysMin, option.daysMax)}
              </div>
            </div>
          </div>
          <div
            className={`
            text-lg font-semibold
            ${option.cost === 0 ? "text-green-600" : "text-gray-900"}
          `}
          >
            {formatCost(option.cost)}
          </div>
        </div>
      ))}
    </div>
  );
}
