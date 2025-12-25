"use client";

import { useState, useEffect, useRef } from "react";
import { CdekCity } from "@/app/lib/interfaces/cdek.interface";
import { searchCdekCities } from "@/app/lib/data";

interface CityAutocompleteProps {
  onCitySelect: (city: CdekCity) => void;
  placeholder?: string;
  initialValue?: string;
}

export default function CityAutocomplete({
  onCitySelect,
  placeholder = "Введите город",
  initialValue = "",
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(initialValue);
  const [cities, setCities] = useState<CdekCity[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce поиск городов
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setCities([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchCdekCities(query);
        setCities(results);
        setIsOpen(results.length > 0);
      } catch (error) {
        console.error("Ошибка поиска городов:", error);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (city: CdekCity) => {
    setQuery(city.fullName);
    setIsOpen(false);
    setCities([]);
    onCitySelect(city);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => cities.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      )}

      {isOpen && cities.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {cities.map((city) => (
            <li
              key={city.code}
              onClick={() => handleSelect(city)}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{city.city}</div>
              {city.region && (
                <div className="text-sm text-gray-500">{city.region}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
