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

export default async function TiendaPage() {
  const sedes = await listSedes();
  const defaultSede = sedes.find((sede) => sede.isDefault) ?? sedes[0];
  const productos = defaultSede ? await listProductosBySede(defaultSede.id) : [];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary)]">
          Cuidado capilar pre y post injerto
        </h1>
        <p className="mt-2 opacity-70">
          Los mismos productos que recomendamos a nuestros pacientes durante la recuperación.
        </p>
      </div>
      <CartProvider>
        <ProductGrid productos={productos} />
        <CartSummary />
      </CartProvider>
    </main>
  );
}
