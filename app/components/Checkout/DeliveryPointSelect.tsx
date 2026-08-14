"use client";

import { useEffect, useState } from "react";
import { fetchCdekDeliveryPoints } from "@/app/lib/data";
import { CdekDeliveryPoint } from "@/app/lib/interfaces/cdek.interface";

interface DeliveryPointSelectProps {
  cityCode: string;
  selectedCode: string | null;
  onSelect: (point: CdekDeliveryPoint | null) => void;
}

/**
 * Выбор пункта выдачи СДЭК.
 * Код ПВЗ обязателен для тарифа "склад-склад": без него бэкенд отклонит доставку,
 * а накладную СДЭК создать невозможно.
 */
export default function DeliveryPointSelect({
  cityCode,
  selectedCode,
  onSelect,
}: DeliveryPointSelectProps) {
  const [points, setPoints] = useState<CdekDeliveryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPoints() {
      setIsLoading(true);
      onSelect(null);

      const result = await fetchCdekDeliveryPoints(cityCode);

      if (!cancelled) {
        setPoints(result);
        setIsLoading(false);
      }
    }

    if (cityCode) {
      loadPoints();
    } else {
      setPoints([]);
    }

    return () => {
      cancelled = true;
    };
    // onSelect намеренно не в зависимостях: список перезагружаем только при смене города
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityCode]);

  if (isLoading) {
    return (
      <p className="text-[13px] text-qgray mt-4">Загружаем пункты выдачи…</p>
    );
  }

  if (points.length === 0) {
    return (
      <p className="text-[13px] text-qred mt-4">
        В этом городе нет пунктов выдачи СДЭК. Выберите доставку курьером.
      </p>
    );
  }

  const selectedPoint = points.find((point) => point.code === selectedCode);

  return (
    <div className="mt-4 pt-4 border-t border-[#EDEDED]">
      <label className="block text-[13px] font-medium text-qblack mb-2">
        Пункт выдачи <span className="text-qred">*</span>
      </label>

      <select
        value={selectedCode || ""}
        onChange={(event) =>
          onSelect(
            points.find((point) => point.code === event.target.value) || null
          )
        }
        required
        className="w-full h-[50px] px-4 border border-[#EDEDED] rounded focus:border-qyellow focus:outline-none text-[14px] text-qblack bg-white"
      >
        <option value="">Выберите пункт выдачи ({points.length})</option>
        {points.map((point) => (
          <option key={point.code} value={point.code}>
            {point.address}
          </option>
        ))}
      </select>

      {selectedPoint && (
        <div className="mt-3 p-3 bg-[#F6F6F6] rounded text-[13px] text-qgray">
          <p className="font-medium text-qblack">{selectedPoint.name}</p>
          <p>{selectedPoint.address}</p>
          {selectedPoint.workTime && <p>Режим работы: {selectedPoint.workTime}</p>}
          {selectedPoint.phone && <p>Телефон: {selectedPoint.phone}</p>}
        </div>
      )}
    </div>
  );
}
