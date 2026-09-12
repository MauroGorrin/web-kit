import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "@mgorrin/web-kit/design-system/tokens.css";
import "./globals.css";
import { themeCssVariables } from "../../theme.config";
import { modulesConfig } from "../../modules.config";
import { buildMetadata } from "@mgorrin/web-kit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = buildMetadata({
  title: "Web Kit",
  description: "Starter kit interno de la agencia — Next.js + Firebase.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Override por cliente de las variables --color-* de tokens.css — ver theme.config.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCssVariables() }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Nav pública — cada enlace lee `modules.config.ts`, nunca decide por su cuenta. */}
        <nav className="flex gap-4 border-b p-4">
          <Link href="/">Inicio</Link>
          <Link href="/agenda">Agenda</Link>
          {modulesConfig.ecommerce ? <Link href="/tienda">Tienda</Link> : null}
          {modulesConfig.clientPortal ? <Link href="/portal">Portal</Link> : null}
        </nav>
        {children}
      </body>
    </html>
  );
}
