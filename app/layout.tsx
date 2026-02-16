import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PodBlog AI - Converti Podcast in Blog SEO + 8 Contenuti in 8 Minuti",
  description: "Trasforma 1 episodio podcast in blog SEO (1500+ parole), 5 post social, newsletter e altro - automaticamente in 8 minuti. Risparmia 8 ore/settimana. 245+ podcaster italiani.",
  keywords: ["podcast", "blog", "AI", "content marketing", "SEO", "trascrizione", "social media"],
  authors: [{ name: "PodBlog AI" }],
  creator: "PodBlog AI",
  publisher: "PodBlog AI",
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://podblog-mvp.vercel.app",
    title: "PodBlog AI - Il tuo podcast lavora per te anche quando dormi",
    description: "Da 1 ora di registrazione a 9 contenuti pronti in 8 minuti",
    siteName: "PodBlog AI",
    images: [{
      url: "https://podblog-mvp.vercel.app/og-image.png",
      width: 1200,
      height: 630,
      alt: "PodBlog AI - Converti Podcast in Contenuti"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PodBlog AI - Il tuo podcast lavora per te anche quando dormi",
    description: "Da 1 ora di registrazione a 9 contenuti pronti in 8 minuti",
    images: ["https://podblog-mvp.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "SoftwareApplication",
              "name": "PodBlog AI",
              "applicationCategory": "BusinessApplication",
              "description": "Converti podcast in blog SEO e contenuti social automaticamente",
              "url": "https://podblog-mvp.vercel.app",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "245"
              },
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Piano Gratuito",
                  "price": "0",
                  "priceCurrency": "EUR"
                },
                {
                  "@type": "Offer",
                  "name": "Piano Pro",
                  "price": "39",
                  "priceCurrency": "EUR",
                  "billingDuration": "P1M",
                  "description": "30 episodi al mese"
                },
                {
                  "@type": "Offer",
                  "name": "Piano Business",
                  "price": "79",
                  "priceCurrency": "EUR",
                  "billingDuration": "P1M",
                  "description": "100 episodi al mese"
                }
              ]
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
