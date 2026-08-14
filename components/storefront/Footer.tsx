import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-forest-700 text-brand-pearl pt-32 pb-12 rounded-t-[3rem] -mt-10 relative z-20 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Top Massive Newsletter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 items-end">
          <div>
            <h2 className="text-5xl md:text-7xl font-serif leading-none tracking-tight mb-6">
              Join the<br/><span className="italic text-brand-gold">Ritual.</span>
            </h2>
            <p className="text-brand-pearl/70 max-w-md font-sans text-lg">
              Sign up for early access to new harvests, exclusive wellness journals, and 10% off your first order.
            </p>
          </div>
          <div className="w-full max-w-lg md:justify-self-end">
            <form className="flex border-b border-brand-pearl/30 pb-2 focus-within:border-brand-gold transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-transparent w-full outline-none text-brand-pearl placeholder:text-brand-pearl/40 font-sans"
              />
              <button type="submit" className="text-brand-gold uppercase tracking-widest text-xs font-bold hover:text-white transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-brand-pearl/10 pt-16 mb-24">
          <div className="space-y-4">
            <h4 className="text-brand-pearl uppercase tracking-widest text-xs font-bold mb-6">Shop</h4>
            <Link href="/shop" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">All Products</Link>
            <Link href="/shop/moringa" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Moringa Powder</Link>
            <Link href="/shop/tea" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Wellness Teas</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-brand-pearl uppercase tracking-widest text-xs font-bold mb-6">Explore</h4>
            <Link href="/our-story" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Our Story</Link>
            <Link href="/sourcing" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Sourcing & Ethics</Link>
            <Link href="/journal" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">The Journal</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-brand-pearl uppercase tracking-widest text-xs font-bold mb-6">Support</h4>
            <Link href="/faq" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">FAQ</Link>
            <Link href="/shipping" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Shipping & Returns</Link>
            <Link href="/contact" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Contact Us</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-brand-pearl uppercase tracking-widest text-xs font-bold mb-6">Social</h4>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">TikTok</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="block text-brand-pearl/70 hover:text-brand-gold transition-colors font-sans">Pinterest</a>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-brand-pearl/10">
          <p className="text-brand-pearl/50 text-xs font-sans mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Miracle Tree Life Science. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-brand-pearl/50 text-xs font-sans hover:text-brand-pearl">Privacy Policy</Link>
            <Link href="/terms" className="text-brand-pearl/50 text-xs font-sans hover:text-brand-pearl">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
