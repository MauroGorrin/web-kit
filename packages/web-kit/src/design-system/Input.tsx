import * as React from "react";
import { cn } from "./utils.ts";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn("wk-input", className)} {...props} />
  ),
);
Input.displayName = "Input";
