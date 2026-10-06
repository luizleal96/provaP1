import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadScore IA | Qualificação inteligente",
  description: "Priorize os leads certos com análise inteligente.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
