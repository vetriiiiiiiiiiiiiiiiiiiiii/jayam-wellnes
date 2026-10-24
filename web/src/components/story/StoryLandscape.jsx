// Backdrop for the Our Story journey, on white like the rest of the storefront.
// `progress` (0 → 1) raises a soft mist disc behind the tree; a quiet horizon line anchors the scene.

const lerp = (a, b, t) => a + (b - a) * t;

export default function StoryLandscape({ progress, compact = false }) {
  const p = Math.min(Math.max(progress, 0), 1);
  const rise = Math.sin((p * Math.PI) / 2);

  // The big disc sits behind the tree; on phones the tree is lower and centred-right
  // (phones only see the middle of the 1600-wide scene, roughly x 590–1010)
  const discX = compact ? 880 : 1185;
  const discY = lerp(compact ? 920 : 760, compact ? 780 : 470, rise);
  const discR = compact ? 175 : 270;

  return (
    <svg className="sj-landscape" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sj-disc" cx="0.4" cy="0.35" r="0.65">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#e0ecde" />
          <stop offset="1" stopColor="#cde0c9" />
        </radialGradient>
      </defs>

      <circle cx={discX} cy={discY} r={discR} fill="url(#sj-disc)" />

      {/* Horizon */}
      <line x1="0" y1="866" x2="1600" y2="866" stroke="#e0ecde" strokeWidth="2" />
    </svg>
  );
}
