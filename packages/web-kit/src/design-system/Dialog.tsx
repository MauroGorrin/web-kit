import * as React from "react";
import { Dialog as RadixDialog } from "radix-ui";
import { cn } from "./utils.ts";

// Único punto del paquete autorizado a hablar con Radix directamente — ver
// CLAUDE.md, regla de código #1, y `eslint.config.mjs` (`no-restricted-imports`).
const Root = RadixDialog.Root;
const Trigger = RadixDialog.Trigger;
const Close = RadixDialog.Close;

const Content = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <RadixDialog.Portal>
    <RadixDialog.Overlay className="wk-dialog-overlay" />
    <RadixDialog.Content ref={ref} className={cn("wk-dialog-content", className)} {...props}>
      {children}
    </RadixDialog.Content>
  </RadixDialog.Portal>
));
Content.displayName = "Dialog.Content";

const Title = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={cn("wk-dialog-title", className)} {...props} />
));
Title.displayName = "Dialog.Title";

const Description = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description
    ref={ref}
    className={cn("wk-dialog-description", className)}
    {...props}
  />
));
Description.displayName = "Dialog.Description";

// Exporta un único namespace `Dialog` (allowlist de `index.ts`), no cinco
// símbolos sueltos — coherente con cómo `radix-ui` mismo expone cada primitiva.
export const Dialog = { Root, Trigger, Close, Content, Title, Description };
