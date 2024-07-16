import React from 'react';

interface PriceFilterProps {
  minPrice: number;
  maxPrice: number;
  setMinPrice: (price: number) => void;
  setMaxPrice: (price: number) => void;
  handlePriceUpdate: () => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({ minPrice, maxPrice, setMinPrice, setMaxPrice, handlePriceUpdate }) => {
  return (
    <>
      <div className="flex items-center">
        <div className="mr-4">
          <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
            Мин. цена
          </label>
          <input
            type="number"
            id="minPrice"
            value={minPrice || ""}
            onChange={(e) => setMinPrice(parseInt(e.target.value) || 0)}
            placeholder="Мин. цена"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
            Макс. цена
          </label>
          <input
            type="number"
            id="maxPrice"
            value={maxPrice || ""}
            onChange={(e) => setMaxPrice(parseInt(e.target.value) || 0)}
            placeholder="Макс. цена"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        onClick={handlePriceUpdate}
        className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Применить цены
      </button>
    </>
  );
};

export default PriceFilter;