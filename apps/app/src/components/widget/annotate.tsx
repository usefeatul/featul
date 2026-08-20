"use client";

import * as React from "react";
import { FillPenIcon } from "@featul/ui/icons/fill-pen";
import { LoaderIcon } from "@featul/ui/icons/loader";
import {
  ArrowUpRight,
  EyeOff,
  Highlighter,
  Plus,
  Redo2,
  Trash2,
  Type,
  Undo2,
  X,
} from "lucide-react";

type Tool = "draw" | "arrow" | "rect" | "text" | "redact" | "pin";
type Point = { x: number; y: number };
type Weight = 0 | 1 | 2;

type Stroke =
  | { kind: "draw"; points: Point[]; color: string; width: number }
  | { kind: "arrow"; from: Point; to: Point; color: string; width: number }
  | { kind: "rect"; from: Point; to: Point; color: string; width: number }
  | { kind: "redact"; from: Point; to: Point }
  | { kind: "text"; at: Point; value: string; color: string; size: number }
  | { kind: "pin"; at: Point; n: number; color: string; size: number };

type Props = {
  imageUrl: string;
  accent: string;
  ink: string;
  attaching?: boolean;
  onCancel: () => void;
  onAttach: (dataUrl: string) => void;
};

const WEIGHTS = [1, 1.7, 2.5] as const;
const TOOLS: { id: Tool; label: string; shortcut: string }[] = [
  { id: "draw", label: "Draw", shortcut: "1" },
  { id: "arrow", label: "Arrow", shortcut: "2" },
  { id: "rect", label: "Highlight", shortcut: "3" },
  { id: "text", label: "Text", shortcut: "4" },
  { id: "redact", label: "Hide", shortcut: "5" },
  { id: "pin", label: "Number", shortcut: "6" },
];

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

