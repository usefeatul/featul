"use client";

import * as React from "react";
import { FillPenIcon } from "@featul/ui/icons/fill-pen";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { SelectBoxIcon } from "@featul/ui/icons/select-box";
import { ArrowUpRight, Plus, Redo2, Type, Undo2, X } from "lucide-react";

type Tool = "draw" | "arrow" | "rect" | "text";
type Point = { x: number; y: number };

type Stroke =
  | { kind: "draw"; points: Point[]; color: string; width: number }
  | { kind: "arrow"; from: Point; to: Point; color: string; width: number }
  | { kind: "rect"; from: Point; to: Point; color: string; width: number }
  | { kind: "text"; at: Point; value: string; color: string; size: number };

type Props = {
  imageUrl: string;
  accent: string;
  ink: string;
  attaching?: boolean;
  onCancel: () => void;
  onAttach: (dataUrl: string) => void;
};

function distance(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function eventPoint(
  event: Pick<PointerEvent, "clientX" | "clientY">,
  canvas: HTMLCanvasElement,
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (stroke.kind === "draw") {
    if (stroke.points.length < 2) {
      ctx.restore();
      return;
    }
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0]!.x, stroke.points[0]!.y);
    for (let i = 1; i < stroke.points.length; i += 1) {
      const prev = stroke.points[i - 1]!;
      const point = stroke.points[i]!;
      ctx.quadraticCurveTo(
        prev.x,
        prev.y,
        (prev.x + point.x) / 2,
        (prev.y + point.y) / 2,
      );
    }
    const last = stroke.points[stroke.points.length - 1]!;
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  } else if (stroke.kind === "arrow") {
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(stroke.from.x, stroke.from.y);
    ctx.lineTo(stroke.to.x, stroke.to.y);
    ctx.stroke();
    const angle = Math.atan2(
      stroke.to.y - stroke.from.y,
      stroke.to.x - stroke.from.x,
    );
    const head = stroke.width * 4.2;
    ctx.beginPath();
    ctx.moveTo(stroke.to.x, stroke.to.y);
    ctx.lineTo(
      stroke.to.x - head * Math.cos(angle - 0.4),
      stroke.to.y - head * Math.sin(angle - 0.4),
    );
    ctx.lineTo(
      stroke.to.x - head * Math.cos(angle + 0.4),
      stroke.to.y - head * Math.sin(angle + 0.4),
    );
    ctx.closePath();
    ctx.fill();
  } else if (stroke.kind === "rect") {
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    const x = Math.min(stroke.from.x, stroke.to.x);
    const y = Math.min(stroke.from.y, stroke.to.y);
    ctx.strokeRect(
      x,
      y,
      Math.abs(stroke.to.x - stroke.from.x),
      Math.abs(stroke.to.y - stroke.from.y),
    );
  } else {
    ctx.fillStyle = stroke.color;
    ctx.font = `600 ${stroke.size}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(stroke.value, stroke.at.x, stroke.at.y);
  }
  ctx.restore();
}

const TOOLS: { id: Tool; label: string; shortcut: string }[] = [
  { id: "draw", label: "Draw", shortcut: "1" },
  { id: "arrow", label: "Arrow", shortcut: "2" },
  { id: "rect", label: "Highlight", shortcut: "3" },
  { id: "text", label: "Text", shortcut: "4" },
];

function toolButtonClass(active: boolean) {
  return `flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
    active
      ? "bg-[rgb(var(--widget-fg)/0.1)] text-[rgb(var(--widget-fg))]"
      : "text-[rgb(var(--widget-fg)/0.5)] hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
  }`;
}

export function ScreenshotAnnotator({
  imageUrl,
  accent,
  ink,
  attaching = false,
  onCancel,
  onAttach,
}: Props) {
  const imageRef = React.useRef<HTMLImageElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = React.useState<Tool>("draw");
  const [color, setColor] = React.useState(accent);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = React.useState<Stroke[]>([]);
  const [draft, setDraft] = React.useState<Stroke | null>(null);
  const [textDraft, setTextDraft] = React.useState<{
    at: Point;
    value: string;
  } | null>(null);
  const drawingRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);

  const colors = React.useMemo(
    () => [accent, "#ef4444", "#f59e0b", "#22c55e", ink],
    [accent, ink],
  );

  const markWidth = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 6;
    return Math.max(4, Math.round(Math.min(canvas.width, canvas.height) * 0.007));
  }, []);

  const textSize = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 28;
    return Math.max(22, Math.round(Math.min(canvas.width, canvas.height) * 0.032));
  }, []);

  const paint = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;
    if (!canvas || !ctx || !image || !image.naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
    if (draft) drawStroke(ctx, draft);
  }, [draft, strokes]);

  const fitCanvas = React.useCallback(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !image.naturalWidth) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    setReady(true);
    paint();
  }, [paint]);

  React.useEffect(() => {
    paint();
  }, [paint]);

  React.useEffect(() => {
    const image = imageRef.current;
    if (image?.complete && image.naturalWidth) fitCanvas();
  }, [fitCanvas, imageUrl]);

  const pushStroke = React.useCallback((stroke: Stroke) => {
    setStrokes((prev) => [...prev, stroke]);
    setRedoStack([]);
  }, []);

  const undo = React.useCallback(() => {
    setStrokes((prev) => {
      if (!prev.length) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      if (last) setRedoStack((stack) => [...stack, last]);
      return next;
    });
  }, []);

  const redo = React.useCallback(() => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      if (last) setStrokes((stack) => [...stack, last]);
      return next;
    });
  }, []);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (attaching) return;
      const typing = event.target instanceof HTMLInputElement;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (event.key === "Escape") {
        if (textDraft) {
          setTextDraft(null);
          return;
        }
        onCancel();
        return;
      }
      if (typing) return;
      const nextTool = TOOLS.find((item) => item.shortcut === event.key);
      if (nextTool) setTool(nextTool.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attaching, onCancel, redo, textDraft, undo]);

  const commitText = React.useCallback(() => {
    if (!textDraft) return;
    const value = textDraft.value.trim();
    if (value) {
      pushStroke({
        kind: "text",
        at: textDraft.at,
        value,
        color,
        size: textSize(),
      });
    }
    setTextDraft(null);
  }, [color, pushStroke, textDraft, textSize]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (attaching || event.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = eventPoint(event.nativeEvent, canvas);
    if (tool === "text") {
      commitText();
      setTextDraft({ at: point, value: "" });
      return;
    }
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const width = markWidth();
    if (tool === "draw") {
      setDraft({ kind: "draw", points: [point], color, width });
    } else if (tool === "arrow") {
      setDraft({ kind: "arrow", from: point, to: point, color, width });
    } else {
      setDraft({ kind: "rect", from: point, to: point, color, width });
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !draft) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = eventPoint(event.nativeEvent, canvas);
    if (draft.kind === "draw") {
      const last = draft.points[draft.points.length - 1];
      if (last && distance(last, point) < 1.5) return;
      setDraft({ ...draft, points: [...draft.points, point] });
    } else if (draft.kind === "arrow" || draft.kind === "rect") {
      setDraft({ ...draft, to: point });
    }
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (draft) {
      const tiny =
        draft.kind === "draw"
          ? draft.points.length < 2
          : draft.kind === "text"
            ? true
            : distance(draft.from, draft.to) < 4;
      if (!tiny) pushStroke(draft);
    }
    setDraft(null);
  };

  const attach = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;
    if (!canvas || !ctx || !image) return;
    const pending = textDraft?.value.trim()
      ? ([
          {
            kind: "text",
            at: textDraft.at,
            value: textDraft.value.trim(),
            color,
            size: textSize(),
          },
        ] satisfies Stroke[])
      : [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const stroke of [...strokes, ...pending]) drawStroke(ctx, stroke);
    onAttach(canvas.toDataURL("image/jpeg", 0.84));
  };

  const textStyle = (): React.CSSProperties => {
    const canvas = canvasRef.current;
    if (!canvas || !textDraft) return { display: "none" };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;
    return {
      left: rect.left + textDraft.at.x * scaleX,
      top: rect.top + textDraft.at.y * scaleY - textSize() * scaleY,
      fontSize: Math.max(14, textSize() * scaleY),
      color,
    };
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[rgb(var(--widget-surface))]">
      <header className="flex shrink-0 items-center gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-tight">
            Mark it up
          </p>
          <p className="mt-0.5 text-xs text-[rgb(var(--widget-fg)/0.45)]">
            Draw, then attach to your request.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={attaching}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-[rgb(var(--widget-fg)/0.45)] transition-colors hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))] disabled:opacity-40"
          aria-label="Cancel screenshot"
        >
          <X className="size-4" />
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-[4.5rem] pt-1">
        <img
          ref={imageRef}
          src={imageUrl}
          alt=""
          onLoad={fitCanvas}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`max-h-full max-w-full cursor-crosshair touch-none rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.04)] ${
            ready ? "" : "opacity-0"
          }`}
          style={{ width: "auto", height: "auto" }}
        />
        {!ready ? (
          <LoaderIcon className="size-5 animate-spin text-[rgb(var(--widget-fg)/0.4)]" />
        ) : null}
      </div>

      {textDraft ? (
        <input
          autoFocus
          value={textDraft.value}
          onChange={(event) =>
            setTextDraft({ ...textDraft, value: event.target.value })
          }
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setTextDraft(null);
            }
          }}
          className="fixed z-20 min-w-[8rem] border-0 bg-transparent font-semibold outline-none"
          style={textStyle()}
          placeholder="Type…"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-lg border border-[rgb(var(--widget-fg)/0.12)] bg-[rgb(var(--widget-surface))] p-1">
          <div className="flex items-center">
            {TOOLS.map((item) => {
              const active = tool === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTool(item.id)}
                  title={`${item.label} (${item.shortcut})`}
                  aria-label={item.label}
                  aria-pressed={active}
                  className={toolButtonClass(active)}
                >
                  {item.id === "draw" ? (
                    <FillPenIcon className="size-4" size={16} />
                  ) : item.id === "arrow" ? (
                    <ArrowUpRight className="size-4" strokeWidth={2} />
                  ) : item.id === "rect" ? (
                    <SelectBoxIcon className="size-4" size={16} />
                  ) : (
                    <Type className="size-4" strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mx-0.5 h-5 w-px shrink-0 bg-[rgb(var(--widget-fg)/0.1)]" />
          <div className="flex items-center">
            <button
              type="button"
              onClick={undo}
              disabled={!strokes.length}
              title="Undo"
              aria-label="Undo"
              className={`${toolButtonClass(false)} disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
            >
              <Undo2 className="size-3.5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!redoStack.length}
              title="Redo"
              aria-label="Redo"
              className={`${toolButtonClass(false)} disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
            >
              <Redo2 className="size-3.5" strokeWidth={2} />
            </button>
          </div>
          <div className="mx-0.5 h-5 w-px shrink-0 bg-[rgb(var(--widget-fg)/0.1)]" />
          <div className="flex items-center gap-1.5 px-1.5">
            {colors.map((value) => {
              const active = color.toLowerCase() === value.toLowerCase();
              return (
                <button
                  key={value}
                  type="button"
                  title="Ink color"
                  aria-label={`Color ${value}`}
                  aria-pressed={active}
                  onClick={() => setColor(value)}
                  className={`size-4 cursor-pointer rounded-full border transition-[transform,box-shadow] ${
                    active
                      ? "scale-110 border-[rgb(var(--widget-fg)/0.7)]"
                      : "border-[rgb(var(--widget-fg)/0.18)] hover:scale-105"
                  }`}
                  style={{ background: value }}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={attach}
            disabled={attaching || !ready}
            className="ml-0.5 inline-flex h-8 cursor-pointer items-center gap-1 rounded-md bg-[rgb(var(--widget-cta))] px-2.5 text-xs font-semibold text-[rgb(var(--widget-cta-fg))] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {attaching ? (
              <LoaderIcon className="size-3.5 animate-spin" />
            ) : (
              <>
                <Plus className="size-3.5" strokeWidth={2.5} />
                Attach
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
