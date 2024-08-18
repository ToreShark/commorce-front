import { useCallback, useState } from "react";

function usePriceRange(initialMin: number, initialMax: number) {
  const [range, setRange] = useState<[number, number]>([
    initialMin,
    initialMax,
  ]);
  const [bounds, setBounds] = useState<[number, number]>([
    initialMin,
    initialMax,
  ]);

  const updateRange = useCallback((newMin: number, newMax: number) => {
    setRange([newMin, newMax]);
  }, []);

  const updateBounds = useCallback((newMin: number, newMax: number) => {
    setBounds([newMin, newMax]);
    setRange([newMin, newMax]);
  }, []);

  return { range, bounds, updateRange, updateBounds };
}

export default usePriceRange;
