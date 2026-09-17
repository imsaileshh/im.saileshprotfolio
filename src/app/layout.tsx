import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { RootLayoutWrapper } from '@/components/navigation/RootLayoutWrapper';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { GlobalBackgroundSetter } from '@/components/theme/GlobalBackgroundSetter';

// display:'swap' ensures fallback text is visible immediately so the browser
// can measure and paint the LCP text node without waiting for font download.
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-display', display: 'swap' });

export const metadata: Metadata = {
  title: 'Sailesh P | Interactive Portfolio & Dashboard',
  description: 'Personal interactive portfolio, web dashboard, and analytics ecosystem of Sailesh P.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/apple-icon',
  },
};

// Root layout is now a synchronous server component — no blocking DB calls.
// themeConfig is fetched client-side by GlobalBackgroundSetter after mount.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground">
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem storageKey="portfolio-theme">
          <GlobalBackgroundSetter />
          <RootLayoutWrapper>
            {children}
          </RootLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
