import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
  Plus_Jakarta_Sans,
  Figtree,
} from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { AuthProvider } from "./context/AuthContext";
import AppInitializer from "./components/AppInitializer";
import AppGate from "./components/AppGate";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MessageListener from "./components/MessageListener";
import SocketProvider from "./components/SocketProvider";
import WelcomeBadgeModal from "./components/WelcomeBadgeModal";
import SwoopChatbot from "./components/SwoopChatbot";
import ThemeScript from "./components/ThemeScript";

// ============================================================
// FONTS
// ============================================================

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {
  title: "UniMart",
  description: "Campus Marketplace & Social Commerce",
};

// ============================================================
// ROOT LAYOUT
// ============================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} ${spaceGrotesk.variable} ${inter.variable} ${plusJakartaSans.variable} ${figtree.variable} h-full antialiased`}
      data-app-stage="splash"
    >
      <head>
        <ThemeScript />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              html[data-app-stage='initializing'],
              html[data-app-stage='splash'],
              html[data-app-stage='auth'] {
                overflow: hidden;
              }

              html[data-app-stage='initializing'] header,
              html[data-app-stage='splash'] header,
              html[data-app-stage='auth'] header,
              html[data-app-stage='initializing'] main,
              html[data-app-stage='splash'] main,
              html[data-app-stage='auth'] main,
              html[data-app-stage='initializing'] nav,
              html[data-app-stage='splash'] nav,
              html[data-app-stage='auth'] nav {
                display: none !important;
              }
            `,
          }}
        />
      </head>

      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        <AuthProvider>
          <SocketProvider>

            {/* ==================================================
                APP INITIALIZATION
            ================================================== */}
            <AppInitializer />

            {/* ==================================================
                MAIN HEADER
            ================================================== */}
            <Header />

            {/* ==================================================
                SITE CONTENT
            ================================================== */}
            <div
              id="site-content"
              style={{
                paddingTop:
                  "calc(var(--header-height) + env(safe-area-inset-top))",
                paddingBottom:
                  "calc(var(--footer-height) + env(safe-area-inset-bottom))",
              }}
              className="flex flex-col flex-1"
            >
              <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <AppGate>
                    {children}
                  </AppGate>
                </div>
              </main>
            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}
            <Footer />

            {/* ==================================================
                OTHER GLOBAL COMPONENTS
            ================================================== */}
            <MessageListener />

            <WelcomeBadgeModal />

            {/* ==================================================
                SWOOP AI / BOTPRESS CHATBOT
            ================================================== */}
            <SwoopChatbot />

          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}