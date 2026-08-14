import type { Metadata } from 'next';
import './globals.css';
import './editorial.css';
import './motion.css';
import './pages.css';
import './commerce.css';
import './policies.css';
import './faq.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'Miracle Tree — Nature, considered.',
  description: 'Elevated everyday essentials, grown with intention.',
  metadataBase: new URL('https://miracletree.in'),
  openGraph: { type: 'website', siteName: 'Miracle Tree', title: 'Miracle Tree — Moringa, made for every day.', description: 'Moringa-led everyday foods and wellness essentials.' },
  twitter: { card: 'summary_large_image' },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
};

import CustomCursor from '@/components/storefront/CustomCursor';
import SmoothScroll from '@/components/storefront/SmoothScroll';
import ScrollProgress from '@/components/storefront/ScrollProgress';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-brand-pearl cursor-none" suppressHydrationWarning>
        <ScrollProgress />
        <SmoothScroll>
          <CustomCursor />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
