import { useEffect, useRef, useState } from 'react';

// The Jayam intro film, shown once per visit while the site loads underneath: the film
// in the centre with a 0–100 counter that follows it.
// index.html decides whether it plays (first page of the visit, not the admin panel,
// not for reduced motion or crawlers) by putting the jayam-intro class on <html>.
// It never blocks the shop: Skip ends it, and it gets out of the way if the video
// can't play or is slow to start.

const START_TIMEOUT_MS = 3500;
const MAX_MS = 14000;

const endIntro = () => {
  document.documentElement.classList.remove('jayam-intro');
  try {
    sessionStorage.setItem('jayam_intro_seen', '1');
  } catch {}
};

export default function IntroVideo() {
  const [phase, setPhase] = useState(() => (document.documentElement.classList.contains('jayam-intro') ? 'playing' : 'done'));
  const video = useRef(null);
  const counter = useRef(null);
  const bar = useRef(null);

  const finish = () => setPhase((current) => (current === 'playing' ? 'leaving' : current));

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    document.body.style.overflow = 'hidden';
    const el = video.current;
    let started = false;
    const onPlaying = () => { started = true; };
    el.addEventListener('playing', onPlaying);
    el.play().catch(finish);

    // The counter follows the film, written straight to the page to avoid re-rendering
    let frame = 0;
    const tick = () => {
      const percent = el.duration ? Math.min(100, Math.round((el.currentTime / el.duration) * 100)) : 0;
      counter.current.textContent = String(percent);
      bar.current.style.transform = `scaleX(${percent / 100})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const slowStart = setTimeout(() => { if (!started) finish(); }, START_TIMEOUT_MS);
    const cap = setTimeout(finish, MAX_MS);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('playing', onPlaying);
      clearTimeout(slowStart);
      clearTimeout(cap);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'leaving') return undefined;
    endIntro();
    document.body.style.overflow = '';
    const timer = setTimeout(() => setPhase('done'), 700);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div className={`intro${phase === 'leaving' ? ' is-leaving' : ''}`} role="dialog" aria-label="Jayam Wellness intro">
      <div className="intro-stage">
        <div className="intro-frame">
          <video
            ref={video}
            className="intro-video"
            src="/intro/jayam-intro.mp4"
            muted
            playsInline
            autoPlay
            preload="auto"
            onEnded={() => {
              counter.current.textContent = '100';
              bar.current.style.transform = 'scaleX(1)';
              setTimeout(finish, 350);
            }}
            onError={finish}
            aria-hidden="true"
          />
        </div>
        <div className="intro-progress" aria-hidden="true">
          <p className="intro-count"><span ref={counter}>0</span><small>%</small></p>
          <span className="intro-track"><span ref={bar} className="intro-bar" /></span>
          <p className="intro-caption">Bringing the best to your hands</p>
        </div>
      </div>
      <button type="button" className="intro-skip" onClick={finish}>Skip intro</button>
    </div>
  );
}
