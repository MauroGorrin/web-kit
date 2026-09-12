import Link from "next/link";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Mail, MapPin, Phone } from "lucide-react";
import "@mgorrin/web-kit/design-system/tokens.css";
import "./globals.css";
import { themeCssVariables } from "../../theme.config";
import { modulesConfig } from "../../modules.config";
import { Button, buildMetadata, GoogleSignInButton, SignOutButton } from "@mgorrin/web-kit";
import { getSession } from "@mgorrin/web-kit/auth-rbac";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = buildMetadata({
  title: "Vitalis Capilar",
  description: "Clínica de injerto capilar FUE/FUT en Buenos Aires, Argentina.",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);

  return (
    <html lang="es">
      <head>
        {/* Override por cliente de las variables --color-* de tokens.css — ver theme.config.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCssVariables() }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        {/* Nav pública — cada enlace lee `modules.config.ts`, nunca decide por su cuenta. */}
        <nav className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-background)]/90 p-4 backdrop-blur">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-[var(--color-primary)]">
              Vitalis Capilar
            </Link>
            <div className="hidden gap-5 text-sm font-medium sm:flex">
              <Link href="/" className="opacity-80 transition hover:opacity-100">
                Inicio
              </Link>
              <Link href="/agenda" className="opacity-80 transition hover:opacity-100">
                Agenda
              </Link>
              {modulesConfig.ecommerce ? (
                <Link href="/tienda" className="opacity-80 transition hover:opacity-100">
                  Productos
                </Link>
              ) : null}
              {modulesConfig.clientPortal ? (
                <Link href="/portal" className="opacity-80 transition hover:opacity-100">
                  Mi cuenta
                </Link>
              ) : null}
              {modulesConfig.adminPanel && session ? (
                <Link href="/admin" className="opacity-80 transition hover:opacity-100">
                  Admin
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agenda" className="hidden sm:block">
              <Button size="sm">Reservar consulta</Button>
            </Link>
            {session ? (
              <>
                <span className="hidden text-sm opacity-70 sm:inline">
                  Hola, {session.displayName}
                </span>
                <SignOutButton />
              </>
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </nav>

        <div className="flex-1">{children}</div>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-8 py-10 text-sm opacity-70">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-1 text-base font-semibold text-[var(--color-primary)]">
                Vitalis Capilar
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} /> Av. Santa Fe 1500, CABA, Argentina
              </p>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <p className="flex items-center gap-2 sm:flex-row-reverse">
                <Phone size={14} /> +54 11 4000-0000
              </p>
              <p className="flex items-center gap-2 sm:flex-row-reverse">
                <Mail size={14} /> hola@vitaliscapilar.com.ar
              </p>
            </div>
          </div>
          <p className="mx-auto mt-6 max-w-5xl text-xs opacity-60">
            © {new Date().getFullYear()} Vitalis Capilar. Proyecto de ejemplo generado con
            @mgorrin/web-kit — datos ficticios.
          </p>
        </footer>
      </body>
    </html>
  );
}
