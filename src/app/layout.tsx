import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prado Trocas - Gestão de Trocas",
  description: "SaaS de Gestão de Trocas Diárias por Setor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen bg-white text-[#1f2937]">
        {children}
      </body>
    </html>
  );
}
