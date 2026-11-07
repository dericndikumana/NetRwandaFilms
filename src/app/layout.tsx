import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';
import { LanguageProvider } from '@/components/language-provider';

export const metadata: Metadata = {
  title: 'NetRwandaFilms | Free & Licensed Rwandan Cinema',
  description: 'Stream licensed Rwandan and international movies for free with dual English & Kinyarwanda audio tracks.',
  keywords: ['Rwandan Cinema', 'Filime Nyarwanda', 'NetRwandaFilms', 'Watch Movies Free Rwanda', 'Kinyarwanda dubbing'],
  openGraph: {
    title: 'NetRwandaFilms | Stream Rwandan Cinema for Free',
    description: '100% legally licensed movies with English and Kinyarwanda audio.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-brand-bg text-brand-text min-h-screen selection:bg-brand-amber selection:text-[#1B1F3B] antialiased">
        <AuthProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

