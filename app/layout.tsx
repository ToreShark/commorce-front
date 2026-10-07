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
import { FB_PIXEL_ID } from "./lib/fbPixel";
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
  // Идентификатор проекта Microsoft Clarity. NEXT_PUBLIC_* подставляется на
  // сборке, поэтому смена значения требует пересборки образа, а не рестарта.
  // Пусто — счётчик просто не грузится: так ведут себя локальная разработка
  // и превью-сборки, куда записи сессий попадать не должны.
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;
  // Контейнер Google Tag Manager, через него подключена Google Analytics.
  // Правила те же, что у Clarity: значение из .env.production, пусто — не грузим.
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  // Google Analytics 4 (идентификатор потока G-…), подключается напрямую через gtag.
  // Переходы между страницами без перезагрузки GA4 считает сама — по событиям истории.
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

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
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
            </Script>
          </>
        ) : null}
        {gtmId ? (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
          </Script>
        ) : null}
        {clarityId ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
          </Script>
        ) : null}
        {FB_PIXEL_ID ? (
          <>
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
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt="facebook pixel"
              />
            </noscript>
          </>
        ) : null}
      </head>
      <body className={inter.className}>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        ) : null}
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
