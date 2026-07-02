import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/Sidebar";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "GovMind AI | Intelligence Console",
  description: "AI-Powered Public Knowledge, Rights & Compliance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${bricolage.variable} ${jetbrains.variable} antialiased min-h-screen flex flex-col md:flex-row bg-zinc-950 text-zinc-50`}>
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-y-auto border-l border-zinc-800">
          {children}
        </main>
      </body>
    </html>
  );
}
