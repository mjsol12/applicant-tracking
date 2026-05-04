import type { Metadata } from "next";
import { Gabarito } from "next/font/google";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils";
import "@/style/globals.css";

const gabarito = Gabarito({ subsets: ["latin"], variable: "--font-gabarito" });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background font-sans", gabarito.variable)}>
        <div className="flex min-h-[100dvh]">
          <div className="flex-grow overflow-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