function hexRgb(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function withAlpha(color: string, alpha: number) {
  const rgb = hexRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

function box(from: Point, to: Point) {
  const x = Math.min(from.x, to.x);
  const y = Math.min(from.y, to.y);
  return { x, y, w: Math.abs(to.x - from.x), h: Math.abs(to.y - from.y) };
}

function constrainPoint(from: Point, to: Point, shift: boolean, square: boolean) {
  if (!shift) return to;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (square) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    return {
      x: from.x + Math.sign(dx || 1) * side,
      y: from.y + Math.sign(dy || 1) * side,
    };
  }
  return Math.abs(dx) > Math.abs(dy)
    ? { x: to.x, y: from.y }
    : { x: from.x, y: to.y };
}

function nextPinNumber(strokes: Stroke[]) {
  let max = 0;
  for (const stroke of strokes) {
    if (stroke.kind === "pin") max = Math.max(max, stroke.n);
  }
  return max + 1;
}

function pixelate(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  from: Point,
  to: Point,
) {
  const { x, y, w, h } = box(from, to);
  if (w < 4 || h < 4) return;
  const block = Math.max(10, Math.round(Math.min(w, h) / 7));
  const tw = Math.max(1, Math.round(w / block));
  const th = Math.max(1, Math.round(h / block));
  const tmp = document.createElement("canvas");
  tmp.width = tw;
  tmp.height = th;
  const tctx = tmp.getContext("2d");
  if (!tctx) return;
  tctx.imageSmoothingEnabled = false;
  tctx.drawImage(image, x, y, w, h, 0, 0, tw, th);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tmp, 0, 0, tw, th, x, y, w, h);
  ctx.imageSmoothingEnabled = true;
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  image: CanvasImageSource,
  preview = false,
) {
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
    const { x, y, w, h } = box(stroke.from, stroke.to);
    ctx.fillStyle = withAlpha(stroke.color, 0.28);
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
  } else if (stroke.kind === "redact") {
    if (preview) {
      const { x, y, w, h } = box(stroke.from, stroke.to);
      ctx.fillStyle = "rgba(24, 24, 27, 0.45)";
      ctx.strokeStyle = "rgba(250, 250, 250, 0.7)";
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
    } else {
      pixelate(ctx, image, stroke.from, stroke.to);
    }
  } else if (stroke.kind === "text") {
    ctx.font = `600 ${stroke.size}px ui-sans-serif, system-ui, sans-serif`;
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(3, stroke.size * 0.12);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.strokeText(stroke.value, stroke.at.x, stroke.at.y);
    ctx.fillStyle = stroke.color;
    ctx.fillText(stroke.value, stroke.at.x, stroke.at.y);
  } else {
    const radius = stroke.size * 0.72;
    ctx.beginPath();
    ctx.arc(stroke.at.x, stroke.at.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = stroke.color;
    ctx.fill();
    ctx.font = `700 ${Math.round(radius * 0.95)}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(stroke.n), stroke.at.x, stroke.at.y + 1);
  }
  ctx.restore();
}

function toolButtonClass(active: boolean) {
  return `flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors ${
    active
      ? "bg-[rgb(var(--widget-fg)/0.1)] text-[rgb(var(--widget-fg))]"
      : "text-[rgb(var(--widget-fg)/0.5)] hover:bg-[rgb(var(--widget-fg)/0.06)] hover:text-[rgb(var(--widget-fg))]"
  }`;
}

function cursorFor(tool: Tool) {
  if (tool === "text") return "text";
  if (tool === "pin") return "pointer";
  return "crosshair";
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
  const strokesRef = React.useRef<Stroke[]>([]);
  const draftRef = React.useRef<Stroke | null>(null);
  const drawingRef = React.useRef(false);
  const shiftRef = React.useRef(false);
  const [tool, setTool] = React.useState<Tool>("draw");
  const [color, setColor] = React.useState(accent);
  const [weight, setWeight] = React.useState<Weight>(1);
  const [strokes, setStrokes] = React.useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = React.useState<Stroke[]>([]);
  const [textDraft, setTextDraft] = React.useState<{
    at: Point;
    value: string;
  } | null>(null);
  const [ready, setReady] = React.useState(false);
  const [, bump] = React.useState(0);

  strokesRef.current = strokes;

  const colors = React.useMemo(
    () => [accent, "#ef4444", "#f59e0b", "#22c55e", ink],
    [accent, ink],
  );

  const markWidth = React.useCallback(() => {
    const canvas = canvasRef.current;
    const scale = canvas
      ? Math.max(4, Math.round(Math.min(canvas.width, canvas.height) * 0.006))
      : 5;
    return Math.round(scale * WEIGHTS[weight]);
  }, [weight]);

  const textSize = React.useCallback(() => {
    const canvas = canvasRef.current;
    const base = canvas
      ? Math.max(22, Math.round(Math.min(canvas.width, canvas.height) * 0.03))
      : 26;
    return Math.round(base * WEIGHTS[weight]);
  }, [weight]);

  const paint = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;
    if (!canvas || !ctx || !image || !image.naturalWidth) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const stroke of strokesRef.current) {
      drawStroke(ctx, stroke, image, false);
    }
    if (draftRef.current) drawStroke(ctx, draftRef.current, image, true);
  }, []);

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
  }, [paint, strokes]);

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
      const last = prev[prev.length - 1];
      if (last) setRedoStack((stack) => [...stack, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = React.useCallback(() => {
    setRedoStack((prev) => {
      if (!prev.length) return prev;
      const last = prev[prev.length - 1];
      if (last) setStrokes((stack) => [...stack, last]);
      return prev.slice(0, -1);
    });
  }, []);

  const clearAll = React.useCallback(() => {
    if (!strokesRef.current.length) return;
    setStrokes([]);
    setRedoStack([]);
    draftRef.current = null;
    setTextDraft(null);
  }, []);

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

  const attach = React.useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const image = imageRef.current;
    if (!canvas || !ctx || !image || attaching) return;
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
    for (const stroke of [...strokes, ...pending]) {
      drawStroke(ctx, stroke, image, false);
    }
    onAttach(canvas.toDataURL("image/jpeg", 0.84));
  }, [attaching, color, onAttach, strokes, textDraft, textSize]);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      shiftRef.current = event.shiftKey;
      if (attaching) return;
      const typing = event.target instanceof HTMLInputElement;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        attach();
        return;
      }
      if (event.key === "Escape") {
        if (textDraft) {
          setTextDraft(null);
          return;
        }
        if (drawingRef.current) {
          drawingRef.current = false;
          draftRef.current = null;
          paint();
          bump((value) => value + 1);
          return;
        }
        onCancel();
        return;
      }
      if (typing) return;
      if (event.key === "Enter") {
        event.preventDefault();
        attach();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        undo();
        return;
      }
      const nextTool = TOOLS.find((item) => item.shortcut === event.key);
      if (nextTool) setTool(nextTool.id);
    };
    const onShift = (event: KeyboardEvent) => {
      shiftRef.current = event.shiftKey;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onShift);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onShift);
    };
  }, [attach, attaching, onCancel, paint, redo, textDraft, undo]);

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
    if (tool === "pin") {
      pushStroke({
        kind: "pin",
        at: point,
        n: nextPinNumber(strokesRef.current),
        color,
        size: textSize(),
      });
      return;
    }
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const width = markWidth();
    if (tool === "draw") {
      draftRef.current = { kind: "draw", points: [point], color, width };
    } else if (tool === "arrow") {
      draftRef.current = { kind: "arrow", from: point, to: point, color, width };
    } else if (tool === "redact") {
      draftRef.current = { kind: "redact", from: point, to: point };
    } else {
      draftRef.current = { kind: "rect", from: point, to: point, color, width };
    }
    paint();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    shiftRef.current = event.shiftKey;
    if (!drawingRef.current || !draftRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = eventPoint(event.nativeEvent, canvas);
    const draft = draftRef.current;
    if (draft.kind === "draw") {
      const last = draft.points[draft.points.length - 1];
      if (last && distance(last, point) < 1.5) return;
      draft.points.push(point);
    } else if (
      draft.kind === "arrow" ||
      draft.kind === "rect" ||
      draft.kind === "redact"
    ) {
      draft.to = constrainPoint(
        draft.from,
        point,
        shiftRef.current,
        draft.kind !== "arrow",
      );
    }
    paint();
  };

  const onPointerUp = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const draft = draftRef.current;
    draftRef.current = null;
    if (draft) {
      const tiny =
        draft.kind === "draw"
          ? draft.points.length < 2
          : draft.kind === "text" || draft.kind === "pin"
            ? true
            : distance(draft.from, draft.to) < 6;
      if (!tiny) pushStroke(draft);
      else paint();
    }
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
      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
    };
  };

  const showInk = tool !== "redact";
  const showWeight = tool === "draw" || tool === "arrow" || tool === "rect" || tool === "text";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[rgb(var(--widget-surface))]">
      <header className="flex shrink-0 items-center gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold tracking-tight">
            Mark it up
          </p>
          <p className="mt-0.5 text-xs text-[rgb(var(--widget-fg)/0.45)]">
            Highlight, number, or hide details, then attach.
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
          className={`max-h-full max-w-full touch-none rounded-md border border-[rgb(var(--widget-fg)/0.1)] bg-[rgb(var(--widget-fg)/0.04)] ${
            ready ? "" : "opacity-0"
          }`}
          style={{ width: "auto", height: "auto", cursor: cursorFor(tool) }}
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
                    <Highlighter className="size-4" strokeWidth={2} />
                  ) : item.id === "text" ? (
                    <Type className="size-4" strokeWidth={2} />
                  ) : item.id === "redact" ? (
                    <EyeOff className="size-4" strokeWidth={2} />
                  ) : (
                    <span className="flex size-4 items-center justify-center rounded-full border border-current text-[9px] font-semibold leading-none">
                      1
                    </span>
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
            <button
              type="button"
              onClick={clearAll}
              disabled={!strokes.length}
              title="Clear marks"
              aria-label="Clear marks"
              className={`${toolButtonClass(false)} disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent`}
            >
              <Trash2 className="size-3.5" strokeWidth={2} />
            </button>
          </div>
          {showWeight ? (
            <>
              <div className="mx-0.5 h-5 w-px shrink-0 bg-[rgb(var(--widget-fg)/0.1)]" />
              <div className="flex items-center px-0.5">
                {([0, 1, 2] as Weight[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    title="Thickness"
                    aria-label={`Thickness ${value + 1}`}
                    aria-pressed={weight === value}
                    onClick={() => setWeight(value)}
                    className={toolButtonClass(weight === value)}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{
                        width: 4 + value * 3,
                        height: 4 + value * 3,
                      }}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {showInk ? (
            <>
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
                      className={`size-4 cursor-pointer rounded-full border transition-transform ${
                        active
                          ? "scale-110 border-[rgb(var(--widget-fg)/0.7)]"
                          : "border-[rgb(var(--widget-fg)/0.18)] hover:scale-105"
                      }`}
                      style={{ background: value }}
                    />
                  );
                })}
              </div>
            </>
          ) : null}
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
