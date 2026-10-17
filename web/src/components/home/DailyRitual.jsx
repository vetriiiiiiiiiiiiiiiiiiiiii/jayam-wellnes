import { Leaf, Moon, Sunrise } from 'lucide-react';

const steps = [
  {
    icon: Sunrise,
    time: 'Morning',
    title: 'Begin gently',
    body: 'Take one tablet or capsule with breakfast and a glass of water.',
  },
  {
    icon: Moon,
    time: 'Evening',
    title: 'Close the day',
    body: 'Take one more with dinner. Two a day is all it takes.',
  },
  {
    icon: Leaf,
    time: 'Over time',
    title: 'Let it become a habit',
    body: 'Consistency matters more than quick fixes — every pack is a 2-month supply.',
  },
];

export default function DailyRitual() {
  return (
    <section className="wl-section wl-ritual">
      <header className="wl-section-head wl-section-head--center" data-reveal>
        <p className="wl-kicker">Your daily ritual</p>
        <h2>Wellness that fits <em>into your day.</em></h2>
      </header>
      <ol className="wl-ritual-steps">
        {steps.map(({ icon: Icon, time, title, body }) => (
          <li key={time} data-reveal>
            <span className="wl-ritual-icon"><Icon size={24} strokeWidth={1.4} aria-hidden="true" /></span>
            <p className="wl-ritual-time">{time}</p>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
      <p className="wl-ritual-note">For skin: a few drops of Beauty Drops on clean skin, morning or night.</p>
    </section>
  );
}
