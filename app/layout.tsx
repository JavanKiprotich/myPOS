
import "./globals.css";
import ServiceWorker from "@/components/ServiceWorker";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Liquor POS",
  description: "Liquor POS System",

   manifest: "/manifest.json",
  themeColor: "#2563eb",

  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
        {children}

        <ServiceWorker />
      </body>
    </html>
  );
}