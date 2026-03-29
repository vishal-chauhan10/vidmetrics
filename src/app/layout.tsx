import type { Metadata, Viewport } from 'next';
import '../styles/index.css';
import { ThemeLayout } from './components/ThemeLayout';

export const metadata: Metadata = {
  title: 'VidMetrics3',
  description: 'YouTube channel analytics in the VidMetrics3 dashboard design.',
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