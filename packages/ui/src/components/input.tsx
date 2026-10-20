import * as React from "react";
import { Input as BaseInput } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-8 w-full min-w-0 rounded-md p-2  px-3 py-2 text-base transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none",
  {
    variants: {
      variant: {
        // Same raised surface as the portal and help-center search fields.
        default: cn(
          raisedSurfaceClass,
          "rounded-lg transition-[filter,box-shadow,border-color] hover:brightness-[0.99] focus-visible:border-primary/40 focus-visible:ring-3 focus-visible:ring-primary/15 dark:hover:brightness-110 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
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

export { Input };
