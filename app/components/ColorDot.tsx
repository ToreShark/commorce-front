import { colorSwatch, isLightSwatch } from "@/app/lib/colorSwatch";

interface ColorDotProps {
  color: string;
  size?: number;
}

/** Кружок цвета. Для цвета, которого нет в справочнике, — пунктирный пустой кружок. */
export default function ColorDot({ color, size = 14 }: ColorDotProps) {
  const css = colorSwatch(color);
  return (
    <span
      aria-hidden
      title={color}
      className={`inline-block shrink-0 rounded-full ${
        css === null
          ? "border border-dashed border-qgray"
          : isLightSwatch(css)
            ? "border border-qgray-border"
            : ""
      }`}
      style={{ width: size, height: size, background: css ?? "transparent" }}
    />
  );
}
