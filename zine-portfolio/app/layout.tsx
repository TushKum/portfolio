import type { Metadata } from 'next';
import { Playfair_Display, Space_Mono } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tushit Kumar — Field Notes, Vol. 01',
  description:
    'Tactile brutalist portfolio of Tushit Kumar (Thapar University): halftone data clusters, structural grids, and printed-on-paper engineering notes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${playfair.variable} ${spaceMono.variable} bg-paper font-mono text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
