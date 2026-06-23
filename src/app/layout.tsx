import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prode Mundial 2026 🏆",
  description: "El prode del Mundial con tus amigos. ¡Competí y ganá!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, minHeight: '100vh' }}>{children}</body>
    </html>
  );
}
