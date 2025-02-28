import type { Metadata } from 'next';

import '@/app/globals.css';
import Footer from '@/app/_components/layout/footer';
import { Navbar } from '@/app/_components/layout/navbar';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

let title = 'Pronóstico de tsunamis: TSDHN';
let description = 'Pronóstico de tsunamis: TSDHN en 10 minutos';
let url = 'https://tsdhn.vercel.app/';
let sitename = 'TSDHN';

export const metadata: Metadata = {
  description,
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL(url),
  openGraph: {
    description,
    locale: 'es_PE',
    siteName: sitename,
    title,
    type: 'website',
    url: url,
  },
  title,
  twitter: {
    card: 'summary_large_image',
    description,
    title,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="flex flex-col justify-center items-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
