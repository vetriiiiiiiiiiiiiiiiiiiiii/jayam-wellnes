import type { Metadata } from 'next';
import InnerNav from '@/components/inner-nav';
import ProductGrid from '@/components/product-grid';
import { products } from '@/lib/catalog';

export const metadata: Metadata = { title: 'Shop Moringa Wellness | Miracle Tree', description: 'Explore Miracle Tree moringa products, snacks, wellness essentials, and more.' };

export default function ShopPage() { return <main className="catalog-page"><InnerNav /><section className="catalog-intro"><p className="eyebrow">Shop all</p><h1>Small rituals.<br/><em>Lasting good.</em></h1><p>Everyday foods and wellness essentials inspired by the remarkable moringa tree.</p></section><div className="category-rail"><a href="#all">All products</a><a href="/collections/herbal-supplements">Supplements</a><a href="/collections/healthy-snacks">Snacks</a><a href="/collections/super-foods">Super foods</a></div><section className="catalog-content"><ProductGrid items={products} /></section></main>; }
