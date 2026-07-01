import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "./context/AuthContext";
import AppInitializer from "./components/AppInitializer";
import AppGate from "./components/AppGate";
import Header from "./components/Header";
import Footer from "./components/Footer";
import SocketChatHost from "./components/SocketChatHost";
import MessageListener from "./components/MessageListener";
import SocketProvider from "./components/SocketProvider";
import WelcomeBadgeModal from "./components/WelcomeBadgeModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uni-Mart",
  description: "AI-powered commerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-app-stage="splash"
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider>
          <SocketProvider>
            {/* App init - shows splash/auth overlay */}
            <AppInitializer />

            {/* Fixed Header (global) */}
            <Header />

            {/* Push content below header using runtime-measured CSS variables */}
            <div id="site-content" style={{ paddingTop: 'calc(var(--header-height) + env(safe-area-inset-top))', paddingBottom: 'calc(var(--footer-height) + env(safe-area-inset-bottom))' }} className="flex flex-col flex-1">

              <main className="flex-1">
                <AppGate>
                  {children}
                </AppGate>
              </main>

            </div>

            {/* Mobile bottom nav (Temu-style, global) */}
            <Footer />

            {/* Global AI assistant */}
            <SocketChatHost />
            <MessageListener />
            <WelcomeBadgeModal />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
