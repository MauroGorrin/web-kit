---
name: generate-client-project
description: Generar un proyecto nuevo de cliente a partir de apps/template usando scripts/setup.js — qué preguntas responde el asistente, qué archivos escribe, y cómo confirmar que el proyecto generado arranca. Úsalo cuando la agencia empieza un sitio nuevo para un cliente.
---

# generate-client-project

## Cuándo usar

Al iniciar un proyecto nuevo para un cliente de la agencia, después de tener el nombre del cliente y
saber qué módulos de v1 necesita (scheduling, ecommerce, crm, etc.).

## Pasos

1. Desde la raíz del monorepo: `pnpm setup:client`.
2. Responde las preguntas del script: nombre del cliente, directorio destino (fuera de este repo),
   y qué módulos activar (design-system siempre activo, el resto opcional).
3. El script copia `apps/template` al directorio destino, escribe `modules.config.ts` con los flags
   elegidos, y copia `.env.example` como punto de partida.
4. Dentro del nuevo directorio: crea un proyecto de Firebase dedicado para ese cliente y rellena
   `.env` con sus credenciales — nunca reutilices el proyecto de Firebase de otro cliente.
5. `pnpm install && pnpm dev` dentro del proyecto generado para confirmar que arranca.

## Verificar

```bash
node scripts/setup.js --dry-run --name=cliente-demo --out=/tmp/cliente-demo   # expect: exit 0
test -f /tmp/cliente-demo/modules.config.ts                                   # expect: exit 0
```

## No hacer

- No apuntes dos clientes al mismo proyecto de Firebase.
- No copies `packages/web-kit/` al proyecto de cliente — el cliente consume `@mgorrin/web-kit`
  publicado, nunca su código fuente.
