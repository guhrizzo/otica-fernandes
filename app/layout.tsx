import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

// Archivo com o eixo de largura (wdth): a versão expandida conversa com o
// "FERNANDES" do logo e a normal serve de texto corrido.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: "Ótica Fernandes | Óculos, Joias e Relógios",
  description: "Ótica Fernandes: óculos, joias, relógios e semijoias em Pederneiras e Bauru, SP, desde 1976.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="pt-BR" className={`${archivo.variable} h-full antialiased`}><body className="min-h-full flex flex-col">{children}</body></html>;
}
