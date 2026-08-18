import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#E5D9F2] text-gray-800 pt-32 pb-12 rounded-t-[3rem] -mt-10 relative z-20 overflow-hidden border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        
        {/* Top Massive Newsletter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-32 items-end">
          <div>
            <h2 className="text-5xl md:text-7xl font-serif leading-none tracking-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-[#FF9800]">Join the</span><br/><span className="italic text-brand-green-500">Ritual.</span>
            </h2>
            <p className="text-gray-600 max-w-md font-sans text-lg">
              Sign up for early access to new harvests, exclusive wellness journals, and 10% off your first order.
            </p>
          </div>
          <div className="w-full max-w-lg md:justify-self-end">
            <form className="flex border-b border-gray-300 pb-2 focus-within:border-brand-green-500 transition-colors">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="bg-transparent w-full outline-none text-gray-800 placeholder:text-gray-400 font-sans"
              />
              <button type="submit" className="text-[#00BCD4] uppercase tracking-widest text-xs font-bold hover:text-brand-green-500 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-gray-200 pt-16 mb-24">
          <div className="space-y-4">
            <h4 className="text-[#E91E63] uppercase tracking-widest text-xs font-bold mb-6">Shop</h4>
            <Link href="/shop" className="block text-gray-600 hover:text-[#E91E63] transition-colors font-sans">All Products</Link>
            <Link href="/shop/moringa" className="block text-gray-600 hover:text-[#E91E63] transition-colors font-sans">Moringa Powder</Link>
            <Link href="/shop/tea" className="block text-gray-600 hover:text-[#E91E63] transition-colors font-sans">Wellness Teas</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-[#FF9800] uppercase tracking-widest text-xs font-bold mb-6">Explore</h4>
            <Link href="/our-story" className="block text-gray-600 hover:text-[#FF9800] transition-colors font-sans">Our Story</Link>
            <Link href="/sourcing" className="block text-gray-600 hover:text-[#FF9800] transition-colors font-sans">Sourcing & Ethics</Link>
            <Link href="/journal" className="block text-gray-600 hover:text-[#FF9800] transition-colors font-sans">The Journal</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-brand-green-500 uppercase tracking-widest text-xs font-bold mb-6">Support</h4>
            <Link href="/faq" className="block text-gray-600 hover:text-brand-green-500 transition-colors font-sans">FAQ</Link>
            <Link href="/shipping" className="block text-gray-600 hover:text-brand-green-500 transition-colors font-sans">Shipping & Returns</Link>
            <Link href="/contact" className="block text-gray-600 hover:text-brand-green-500 transition-colors font-sans">Contact Us</Link>
          </div>
          <div className="space-y-4">
            <h4 className="text-[#00BCD4] uppercase tracking-widest text-xs font-bold mb-6">Social</h4>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="block text-gray-600 hover:text-[#00BCD4] transition-colors font-sans">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="block text-gray-600 hover:text-[#00BCD4] transition-colors font-sans">TikTok</a>
            <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="block text-gray-600 hover:text-[#00BCD4] transition-colors font-sans">Pinterest</a>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-xs font-sans mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Miracle Tree Life Science. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-500 text-xs font-sans hover:text-brand-green-500">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 text-xs font-sans hover:text-brand-green-500">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
