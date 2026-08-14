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
import FixedBottomMenu from "./components/fixedBottom/fixedBottomMenu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // Базовый адрес нужен, чтобы относительные пути в openGraph разворачивались
  // в абсолютные: без него превью ссылки в WhatsApp и Instagram остаётся без картинки
  metadataBase: new URL("https://crysshop.kz"),
  title: {
    default: "CrysShop — интернет-магазин",
    // Страницы задают свой заголовок строкой, сюда подставляется он
    template: "%s | CrysShop",
  },
  description:
    "Интернет-магазин CrysShop: доставка по Казахстану курьером и в пункты выдачи СДЭК, оплата картой онлайн.",
  openGraph: {
    type: "website",
    siteName: "CrysShop",
    locale: "ru_KZ",
    url: "https://crysshop.kz",
    title: "CrysShop — интернет-магазин",
    description:
      "Доставка по Казахстану курьером и в пункты выдачи СДЭК, оплата картой онлайн.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CrysShop — интернет-магазин",
    description:
      "Доставка по Казахстану курьером и в пункты выдачи СДЭК, оплата картой онлайн.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <meta
          name="google-site-verification"
          content="4wnkYl3NLXF4m9291suLRB363SNvoPKW05dkh6X6fAc"
        />
        <meta
          name="loaderio"
          content="loaderio-f7beb089725001b4e92335e761e0a6f8"
        />
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
            style={{ display: "none" }}
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
              <FixedBottomMenu />
            </CartProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
