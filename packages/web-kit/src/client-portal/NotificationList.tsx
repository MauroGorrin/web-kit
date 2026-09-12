"use client";

import * as React from "react";
import { Card } from "../design-system/index.ts";

// Solo notificaciones de cuenta/cita (recordatorios, cambios de estado) —
// NUNCA dato clínico, ver CLAUDE.md regla de código #7.
export interface PortalNotification {
  id: string;
  message: string;
  read: boolean;
}

export interface NotificationListProps {
  notifications: PortalNotification[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [items, setItems] = React.useState(notifications);

  if (items.length === 0) return null;

  function markAsRead(id: string) {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }

  return (
    <Card>
      <ul>
        {items.map((item) => (
          <li key={item.id} style={{ opacity: item.read ? 0.5 : 1 }}>
            <button type="button" onClick={() => markAsRead(item.id)}>
              {item.message}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
