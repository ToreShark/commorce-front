import React from "react";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import Typography from "@mui/material/Typography";

interface PriceFilterProps {
  range: [number, number];
  bounds: [number, number];
  onRangeChange: (newMin: number, newMax: number) => void;
  onPriceUpdate: (newMin: number, newMax: number) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  range,
  bounds,
  onRangeChange,
  onPriceUpdate,
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    if (Array.isArray(newValue)) {
      onRangeChange(newValue[0], newValue[1]);
    }
  };

  const handleChangeCommitted = (
    event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    if (Array.isArray(newValue)) {
      onPriceUpdate(newValue[0], newValue[1]);
    }
  };

  return (
    <Box sx={{ width: "100%", padding: 2 }}>
      <Typography id="price-range-slider" gutterBottom>
        Диапазон цен
      </Typography>
      <Slider
        key={`slider-${bounds[0]}-${bounds[1]}`}
        sx={{ width: "100%" }}
        getAriaLabel={() => "Диапазон цен"}
        value={range}
        onChange={handleChange}
        onChangeCommitted={handleChangeCommitted}
        valueLabelDisplay="auto"
        getAriaValueText={(value) => `${value} тенге`}
        min={bounds[0]}
        max={bounds[1]}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Typography variant="body2">Мин: {range[0]} тенге</Typography>
        <Typography variant="body2">Макс: {range[1]} тенге</Typography>
      </Box>
    </Box>
  );
};

export default React.memo(PriceFilter);