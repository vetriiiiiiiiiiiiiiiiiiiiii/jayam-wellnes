import { notFound } from 'next/navigation';
import InnerNav from '@/components/inner-nav';
import ProductGrid from '@/components/product-grid';
import { products } from '@/lib/catalog';

const definitions: Record<string, { title: string; description: string; products: string[] }> = {
  'herbal-supplements': { title: 'Herbal supplements', description: 'A considered collection of practical moringa formats for your daily routine.', products: ['moringa-amla-tablets', 'moringa-tablet'] },
  'healthy-snacks': { title: 'Healthy snacks', description: 'Keep the day moving with smarter, moringa-powered moments.', products: ['mogo-moringa-energy-bar'] },
  'super-foods': { title: 'Super foods', description: 'One remarkable leaf, simply made for the rhythm of every day.', products: ['moringa-leaf-powder-hpd-dried', 'drumstick-pulp-soup-instant-soup-10-sachets', 'beauty-drops-skin-food-hydrates-skin'] },
  'moringa-herbal-tea': { title: 'Moringa herbal tea', description: 'A warm and restorative pause, rooted in the leaf.', products: ['moringa-leaf-powder-hpd-dried'] },
};

export function generateStaticParams() { return Object.keys(definitions).map((slug) => ({ slug })); }
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const collection = definitions[slug]; if (!collection) notFound(); return <main className="catalog-page"><InnerNav /><section className="catalog-intro collection-intro"><p className="eyebrow">Miracle Tree collection</p><h1>{collection.title}</h1><p>{collection.description}</p></section><section className="catalog-content"><ProductGrid items={products.filter((product) => collection.products.includes(product.slug))} /></section></main>; }
