import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';

import { CartProvider } from '@/components/storefront/CartProvider';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-brand-pearl">
        <Navbar />
        <main className="flex-grow flex flex-col">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
