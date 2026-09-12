import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils.ts";

// Las clases `.wk-btn*` viven en `tokens.css` y leen únicamente variables CSS
// (`--color-primary`, `--color-accent`, ...) — nunca un hex literal aquí.
const buttonVariants = cva("wk-btn", {
  variants: {
    variant: {
      primary: "wk-btn--primary",
      accent: "wk-btn--accent",
      outline: "wk-btn--outline",
    },
    size: {
      sm: "wk-btn--sm",
      md: "wk-btn--md",
      lg: "wk-btn--lg",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
