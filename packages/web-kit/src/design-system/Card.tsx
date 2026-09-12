import * as React from "react";
import { cn } from "./utils.ts";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("wk-card", className)} {...props} />
));
Card.displayName = "Card";
