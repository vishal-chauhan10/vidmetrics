import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { ThemeLayout } from './components/ThemeLayout';

export const metadata: Metadata = {
  title: 'VidMetrics | YouTube Analytics',
  description: 'YouTube channel analytics with live metrics, comparison views, and AI-driven insights.',
  applicationName: 'VidMetrics',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeLayout>{children}</ThemeLayout>
      </body>
    </html>
  );
}