import type { Metadata } from "next";
import "./globals.css";
import { APP_TITLE } from "@/lib/titles";

export const metadata: Metadata = {
  title: `${APP_TITLE} - Chaveamento`,
  description: "Gere chaveamentos automáticos para o Campeonato Churrasquinho FIFA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
