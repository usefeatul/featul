import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { cn } from "@featul/ui/lib/utils";
import { Undo2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import "../styles/color-picker.css";

const PRESET_COLORS = [
  "#fb7185", // Rose
  "#fdba74", // Orange
  "#d9f99d", // Lime
  "#a7f3d0", // Emerald
  "#a5f3fc", // Cyan
  "#a5b4fc", // Indigo
  "#fbbf24", // Amber
  "#f472b6", // Pink
];

export const ColorPicker = ({
  color,
  onChange,
  onClear,
}: {
  color?: string;
  onChange: (color: string) => void;
  onClear: () => void;
}) => {
  const [hexInput, setHexInput] = useState(color || "");

  useEffect(() => {
    setHexInput(color || "");
  }, [color]);

  const handleHexInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setHexInput(value);

      // Validate hex color format
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        onChange(value);
      }
    },
    [onChange]
  );

  const handleColorChange = useCallback(
    (newColor: string) => {
      setHexInput(newColor);
      onChange(newColor);
    },
    [onChange]
  );

  return (
    <div className="color-picker flex flex-col gap-3 px-3 py-2">
      {/* Color Picker */}
      <div className="w-full rounded-md  overflow-hidden">
        <HexColorPicker
          color={color || "#000000"}
          onChange={handleColorChange}
        />
      </div>

      {/* Hex Input */}
      <div className="flex items-center gap-3">
        <Input
          className="h-9 font-mono text-xs flex-1"
          onChange={handleHexInputChange}
          placeholder="#000000"
          value={hexInput}
        />
        <Button
          className="h-9 shrink-0"
          onClick={onClear}
          size="icon"
          title="Reset color"
          type="button"
          variant="plain"
        >
          <Undo2 className="size-4" />
        </Button>
      </div>

      {/* Preset Colors */}
      <div className="flex items-center gap-1 flex-wrap">
        {PRESET_COLORS.map((presetColor) => (
          <button
            className={cn(
              "size-8 rounded-md  border-2 transition-all hover:scale-110 hover:shadow-sm",
              color === presetColor
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            )}
            key={presetColor}
            onClick={() => handleColorChange(presetColor)}
            style={{ backgroundColor: presetColor }}
            title={presetColor}
            type="button"
          />
        ))}
      </div>
    </div>
  );
};
