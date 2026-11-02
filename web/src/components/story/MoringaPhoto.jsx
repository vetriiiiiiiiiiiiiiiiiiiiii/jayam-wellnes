// A real moringa orchard in Maharashtra, India, with the credit its licence requires.
export default function MoringaPhoto({ className = '' }) {
  return (
    <figure className={`moringa-photo ${className}`}>
      <img src="/moringa-tree.webp" alt="Moringa trees growing in an orchard in Maharashtra, India" width="1600" height="1065" loading="lazy" decoding="async" />
      <figcaption>
        Photo: <a href="https://commons.wikimedia.org/wiki/File:Drumstick_tree_(Moringa_oleifera).jpg" target="_blank" rel="noreferrer">Crops for the Future</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/3.0" target="_blank" rel="noreferrer">CC BY-SA 3.0</a>, resized
      </figcaption>
    </figure>
  );
}
