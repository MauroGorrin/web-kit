import Link from "next/link";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
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
        <nav className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] p-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold text-[var(--color-primary)]">
              Vitalis Capilar
            </Link>
            <div className="hidden gap-4 sm:flex">
              <Link href="/">Inicio</Link>
              <Link href="/agenda">Agenda</Link>
              {modulesConfig.ecommerce ? <Link href="/tienda">Productos</Link> : null}
              {modulesConfig.clientPortal ? <Link href="/portal">Mi cuenta</Link> : null}
              {modulesConfig.adminPanel && session ? <Link href="/admin">Admin</Link> : null}
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
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-[var(--color-primary)]">Vitalis Capilar</p>
              <p>Av. Santa Fe 1500, CABA, Argentina</p>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <p>+54 11 4000-0000</p>
              <p>hola@vitaliscapilar.com.ar</p>
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
