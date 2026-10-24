// Why Jayam, said in numbers — every figure comes from the product information.
// Text is editable in Admin → Site content.
export default function WhyJayam({ content }) {
  return (
    <section className="jw">
      <div className="jw-inner">
        <header className="jw-head" data-reveal>
          <p className="wl-kicker">{content.eyebrow}</p>
          <h2>{content.title} <em>{content.accent}</em></h2>
        </header>
        <ul className="jw-facts">
          {content.facts.map(({ value, unit, label }, index) => (
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
