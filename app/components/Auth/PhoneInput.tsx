"use client";

import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string, formattedValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

/**
 * Умный компонент ввода телефона для Казахстана
 * - Автоматически добавляет +7
 * - Форматирует как +7 (XXX) XXX-XX-XX
 * - Возвращает чистый номер для API (например: 77073816081)
 */
export default function PhoneInput({
  value,
  onChange,
  placeholder = "Номер телефона",
  disabled = false,
  error,
  className = "",
  id,
  name,
  required = false,
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Форматирование номера для отображения
  const formatPhoneForDisplay = (digits: string): string => {
    // Убираем всё кроме цифр
    let clean = digits.replace(/\D/g, "");

    // Если начинается с 8 - заменяем на 7
    if (clean.startsWith("8") && clean.length > 1) {
      clean = "7" + clean.slice(1);
    }

    // Если начинается с +7 - убираем +
    if (clean.startsWith("7") && clean.length > 1) {
      // Всё ок
    } else if (clean.length > 0 && !clean.startsWith("7")) {
      // Если не начинается с 7 - добавляем
      clean = "7" + clean;
    }

    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    clean = clean.slice(0, 11);

    // Форматируем
    if (clean.length === 0) return "";
    if (clean.length <= 1) return `+${clean}`;
    if (clean.length <= 4) return `+${clean[0]} (${clean.slice(1)}`;
    if (clean.length <= 7)
      return `+${clean[0]} (${clean.slice(1, 4)}) ${clean.slice(4)}`;
    if (clean.length <= 9)
      return `+${clean[0]} (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7)}`;
    return `+${clean[0]} (${clean.slice(1, 4)}) ${clean.slice(4, 7)}-${clean.slice(7, 9)}-${clean.slice(9)}`;
  };

  // Извлечение чистого номера для API
  const extractCleanNumber = (formatted: string): string => {
    return formatted.replace(/\D/g, "");
  };

  // Инициализация из props
  useEffect(() => {
    if (value) {
      setDisplayValue(formatPhoneForDisplay(value));
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneForDisplay(input);
    const clean = extractCleanNumber(formatted);

    setDisplayValue(formatted);
    onChange(clean, formatted);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Разрешаем: backspace, delete, tab, escape, enter, стрелки
    if (
      ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
    ) {
      return;
    }

    // Разрешаем Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
      return;
    }

    // Блокируем нецифровые символы
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleFocus = () => {
    // При фокусе, если пусто - показываем +7
    if (!displayValue) {
      const formatted = "+7";
      setDisplayValue(formatted);
      onChange("7", formatted);
    }
  };

  const isValid = extractCleanNumber(displayValue).length === 11;

  return (
    <div className={`phone-input-wrapper ${className}`}>
      <div className="relative">
        <input
          type="tel"
          id={id}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="tel"
          className={`
            w-full px-4 py-3 border rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? "border-red-500 bg-red-50" : "border-gray-300"}
            ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          `}
        />
        {/* Иконка WhatsApp */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg
            className={`w-5 h-5 ${isValid ? "text-green-500" : "text-gray-400"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      <p className="mt-1 text-xs text-gray-500">
        Код подтверждения придёт в WhatsApp
      </p>
    </div>
  );
}
