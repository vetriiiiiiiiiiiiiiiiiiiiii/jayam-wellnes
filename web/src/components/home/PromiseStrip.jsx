import { FlaskConical, Leaf, PackageOpen, ShieldCheck, Sprout, Truck } from 'lucide-react';

const promises = [
  { icon: Sprout, label: 'Organic botanicals' },
  { icon: Leaf, label: 'Vegan & Non-GMO' },
  { icon: ShieldCheck, label: 'GMP-certified' },
  { icon: FlaskConical, label: 'Third-party tested' },
  { icon: PackageOpen, label: 'Plastic-free tubes' },
  { icon: Truck, label: 'Free shipping $49+' },
];

export default function PromiseStrip() {
  return (
    <section className="wl-promise" aria-label="The Jayam promise">
      <ul data-reveal>
        {promises.map(({ icon: Icon, label }) => (
          <li key={label}>
            <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
