import { buildMetadata, listSedes } from "@mgorrin/web-kit";
import {
  CartProvider,
  CartSummary,
  listProductosBySede,
  ProductGrid,
} from "@mgorrin/web-kit/ecommerce";

export const metadata = buildMetadata({
  title: "Tienda",
  description: "Compra nuestros productos en línea.",
});

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const sedes = await listSedes();
  const defaultSede = sedes.find((sede) => sede.isDefault) ?? sedes[0];
  const productos = defaultSede ? await listProductosBySede(defaultSede.id) : [];

  return (
    <main className="flex min-h-screen flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Tienda</h1>
      <CartProvider>
        <ProductGrid productos={productos} />
        <CartSummary />
      </CartProvider>
    </main>
  );
}
