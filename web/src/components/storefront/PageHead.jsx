// Centred page heading used across the storefront, in the apple.com manner:
// a small coloured eyebrow, a bold statement with an accented phrase, one line of support.
export default function PageHead({ eyebrow, title, accent, sub, children }) {
  return (
    <header className="pg-head">
      {eyebrow && <p className="pg-eyebrow">{eyebrow}</p>}
      <h1>
        {title}
        {accent && <> <em>{accent}</em></>}
      </h1>
      {sub && <p className="pg-sub">{sub}</p>}
      {children}
    </header>
  );
}
