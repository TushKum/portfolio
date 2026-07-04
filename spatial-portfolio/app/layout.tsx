import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'John Doe — Creative Engineer',
  description:
    'Portfolio of John Doe, a creative engineer bridging design and engineering — a hand-drawn 3D world with a computer in it.',
};

// Roboto Mono is loaded via a plain stylesheet (not next/font) on purpose:
// two <canvas> painters (the code rings and the skills poster) address the
// font by its literal family name, which next/font's hashed family would break.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100;400;700&display=swap"
        />
      </head>
      <body className="font-mono">{children}</body>
    </html>
  );
}
