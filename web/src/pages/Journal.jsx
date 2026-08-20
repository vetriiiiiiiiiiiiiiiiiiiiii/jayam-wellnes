import React from 'react';

const articles = [
  { id: 1, title: 'The Science Behind Moringa', category: 'Wellness', date: 'Oct 12, 2026', excerpt: 'Discover why this ancient botanical is taking the modern skincare world by storm.' },
  { id: 2, title: 'A Guide to Ethical Skincare', category: 'Sustainability', date: 'Sep 28, 2026', excerpt: 'What it truly means to be cruelty-free and vegan in the beauty industry.' },
  { id: 3, title: 'Morning Routines for Radiant Skin', category: 'Lifestyle', date: 'Sep 15, 2026', excerpt: 'Five simple steps to incorporate into your daily ritual for maximum hydration.' },
];

export default function JournalPage() {
  return (
    <main className="min-h-screen bg-brand-pearl pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <header className="mb-16 text-center mt-8">
          <span className="text-brand-green-500 uppercase tracking-[0.3em] text-xs font-medium block mb-4">Insights & News</span>
          <h1 className="text-5xl md:text-7xl font-serif text-brand-dark mb-8 tracking-tighter">
            The Journal
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.id} className="group cursor-pointer">
              <div className="aspect-[4/3] bg-white rounded-2xl mb-6 overflow-hidden border border-brand-green-100 relative">
                <div className="absolute inset-0 bg-brand-forest-700/5 group-hover:bg-brand-forest-700/0 transition-colors duration-500" />
              </div>
              <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-brand-green-500 mb-3">
                <span>{article.category}</span>
                <span className="w-1 h-1 rounded-full bg-brand-green-500/30" />
                <span className="text-brand-dark/50">{article.date}</span>
              </div>
              <h2 className="text-2xl font-serif text-brand-dark mb-3 group-hover:text-brand-green-500 transition-colors">
                {article.title}
              </h2>
              <p className="text-brand-dark/70 font-light leading-relaxed">
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
