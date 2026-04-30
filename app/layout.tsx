import type { Metadata, Viewport } from "next";
import "react-toastify/dist/ReactToastify.css"; // ← first so globals.css wins
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: {
    default: "FreshCart – Fresh Products Delivered",
    template: "%s | FreshCart",
  },
  description: "FreshCart – Your one-stop shop for fresh groceries.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Navbar />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <ToastContainer
                position="bottom-right"
                autoClose={1500}
                hideProgressBar
                newestOnTop
                closeButton={false}
                closeOnClick
                pauseOnHover={false}
                pauseOnFocusLoss={false}
                draggable={false}
                limit={3}
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
