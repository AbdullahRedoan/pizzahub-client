import type { Metadata } from "next";
import { Suspense } from "react";
import {
  Caveat,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/context/auth-context";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PizzaHub",
  description: "Wood-fired pizza, made with care and delivered warm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${caveat.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthSessionProvider>
            <Suspense
              fallback={
                <div className="h-20 border-b border-border bg-background" />
              }
            >
              <Navbar />
            </Suspense>
            <main className="flex-1 bg-background text-foreground transition-colors duration-300">{children}</main>
            <Footer />
            <Toaster position="bottom-right" />
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
