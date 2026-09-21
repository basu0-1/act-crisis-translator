import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/hooks/useTheme';
import { I18nProvider } from '@/hooks/useI18n';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OfflineBanner from '@/components/OfflineBanner';

export const metadata: Metadata = {
  title: 'ACT — Actionable Crisis Translator',
  description: 'Turn emergency information into clear personal decisions. Understand situations, assess risk, and navigate safe routes in real time.',
  openGraph: {
    title: 'ACT — Actionable Crisis Translator',
    description: 'Turn emergency information into clear personal decisions.',
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
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <OfflineBanner />
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
