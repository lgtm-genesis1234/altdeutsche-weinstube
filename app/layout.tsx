import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Altdeutsche Weinstube - Erlesene deutsche Weine seit 1887",
  description: "Entdecken Sie unsere exquisite Auswahl an deutschen Weinen aus Mosel, Rheingau und Pfalz. Premium-Weine mit Tradition und Leidenschaft seit 1887.",
  keywords: ["Wein", "Weinstube", "Deutsche Weine", "Mosel", "Rheingau", "Pfalz", "Riesling", "Spätburgunder"],
  openGraph: {
    title: "Altdeutsche Weinstube - Erlesene deutsche Weine seit 1887",
    description: "Entdecken Sie unsere exquisite Auswahl an deutschen Weinen aus Mosel, Rheingau und Pfalz.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${cinzel.variable} ${cormorant.variable} antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Zum Hauptinhalt springen
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
