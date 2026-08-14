import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest { return { name: 'Miracle Tree', short_name: 'Miracle Tree', description: 'Moringa-led everyday foods and wellness essentials.', start_url: '/', display: 'standalone', background_color: '#f3f0e8', theme_color: '#193325' }; }
