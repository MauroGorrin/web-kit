import Link from "next/link";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "@mgorrin/web-kit/design-system/tokens.css";
import "./globals.css";
import { themeCssVariables } from "../../theme.config";
import { modulesConfig } from "../../modules.config";
import { buildMetadata, GoogleSignInButton, SignOutButton } from "@mgorrin/web-kit";
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
  title: "Web Kit",
  description: "Starter kit interno de la agencia — Next.js + Firebase.",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionCookie = (await cookies()).get("session")?.value;
  const session = await getSession(sessionCookie);

  return (
    <html lang="en">
      <head>
        {/* Override por cliente de las variables --color-* de tokens.css — ver theme.config.ts */}
        <style dangerouslySetInnerHTML={{ __html: themeCssVariables() }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Nav pública — cada enlace lee `modules.config.ts`, nunca decide por su cuenta. */}
        <nav className="flex items-center justify-between gap-4 border-b p-4">
          <div className="flex gap-4">
            <Link href="/">Inicio</Link>
            <Link href="/agenda">Agenda</Link>
            {modulesConfig.ecommerce ? <Link href="/tienda">Tienda</Link> : null}
            {modulesConfig.clientPortal ? <Link href="/portal">Portal</Link> : null}
            {modulesConfig.adminPanel && session ? <Link href="/admin">Admin</Link> : null}
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span>Hola, {session.displayName}</span>
                <SignOutButton />
              </>
            ) : (
              <GoogleSignInButton />
            )}
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
