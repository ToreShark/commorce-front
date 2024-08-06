import { CategoryProvider } from "./lib/CategoryContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NavBar from "./components/NavBar";
import "./globals.css";
import Main from "./components/Main";
import Home from "./page";
import { ProductProvider } from "@/app/lib/ProductContext";
import React from "react";
import { AuthProvider } from "./lib/AuthContext";
import { UserProvider } from "./lib/UserInfo";
import { CartProvider } from "./lib/CartContext";
import Script from "@/node_modules/next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
  auth,
  modal,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '356355547516516');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=356355547516516&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <UserProvider>
            <CartProvider>
              <NavBar />
              {/* <UserProfile /> */}
              {/* <SheetDemo /> */}
              {children}
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
