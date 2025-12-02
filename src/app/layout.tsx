import type { Metadata } from "next";
import "./globals.css";
import { Header } from "./components/Navigation";
import ConditionalFooter from "./components/ConditionalFooter";

export const metadata: Metadata = {
  title: "Grandview Realty - Wisconsin's Premier Real Estate Agency",
  description: "Your trusted real estate partner in Wisconsin. Discover exceptional properties across Wisconsin with Grandview Realty's expert guidance.",
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: "Grandview Realty - Wisconsin's Premier Real Estate Agency",
    description: "Your trusted real estate partner in Wisconsin. Discover exceptional properties across Wisconsin with Grandview Realty's expert guidance.",
    type: "website",
    locale: "en_US",
    url: "https://grandviewwisconsin.com",
    siteName: "Grandview Realty Wisconsin",
    images: [
      {
        url: "/hero-image.jpg",
        width: 1200,
        height: 630,
        alt: "Grandview Realty - Wisconsin Real Estate",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grandview Realty - Wisconsin's Premier Real Estate Agency",
    description: "Your trusted real estate partner in Wisconsin.",
    images: ["/hero-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/hero-image.jpg" as="image" />
        <link rel="preload" href="/Grandview Home.mp4" as="video" type="video/mp4" />
        
        {/* Structured data for real estate business */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Grandview Realty Wisconsin",
              "description": "Wisconsin's premier real estate agency serving communities across the Badger State",
                      "url": "https://grandviewwisconsin.com",
        "logo": "https://grandviewwisconsin.com/logo.png",
        "image": "https://grandviewwisconsin.com/hero-image.jpg",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Wisconsin",
                "addressCountry": "US"
              },
              "areaServed": [
                "Milwaukee, WI",
                "Madison, WI", 
                "Green Bay, WI",
                "Kenosha, WI",
                "Racine, WI",
                "Appleton, WI",
                "Waukesha, WI",
                "Oshkosh, WI"
              ],
              "serviceType": "Real Estate Services",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Property Listings",
                "itemListElement": []
              }
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
