import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { money, products } from '@/lib/catalog';
import ProductPurchase from './purchase';
import WishlistButton from '@/components/wishlist-button';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) return {};
  return { title: `${product.name} — Miracle Tree`, description: product.description, openGraph: { images: [product.image] } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  return <main className="product-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.description, image: [product.image], brand: { '@type': 'Brand', name: 'Miracle Tree' }, offers: { '@type': 'Offer', priceCurrency: 'INR', price: product.price, availability: 'https://schema.org/InStock', url: `https://miracletree.in/products/${product.slug}` } }) }} />
    <header className="product-nav"><Link className="wordmark dark" href="/">miracle<span>tree</span><i /></Link><Link href="/">← Back to the collection</Link></header>
    <section className="product-hero">
      <div className="product-photo" style={{ backgroundImage: `url(${product.image})` }}><span>01 / 03</span></div>
      <div className="product-details"><p className="eyebrow">Botanical essentials / {product.type}</p><h1>{product.name}</h1><p className="product-description">{product.description}</p><p className="price">{money(product.price)}</p><ProductPurchase product={product.name} price={product.price} /><WishlistButton slug={product.slug} /><div className="product-points">{product.benefits.map((benefit, index) => <span key={benefit}><b>0{index + 1}</b>{benefit}</span>)}</div></div>
    </section>
    <section className="ingredient-section"><p className="eyebrow">Inside the ritual</p><h2>Nothing to hide.<br/><em>Everything to feel.</em></h2><div>{product.ingredients.map((ingredient) => <article key={ingredient}><span>✦</span><h3>{ingredient}</h3><p>Chosen for its richness, traceability, and place in a life lived close to nature.</p></article>)}</div></section>
  </main>;
}
