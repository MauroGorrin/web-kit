import { buildMetadata, listSedes } from "@mgorrin/web-kit";
import {
  CartProvider,
  CartSummary,
  listProductosBySede,
  ProductGrid,
} from "@mgorrin/web-kit/ecommerce";

export const metadata = buildMetadata({
  title: "Productos para el cuidado capilar — Vitalis Capilar",
  description:
    "Shampoo, minoxidil y suplementos para el cuidado pre y post injerto capilar, recomendados por nuestro equipo.",
});

export const dynamic = "force-dynamic";

// Catálogo de ejemplo — se muestra solo si Firestore no devuelve productos
// reales (proyecto de demostración sin backend conectado). En un cliente
// real, `listProductosBySede` siempre trae el catálogo verdadero.
const PRODUCTOS_DEMO = [
  {
    id: "demo-shampoo",
    name: "Shampoo post-injerto suave",
    priceCents: 850000,
    images: [],
    sedeId: "demo",
    inventoryCount: 24,
  },
  {
    id: "demo-minoxidil",
    name: "Minoxidil al 5%",
    priceCents: 1200000,
    images: [],
    sedeId: "demo",
    inventoryCount: 30,
  },
  {
    id: "demo-biotina",
    name: "Suplemento de biotina x60",
    priceCents: 950000,
    images: [],
    sedeId: "demo",
    inventoryCount: 18,
  },
];

export default async function TiendaPage() {
  const sedes = await listSedes();
  const defaultSede = sedes.find((sede) => sede.isDefault) ?? sedes[0];
  const productosReales = defaultSede ? await listProductosBySede(defaultSede.id) : [];
  const productos = productosReales.length > 0 ? productosReales : PRODUCTOS_DEMO;
  const esCatalogoDemo = productosReales.length === 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary)]">
          Cuidado capilar pre y post injerto
        </h1>
        <p className="mt-2 opacity-70">
          Los mismos productos que se recomiendan a los pacientes durante la recuperación.
        </p>
        {esCatalogoDemo ? (
          <span className="mt-3 inline-block rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-accent)]">
            Catálogo de ejemplo — sin backend real conectado
          </span>
        ) : null}
      </div>
      <CartProvider>
        <ProductGrid productos={productos} />
        <CartSummary />
      </CartProvider>
    </main>
  );
}
