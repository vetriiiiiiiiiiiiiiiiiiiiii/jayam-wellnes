// Why Jayam, said in numbers — every figure comes from the product information.
const FACTS = [
  { value: '500', unit: 'mg', label: 'of pure botanical in every tablet and capsule' },
  { value: '0', unit: '', label: 'fillers, binders, artificial colors or preservatives' },
  { value: '2', unit: 'a day', label: 'one in the morning, one in the evening, with food' },
  { value: '60', unit: 'days', label: 'in every pack — a full 2-month supply' },
];

export default function WhyJayam() {
  return (
    <section className="jw">
      <div className="jw-inner">
        <header className="jw-head" data-reveal>
          <p className="wl-kicker">Why Jayam</p>
          <h2>Simple enough to <em>take every day.</em></h2>
        </header>
        <ul className="jw-facts">
          {FACTS.map(({ value, unit, label }, index) => (
            <li key={label} data-reveal style={{ transitionDelay: `${index * 80}ms` }}>
              <strong>
                {value}
                {unit && <span>{unit}</span>}
              </strong>
              <p>{label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
