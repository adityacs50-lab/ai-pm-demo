import type { Metadata } from "next";
import "./globals.css";
import NextAuthProvider from "./components/NextAuthProvider";

export const metadata: Metadata = {
  title: "AI PM Command Center",
  description: "Enterprise-grade customer feedback triage engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
        <style>{`
          .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .material-symbols-outlined.fill-icon {
              font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          ::-webkit-scrollbar {
              width: 8px;
              height: 8px;
          }
          ::-webkit-scrollbar-track {
              background: #0a0a0a;
          }
          ::-webkit-scrollbar-thumb {
              background: #222222;
              border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
              background: #333333;
          }
        `}</style>
      </head>
      <body className="bg-background text-on-surface font-body-main antialiased h-screen overflow-hidden">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
