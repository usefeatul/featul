import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { ImageIcon } from "@featul/ui/icons/image";
import { cn } from "@featul/ui/lib/utils";
import type { NodeViewProps } from "@tiptap/core";
import { NodeViewWrapper } from "@tiptap/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export const FigureView = ({
  node,
  updateAttributes,
  editor,
  selected,
}: NodeViewProps) => {
  const { src, alt, caption, width, align } = node.attrs as {
    src: string;
    alt: string;
    caption: string;
    width: string;
    align: "left" | "center" | "right";
  };

  const [altValue, setAltValue] = useState(alt || "");
  const [captionValue, setCaptionValue] = useState(caption || "");
  const [widthValue, setWidthValue] = useState(width || "100");
  const [alignValue, setAlignValue] = useState<"left" | "center" | "right">(
    align || "center",
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const isEditable = editor.isEditable;
  const figureRef = useRef<HTMLElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Use useId to generate unique ids for the width, alt, and caption inputs
  const widthId = useId();
  const altId = useId();
  const captionId = useId();

  // Sync local state with node attributes when they change externally
  useEffect(() => {
    setAltValue(alt || "");
    setCaptionValue(caption || "");
    setWidthValue(width || "100");
    setAlignValue(align || "center");
  }, [alt, caption, width, align]);

  // Close popover when node is deselected
  useEffect(() => {
    if (!selected || !isEditable) {
      setIsPopoverOpen(false);
    }
  }, [selected, isEditable]);

  // Handle image click to toggle popover
  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      if (isEditable && selected) {
        e.preventDefault();
        e.stopPropagation();
        setIsPopoverOpen((prev) => !prev);
      }
    },
    [isEditable, selected],
  );

  // Handle keyboard events for accessibility
  const handleImageKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isEditable && selected && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        e.stopPropagation();
        setIsPopoverOpen((prev) => !prev);
      }
    },
    [isEditable, selected],
  );

  const handleAltChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAlt = e.target.value;
      setAltValue(newAlt);
      updateAttributes({ alt: newAlt });
    },
    [updateAttributes],
  );

  const handleCaptionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newCaption = e.target.value;
      setCaptionValue(newCaption);
      updateAttributes({ caption: newCaption });
    },
    [updateAttributes],
  );

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newWidth = e.target.value;
      // Only allow numbers and empty string
      if (!/^\d*$/.test(newWidth)) {
        return;
      }

      // Allow any valid number input during typing
      setWidthValue(newWidth);

      // Only update attributes if we have a valid number
      if (newWidth && Number.parseInt(newWidth, 10) > 0) {
        updateAttributes({ width: newWidth });
      }
    },
    [updateAttributes],
  );

  const handleWidthBlur = useCallback(() => {
    // Validate and clamp on blur - only percent for now
    const numValue = Number.parseInt(widthValue, 10) || 100;
    const minValue = 10;
    const maxValue = 100;

    const clampedValue = Math.max(minValue, Math.min(maxValue, numValue));
    const finalWidth = String(clampedValue);

    setWidthValue(finalWidth);
    updateAttributes({ width: finalWidth, widthUnit: "percent" });
  }, [widthValue, updateAttributes]);

  // Width unit change disabled - only percent for now
  // const handleWidthUnitChange = useCallback(
  //   (newUnit: "percent" | "pixel") => {
  //     setWidthUnitValue(newUnit);
  //     // Convert width value when switching units
  //     const currentNum = Number.parseInt(widthValue, 10) || 100;
  //     const containerWidth =
  //       figureRef.current?.parentElement?.clientWidth || 800;
  //     let newWidth = widthValue;

  //     if (newUnit === "pixel" && widthUnitValue === "percent") {
  //       // Converting from % to px - use actual container width
  //       newWidth = String(Math.round((currentNum / 100) * containerWidth));
  //     } else if (newUnit === "percent" && widthUnitValue === "pixel") {
  //       // Converting from px to %
  //       newWidth = String(Math.round((currentNum / containerWidth) * 100));
  //     }

  //     setWidthValue(newWidth);
  //     updateAttributes({ width: newWidth, widthUnit: newUnit });
  //   },
  //   [updateAttributes, widthValue, widthUnitValue]
  // );

  const handleAlignChange = useCallback(
    (newAlign: "left" | "center" | "right") => {
      setAlignValue(newAlign);
      // Use setTimeout to avoid Tiptap position conflicts
      setTimeout(() => {
        updateAttributes({ align: newAlign });
      }, 0);
    },
    [updateAttributes],
  );

  // Resize handle drag handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      const currentWidth = Number.parseInt(widthValue, 10) || 100;
      startWidthRef.current = currentWidth;
    },
    [widthValue],
  );

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startXRef.current;
      const containerWidth =
        figureRef.current?.parentElement?.clientWidth || 800;

      // Only percent for now
      const deltaPercent = (deltaX / containerWidth) * 100;
      const newWidth = Math.max(
        10,
        Math.min(100, startWidthRef.current + deltaPercent),
      );

      const roundedWidth = Math.round(newWidth);
      setWidthValue(String(roundedWidth));
      updateAttributes({ width: String(roundedWidth), widthUnit: "percent" });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, updateAttributes]);

  // Calculate alignment styles - only percent for now
  const alignmentStyles: React.CSSProperties = {
    width: `${widthValue}%`,
    marginLeft: alignValue === "left" ? 0 : "auto",
    marginRight: alignValue === "right" ? 0 : "auto",
  };

  return (
    <NodeViewWrapper className="my-5" data-drag-handle>
      <Popover
        modal
        onOpenChange={(open) => {
          if (isEditable) {
            setIsPopoverOpen(open);
          }
        }}
        open={isEditable ? isPopoverOpen : false}
      >
        <PopoverTrigger asChild>
          <figure
            aria-label="Image settings"
            className={cn(
              "relative",
              isEditable && "cursor-pointer",
              isEditable &&
                selected &&
                "outline-2 outline-primary outline-offset-2",
            )}
            onClick={handleImageClick}
            onKeyDown={handleImageKeyDown}
            ref={figureRef}
            style={alignmentStyles}
            tabIndex={isEditable && selected ? 0 : -1}
          >
            <img
              alt={altValue}
              className="h-auto w-full rounded-md  border border-muted"
              src={src}
            />

            {/* Resize handles - only shown when selected */}
            {isEditable && selected && (
              <>
                {/* Left handle */}
                <button
                  className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-0 z-20 h-16 w-2 cursor-ew-resize rounded-mdbg-primary opacity-0 transition-opacity hover:opacity-100"
                  onMouseDown={handleResizeStart}
                  title="Drag to resize"
                  type="button"
                />
                {/* Right handle */}
                <button
                  className="-translate-y-1/2 absolute top-1/2 right-0 z-20 h-16 w-2 translate-x-1/2 cursor-ew-resize rounded-mdbg-primary opacity-0 transition-opacity hover:opacity-100"
                  onMouseDown={handleResizeStart}
                  title="Drag to resize"
                  type="button"
                />
              </>
            )}

            {/* Caption - only shown when it has content */}
            {captionValue && (
              <figcaption className="mt-2 text-center text-muted-foreground text-sm italic">
                <p>{captionValue}</p>
              </figcaption>
            )}
          </figure>
        </PopoverTrigger>

        {/* Toolbar in Popover - only shown in editable mode */}
        {isEditable && (
          <PopoverContent
            align="start"
            className="p-1 bg-muted dark:bg-black/40 rounded-2xl gap-1 w-80 shadow-none border-none"
            onOpenAutoFocus={(event) => event.preventDefault()}
            side="right"
            sideOffset={18}
          >
            <div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5 mb-1">
              <div className="flex items-center gap-2 text-sm font-normal">
                <ImageIcon className="size-3.5 text-primary" />
                Image Settings
              </div>
            </div>

            <div className="bg-card rounded-xl p-3 dark:bg-black border border-border flex flex-col gap-3">
              {/* Width Controls - Only percent for now */}
              <div className="space-y-1">
                <Label
                  className="font-normal text-xs text-muted-foreground"
                  htmlFor={widthId}
                >
                  Width (%)
                </Label>
                <Input
                  className="h-8 text-sm placeholder:text-muted-foreground"
                  id={widthId}
                  onBlur={handleWidthBlur}
                  onChange={handleWidthChange}
                  placeholder="100"
                  type="text"
                  value={widthValue}
                />
              </div>

              {/* Alignment Controls */}
              <div className="space-y-1">
                <Label className="font-normal text-xs text-muted-foreground">
                  Alignment
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    className="!rounded-md w-full h-8 shadow-none border-border data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:border-primary/20"
                    data-active={alignValue === "left"}
                    onClick={() => handleAlignChange("left")}
                    type="button"
                    variant="card"
                    size="sm"
                  >
                    Left
                  </Button>
                  <Button
                    className="!rounded-md w-full h-8 shadow-none border-border data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:border-primary/20"
                    data-active={alignValue === "center"}
                    onClick={() => handleAlignChange("center")}
                    type="button"
                    variant="card"
                    size="sm"
                  >
                    Center
                  </Button>
                  <Button
                    className="!rounded-md w-full h-8 shadow-none border-border data-[active=true]:bg-primary/20 data-[active=true]:text-primary data-[active=true]:border-primary/20"
                    data-active={alignValue === "right"}
                    onClick={() => handleAlignChange("right")}
                    type="button"
                    variant="card"
                    size="sm"
                  >
                    Right
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  className="font-normal text-xs text-muted-foreground"
                  htmlFor={altId}
                >
                  Alt Text
                </Label>
                <Input
                  className="h-8 text-sm placeholder:text-muted-foreground"
                  id={altId}
                  onChange={handleAltChange}
                  placeholder="Describe the image..."
                  type="text"
                  value={altValue}
                />
              </div>
              <div className="space-y-1">
                <Label
                  className="font-normal text-xs text-muted-foreground"
                  htmlFor={captionId}
                >
                  Caption
                </Label>
                <Input
                  className="h-8 text-sm placeholder:text-muted-foreground"
                  id={captionId}
                  onChange={handleCaptionChange}
                  placeholder="Add a caption..."
                  type="text"
                  value={captionValue}
                />
              </div>
            </div>
          </PopoverContent>
        )}
      </Popover>
    </NodeViewWrapper>
  );
};
