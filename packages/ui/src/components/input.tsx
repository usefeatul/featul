import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { inputSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const inputVariants = cva(
  // Autofill: the browser's tint fades in so slowly it never shows, so the field keeps its own surface.
  "autofill:transition-[background-color] autofill:delay-[99999s] autofill:duration-[99999s] autofill:[-webkit-text-fill-color:var(--foreground)] file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-8 w-full min-w-0 rounded-md p-2  px-3 py-2 text-base transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none",
  {
    variants: {
      variant: {
        // Same raised surface as the portal and help-center search fields.
        default: cn(
          inputSurfaceClass,
          "rounded-lg transition-[filter,box-shadow,border-color] hover:brightness-[0.99] focus-visible:border-primary/15 dark:focus-visible:border-primary/15 dark:hover:brightness-110 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 dark:aria-invalid:border-destructive",
        ),
        plain:
          "bg-transparent border-none shadow-none focus-visible:ring-0 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type InputProps = React.ComponentProps<typeof BaseInput> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <BaseInput
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(inputVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

/**
 * The same raised field as `Input`, for when icons, prefixes, suffixes or status sit beside the
 * text. Put an `Input variant="plain"` inside; the whole group takes the focus ring.
 */
function InputGroup({
  className,
  invalid = false,
  ...props
}: React.ComponentProps<"label"> & { invalid?: boolean }) {
  return (
    <label
      data-slot="input-group"
      data-invalid={invalid || undefined}
      className={cn(
        inputSurfaceClass,
        "flex h-9 w-full min-w-0 cursor-text items-center gap-2.5 rounded-lg px-3 text-muted-foreground transition-[filter,box-shadow,border-color] hover:brightness-[0.99] focus-within:border-primary/15 dark:focus-within:border-primary/15 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50 dark:hover:brightness-110",
        "data-invalid:border-destructive data-invalid:focus-within:border-destructive dark:data-invalid:border-destructive",
        // The input fills the space between the add-ons and drops its own padding.
        "[&_[data-slot=input]]:h-full [&_[data-slot=input]]:flex-1 [&_[data-slot=input]]:px-0 [&_[data-slot=input]]:text-foreground [&_[data-slot=input]:disabled]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export { Input, InputGroup };
