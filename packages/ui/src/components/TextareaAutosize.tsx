"use client";

import type { KeyboardEvent, ForwardedRef } from "react";
import { forwardRef, useState } from "react";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import ReactTextareaAutosize from "react-textarea-autosize";
import { useIsomorphicLayoutEffect } from "@featul/ui/hooks/use-isomorphic-layout-effect"

export type ExtendedTextareaAutosizeProps = TextareaAutosizeProps & {
  onEnterPress?: () => void;
};

function TextareaAutosizeBase(
  { onEnterPress, onKeyDown, ...props }: ExtendedTextareaAutosizeProps,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const [isRerendered, setIsRerendered] = useState(false);

  useIsomorphicLayoutEffect(() => setIsRerendered(true), []);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onEnterPress?.();
    }

    onKeyDown?.(event);
  }

  return isRerendered ? (
    <ReactTextareaAutosize ref={ref} onKeyDown={handleKeyDown} {...props} />
  ) : null;
}

export const TextareaAutosize = forwardRef<
  HTMLTextAreaElement,
  ExtendedTextareaAutosizeProps
>(TextareaAutosizeBase);

TextareaAutosize.displayName = "TextareaAutosize";


