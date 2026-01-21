import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Offset | World Clock",
    template: "%s | Offset",
  },
  description:
    "A beautiful time zone converter and world clock for remote teams.",
  // Esto ayuda a los iconos del navegador
  icons: {
    icon: "/favicon.ico", // Asegúrate de tener un favicon en /public
  },
  // Configuración para Redes Sociales (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    title: "Offset | World Clock",
    description:
      "The modern way to coordinate global time. Local-first & Privacy focused.",
    url: "https://offset-tau.vercel.app/", // TU URL REAL AQUÍ
    siteName: "Offset",
    locale: "en_US",
    type: "website",
  },
  // Configuración para Twitter/X
  twitter: {
    card: "summary_large_image",
    title: "Offset | World Clock",
    description: "The modern way to coordinate global time.",
    // images: ['https://tu-web.com/og-image.png'], // Igual, automático con Solución 1
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Offset",
  },
};

// AÑADE ESTA EXPORTACIÓN NUEVA PARA CONTROLAR EL COLOR DEL MÓVIL
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090B" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Evita zoom accidental en inputs en iPhone
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
