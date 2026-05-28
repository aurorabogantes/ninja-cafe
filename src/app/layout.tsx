import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Café de Montaña ☕",
  description: "Menú artesanal de café — Ninja DualBrew Pro ES601",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
