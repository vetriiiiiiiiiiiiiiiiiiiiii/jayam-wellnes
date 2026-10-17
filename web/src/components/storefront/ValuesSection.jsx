const values = [
  {
    number: '01',
    title: 'Simple, clean products',
    description: 'No unnecessary fillers, binders, artificial colors or preservatives — and no unnecessary complexity.',
  },
  {
    number: '02',
    title: 'Carefully selected ingredients',
    description: 'Plant-based botanicals like Moringa and Amla, gently vacuum-dried to help preserve their natural qualities.',
  },
  {
    number: '03',
    title: 'Quality and transparency',
    description: 'Every ingredient listed clearly, so you always know what you are taking and how to use it.',
  },
  {
    number: '04',
    title: 'Made for our own families',
    description: 'We only offer products we would feel comfortable giving to the people we love.',
  },
];

export default function ValuesSection() {
  return (
    <section className="jayam-values">
      <div className="jayam-values-intro">
        <p className="jayam-eyebrow">Why Jayam</p>
        <h2>Less noise.<br /><em>More care.</em></h2>
        <p>Plant-based wellness for long-term, everyday health — built with care, trust, and the choices we make again and again.</p>
      </div>
      <div className="jayam-values-list">
        {values.map(({ number, title, description }) => (
          <article key={number}>
            <span>{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
            <span aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  );
}
