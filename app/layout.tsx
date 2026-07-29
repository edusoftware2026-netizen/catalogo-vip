import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const description =
    "Catálogo privado con perfiles verificados y disponibilidad actualizada en Santa Cruz.";

  return {
    metadataBase: new URL(origin),
    title: "Iam Dani | Catálogo Santa Cruz",
    description,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "Iam Dani | Catálogo Santa Cruz",
      description,
      images: [{ url: `${origin}/og.png`, width: 1746, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Iam Dani | Catálogo Santa Cruz",
      description,
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
