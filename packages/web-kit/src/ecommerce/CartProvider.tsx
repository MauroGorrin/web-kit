"use client";

import * as React from "react";
import type { Producto } from "./types.ts";

export interface CartItem {
  producto: Producto;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (producto: Producto) => void;
  removeItem: (productoId: string) => void;
  totalCents: number;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([]);

  const addItem = React.useCallback((producto: Producto) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.producto.id === producto.id);
      if (existing) {
        return prev.map((item) =>
          item.producto.id === producto.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { producto, quantity: 1 }];
    });
  }, []);

  const removeItem = React.useCallback((productoId: string) => {
    setItems((prev) => prev.filter((item) => item.producto.id !== productoId));
  }, []);

  const totalCents = items.reduce((sum, item) => sum + item.producto.priceCents * item.quantity, 0);

  const value = React.useMemo(
    () => ({ items, addItem, removeItem, totalCents }),
    [items, addItem, removeItem, totalCents],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
