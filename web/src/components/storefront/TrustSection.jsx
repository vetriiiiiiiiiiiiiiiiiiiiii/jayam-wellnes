export default function TrustSection() {
  return <section className="py-24 bg-brand-forest-900 text-brand-pearl relative overflow-hidden">
      {/* Subtle Background pattern/gradient */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
      background: 'radial-gradient(circle at 100% 0%, #3e8e41 0%, transparent 50%), radial-gradient(circle at 0% 100%, #1e4034 0%, transparent 50%)'
    }}>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight text-brand-pearl">Recommended by <br /><span className="text-brand-gold italic">Dermatologists.</span></h2>
            <p className="text-brand-pearl/80 text-lg leading-relaxed mb-8 max-w-md font-light">
              "Miracle Tree brings an uncompromising standard of purity. The botanical formulations are highly effective while respecting the skin's natural barrier."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-pearl flex items-center justify-center text-brand-forest-900 font-serif font-bold text-xl shadow-sm">
                Dr
              </div>
              <div>
                <p className="font-medium text-lg text-brand-pearl">Dr. Sarah Jenkins</p>
                <p className="text-sm text-brand-gold font-medium tracking-wide uppercase">Board Certified Dermatologist</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
              <div className="text-brand-gold text-4xl mb-4">✨</div>
              <h3 className="font-medium text-lg text-brand-pearl">100% Organic</h3>
              <p className="text-sm text-brand-pearl/60 mt-2 font-light">Certified organic ingredients</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
              <div className="text-brand-green-500 text-4xl mb-4">🌱</div>
              <h3 className="font-medium text-lg text-brand-pearl">Cruelty Free</h3>
              <p className="text-sm text-brand-pearl/60 mt-2 font-light">Never tested on animals</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
              <div className="text-blue-400 text-4xl mb-4">💧</div>
              <h3 className="font-medium text-lg text-brand-pearl">Clinically Proven</h3>
              <p className="text-sm text-brand-pearl/60 mt-2 font-light">Dermatologist tested</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 shadow-xl p-8 rounded-2xl text-center flex flex-col items-center justify-center transition-transform hover:-translate-y-1">
              <div className="text-brand-green-500 text-4xl mb-4">🍃</div>
              <h3 className="font-medium text-lg text-brand-pearl">Vegan</h3>
              <p className="text-sm text-brand-pearl/60 mt-2 font-light">Plant-based formulas</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
}