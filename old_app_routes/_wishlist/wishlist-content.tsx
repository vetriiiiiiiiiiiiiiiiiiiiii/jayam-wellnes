'use client';
import Link from 'next/link';
import { products } from '@/lib/catalog';
import ProductGrid from '@/components/product-grid';
import { useCommerce } from '@/components/commerce-provider';
export default function WishlistContent() { const { wishlist } = useCommerce(); const items = products.filter((product) => wishlist.includes(product.slug)); return <>{items.length ? <><section className="catalog-intro"><p className="eyebrow">Saved rituals</p><h1>Your <em>good</em><br/>list.</h1></section><section className="catalog-content"><ProductGrid items={items} /></section></> : <section className="empty-cart"><p className="eyebrow">Saved rituals</p><h1>Nothing saved<br/><em>yet.</em></h1><p>Keep the rituals you want to return to close.</p><Link className="button dark-button" href="/shop">Explore products <span>↗</span></Link></section>}</>; }
