import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

/* ─────────────────────────────────────────────
   DATA — no fake names, no fake opponents
───────────────────────────────────────────── */
const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "C++", "C",
  "Java", "Go", "Rust", "Kotlin", "Swift",
  "C#", "Ruby", "PHP", "Scala", "Dart", "Haskell",
];

const MATCH_TYPES = [
  { label: "Blitz", desc: "5 min · 1 problem", tag: "FAST" },
  { label: "Ranked", desc: "20 min · 2 problems · ELO", tag: "ELO" },
  { label: "Marathon", desc: "60 min · 5 problems", tag: "HARD" },
  { label: "Team 2v2", desc: "30 min · collaborative", tag: "TEAM" },
  { label: "Practice", desc: "No timer · unranked", tag: "FREE" },
  { label: "Custom", desc: "Your rules · private room", tag: "ROOM" },
];

const FEATURES = [
  {
    num: "01",
    title: "Live matchmaking",
    body: "Queue and get matched against a real developer in seconds. No bots. No delays. Pure competition.",
  },
  {
    num: "02",
    title: "Random problem pool",
    body: "Problems are drawn randomly every match. Memorising LeetCode won't save you here.",
  },
  {
    num: "03",
    title: "ELO ranking",
    body: "Every match shifts your rating. Beat a stronger opponent, gain more. Lose to a weaker one, drop harder.",
  },
  {
    num: "04",
    title: "Language queues",
    body: "Queue specifically for your language. Face people on equal footing — 16 languages supported.",
  },
];

const STATS = [
  { value: "12K+", label: "Developers" },
  { value: "340ms", label: "Avg queue time" },
  { value: "16", label: "Languages" },
  { value: "6", label: "Match modes" },
];

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const [activeLang, setActiveLang] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const modesRef = useRef(null);
  const langsRef = useRef(null);

  /* auth */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  /* entrance */
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* scroll spy */
  useEffect(() => {
    const map = { hero: heroRef, features: featuresRef, modes: modesRef, langs: langsRef };
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const k = Object.keys(map).find((key) => map[key].current === e.target);
            if (k) setActiveSection(k);
          }
        });
      },
      { threshold: 0.25 }
    );
    Object.values(map).forEach((r) => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  const goTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });

  const handleCTA = () => {
    if (authLoading) return;
    navigate(authUser ? "/dashboard" : "/signup");
  };

  const handleLogin = () => navigate("/login");

  const NAV = [
    { label: "Features", ref: featuresRef, key: "features" },
    { label: "Match modes", ref: modesRef, key: "modes" },
    { label: "Languages", ref: langsRef, key: "langs" },
  ];

  /* ───────────────────────────────────────── */
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #f4f4f2; }

        .lp {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          color: #0a0a0a;
          background: #f4f4f2;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* grid texture */
        .lp-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(0,0,0,0.038) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.038) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        /* ── NAVBAR ── */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px;
          background: rgba(244,244,242,0.9);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .lp-nav-brand {
          display: flex; align-items: center; gap: 9px; cursor: pointer;
        }
        .lp-nav-box {
          width: 28px; height: 28px;
          border: 2px solid #0a0a0a;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
        }
        .lp-nav-name {
          font-size: 16px; font-weight: 700; letter-spacing: -0.4px;
        }
        .lp-nav-links {
          display: flex; align-items: center; gap: 2px;
        }
        .lp-nav-link {
          font-size: 13px; font-weight: 500; color: #777;
          padding: 5px 11px; border-radius: 6px; cursor: pointer;
          transition: color 0.15s, background 0.15s;
          border: none; background: transparent;
        }
        .lp-nav-link:hover { color: #0a0a0a; background: rgba(0,0,0,0.05); }
        .lp-nav-link.active { color: #0a0a0a; background: rgba(0,0,0,0.06); }
        .lp-nav-right { display: flex; align-items: center; gap: 8px; }
        .lp-btn-ghost {
          padding: 7px 15px; border-radius: 7px;
          border: 1px solid #d4d4d0; background: transparent;
          font-size: 13px; font-weight: 600; color: #0a0a0a;
          cursor: pointer; transition: border-color 0.15s, background 0.15s;
          font-family: inherit;
        }
        .lp-btn-ghost:hover { border-color: #0a0a0a; background: rgba(0,0,0,0.03); }
        .lp-btn-dark {
          padding: 7px 16px; border-radius: 7px;
          border: none; background: #0a0a0a;
          font-size: 13px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s;
          font-family: inherit;
        }
        .lp-btn-dark:hover { background: #222; }

        /* ── HERO ── */
        .lp-hero {
          position: relative; z-index: 2;
          max-width: 1140px; margin: 0 auto;
          padding: 130px 36px 80px;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .lp-hero-top {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
          margin-bottom: 60px;
        }
        .lp-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid #d8d8d4; border-radius: 999px;
          padding: 5px 14px; background: #fff;
          font-size: 12px; color: #666;
          margin-bottom: 24px;
        }
        .lp-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #0a0a0a;
          animation: lp-pulse 2.2s ease infinite;
        }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .lp-h1 {
          font-size: clamp(52px, 7vw, 84px);
          font-weight: 700; line-height: 1;
          letter-spacing: -3px; color: #0a0a0a;
          margin-bottom: 20px;
        }
        .lp-hero-sub {
          font-size: 16px; color: #666; line-height: 1.8;
          margin-bottom: 32px; max-width: 420px;
        }
        .lp-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 44px; }
        .lp-btn-lg {
          padding: 12px 26px; border-radius: 8px;
          border: none; background: #0a0a0a;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .lp-btn-lg:hover { background: #222; transform: translateY(-1px); }
        .lp-btn-lg-out {
          padding: 12px 26px; border-radius: 8px;
          border: 1px solid #c8c8c4; background: #fff;
          font-size: 14px; font-weight: 600; color: #0a0a0a;
          cursor: pointer; transition: border-color 0.15s, transform 0.1s;
          font-family: inherit;
        }
        .lp-btn-lg-out:hover { border-color: #0a0a0a; transform: translateY(-1px); }

        /* stats row */
        .lp-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: #e0e0dc;
          border: 1px solid #e0e0dc; border-radius: 10px; overflow: hidden;
        }
        .lp-stat {
          background: #fff; padding: 18px 20px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .lp-stat-val {
          font-size: 26px; font-weight: 700;
          letter-spacing: -1px; color: #0a0a0a;
        }
        .lp-stat-lbl { font-size: 12px; color: #999; }

        /* right panel — pure visual, no fake data */
        .lp-hero-right { display: flex; flex-direction: column; gap: 12px; }

        .lp-terminal {
          background: #0a0a0a; border-radius: 12px;
          overflow: hidden; border: 1px solid #141414;
        }
        .lp-terminal-bar {
          height: 40px; background: #111;
          border-bottom: 1px solid #1a1a1a;
          display: flex; align-items: center;
          padding: 0 14px; gap: 6px;
        }
        .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-terminal-filename {
          margin-left: auto;
          font-size: 11px; color: #444;
          font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
        }
        .lp-terminal-body {
          padding: 20px 18px;
          font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
          font-size: 12px; line-height: 2; color: #555;
        }
        .lp-code-line { display: flex; gap: 16px; }
        .lp-ln { color: #2a2a2a; user-select: none; min-width: 14px; }
        .c-kw  { color: #9b8fff; }
        .c-str { color: #86efac; }
        .c-fn  { color: #fbbf24; }
        .c-cm  { color: #2a2a2a; }
        .c-op  { color: #fff; }
        .c-num { color: #f87171; }

        /* match type mini cards */
        .lp-mini-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .lp-mini-card {
          background: #fff; border: 1px solid #e4e4e0;
          border-radius: 8px; padding: 14px;
          transition: border-color 0.15s;
        }
        .lp-mini-card:hover { border-color: #0a0a0a; }
        .lp-mini-tag {
          display: inline-block;
          font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
          color: #999; background: #f0f0ee;
          padding: 2px 6px; border-radius: 4px; margin-bottom: 8px;
        }
        .lp-mini-label { font-size: 13px; font-weight: 700; color: #0a0a0a; margin-bottom: 2px; }
        .lp-mini-desc  { font-size: 11px; color: #aaa; }

        /* ── DIVIDER ── */
        .lp-divider { border: none; border-top: 1px solid #e4e4e0; margin: 0; position: relative; z-index: 2; }

        /* ── SECTIONS ── */
        .lp-section {
          position: relative; z-index: 2;
          max-width: 1140px; margin: 0 auto;
          padding: 80px 36px;
        }
        .lp-section-eyebrow {
          font-size: 11px; font-weight: 600; color: #bbb;
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .lp-section-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700; letter-spacing: -1.5px;
          color: #0a0a0a; margin-bottom: 12px; line-height: 1.05;
        }
        .lp-section-sub {
          font-size: 15px; color: #777; line-height: 1.75;
          max-width: 520px; margin-bottom: 48px;
        }

        /* features */
        .lp-features { display: grid; grid-template-columns: repeat(2,1fr); gap: 1px; background: #e0e0dc; border: 1px solid #e0e0dc; border-radius: 12px; overflow: hidden; }
        .lp-feature {
          background: #fff; padding: 32px;
          transition: background 0.15s;
        }
        .lp-feature:hover { background: #fafaf8; }
        .lp-feature-num { font-size: 11px; color: #ccc; font-weight: 600; margin-bottom: 14px; }
        .lp-feature-title { font-size: 17px; font-weight: 700; color: #0a0a0a; margin-bottom: 10px; }
        .lp-feature-body { font-size: 14px; color: #777; line-height: 1.75; }

        /* modes */
        .lp-modes { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .lp-mode {
          background: #fff; border: 1px solid #e4e4e0;
          border-radius: 10px; padding: 24px;
          cursor: pointer; transition: border-color 0.15s, transform 0.1s;
        }
        .lp-mode:hover { border-color: #0a0a0a; transform: translateY(-2px); }
        .lp-mode-tag {
          display: inline-block; font-size: 9px; font-weight: 700;
          letter-spacing: 0.8px; color: #999; background: #f0f0ee;
          padding: 2px 8px; border-radius: 4px; margin-bottom: 14px;
        }
        .lp-mode-label { font-size: 16px; font-weight: 700; color: #0a0a0a; margin-bottom: 6px; }
        .lp-mode-desc  { font-size: 13px; color: #999; }

        /* languages */
        .lp-lang-scroll { overflow: hidden; position: relative; margin-bottom: 32px; }
        .lp-lang-track {
          display: flex; gap: 8px; width: max-content;
          animation: lp-scroll 28s linear infinite;
        }
        .lp-lang-track:hover { animation-play-state: paused; }
        @keyframes lp-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .lp-lang-pill {
          flex-shrink: 0; padding: 8px 18px;
          border: 1px solid #e4e4e0; border-radius: 999px;
          background: #fff; font-size: 13px; font-weight: 500; color: #555;
          white-space: nowrap;
        }
        .lp-lang-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 8px;
        }
        .lp-lang-card {
          background: #fff; border: 1px solid #e4e4e0;
          border-radius: 8px; padding: 12px 16px;
          font-size: 13px; font-weight: 600; color: #444;
          cursor: pointer; transition: all 0.15s; text-align: center;
        }
        .lp-lang-card:hover, .lp-lang-card.active {
          background: #0a0a0a; color: #fff; border-color: #0a0a0a;
        }

        /* ── CTA STRIP ── */
        .lp-cta {
          position: relative; z-index: 2;
          background: #0a0a0a;
          padding: 80px 36px;
        }
        .lp-cta-inner {
          max-width: 1140px; margin: 0 auto;
          display: flex; justify-content: space-between;
          align-items: center; gap: 40px;
        }
        .lp-cta-title {
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 700; letter-spacing: -1.5px;
          color: #fff; line-height: 1.05; margin-bottom: 10px;
        }
        .lp-cta-sub { font-size: 14px; color: #555; line-height: 1.7; max-width: 400px; }
        .lp-cta-btn {
          flex-shrink: 0; padding: 14px 30px;
          border-radius: 8px; border: none; background: #fff;
          font-size: 15px; font-weight: 700; color: #0a0a0a;
          cursor: pointer; transition: background 0.15s, transform 0.1s;
          white-space: nowrap; font-family: inherit;
        }
        .lp-cta-btn:hover { background: #f0f0ee; transform: translateY(-1px); }

        /* ── FOOTER ── */
        .lp-footer {
          background: #0a0a0a;
          border-top: 1px solid #111;
          padding: 24px 36px;
          display: flex; justify-content: space-between; align-items: center;
          position: relative; z-index: 2;
        }
        .lp-footer-brand { display:flex; align-items:center; gap:8px; }
        .lp-footer-box {
          width: 22px; height: 22px; border: 1.5px solid #2a2a2a;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: #333;
        }
        .lp-footer-name { font-size: 13px; font-weight: 700; color: #fff; }
        .lp-footer-copy { font-size: 11px; color: #333; }
        .lp-footer-links { display:flex; gap:20px; }
        .lp-footer-link { font-size: 11px; color: #333; cursor: pointer; transition: color 0.15s; }
        .lp-footer-link:hover { color: #888; }

        @media(max-width:860px){
          .lp-hero-top { grid-template-columns:1fr; }
          .lp-stats { grid-template-columns:repeat(2,1fr); }
          .lp-features { grid-template-columns:1fr; }
          .lp-modes { grid-template-columns:repeat(2,1fr); }
          .lp-mini-grid { grid-template-columns:repeat(2,1fr); }
          .lp-cta-inner { flex-direction:column; text-align:center; }
          .lp-nav-links { display:none; }
          .lp-footer { flex-direction:column; gap:14px; text-align:center; }
        }
      `}</style>

      <div className="lp">
        <div className="lp-grid" />

        {/* ══ NAVBAR ══ */}
        <nav className="lp-nav">
          <div className="lp-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="lp-nav-box">CX</div>
            <span className="lp-nav-name">Codex</span>
          </div>

          <div className="lp-nav-links">
            {NAV.map(({ label, ref, key }) => (
              <button
                key={key}
                className={`lp-nav-link${activeSection === key ? " active" : ""}`}
                onClick={() => goTo(ref)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="lp-nav-right">
            {authLoading ? (
              <div style={{ width: 120, height: 32, background: "#eee", borderRadius: 7 }} />
            ) : authUser ? (
              <button className="lp-btn-dark" onClick={() => navigate("/dashboard")}>Dashboard →</button>
            ) : (
              <>
                <button className="lp-btn-ghost" onClick={handleLogin}>Log in</button>
                <button className="lp-btn-dark" onClick={handleCTA}>Sign up free</button>
              </>
            )}
          </div>
        </nav>

        {/* ══ HERO ══ */}
        <section
          ref={heroRef}
          className="lp-hero"
          style={{ opacity: entered ? 1 : 0, transform: entered ? "translateY(0)" : "translateY(18px)" }}
        >
          <div className="lp-hero-top">

            {/* LEFT */}
            <div>
              <div className="lp-eyebrow">
                <div className="lp-eyebrow-dot" />
                Competitive coding platform
              </div>

              <h1 className="lp-h1">
                Code.<br />
                Compete.<br />
                Dominate.
              </h1>

              <p className="lp-hero-sub">
                Real-time 1v1 coding battles. Live matchmaking,
                random problems, ELO rankings, and 16 languages.
                No prep tricks. Just skill.
              </p>

              <div className="lp-hero-btns">
                <button className="lp-btn-lg" onClick={handleCTA}>
                  {authUser ? "Go to Dashboard →" : "Start competing free →"}
                </button>
                <button className="lp-btn-lg-out" onClick={() => goTo(modesRef)}>
                  See match modes
                </button>
              </div>

              <div className="lp-stats">
                {STATS.map(({ value, label }) => (
                  <div className="lp-stat" key={label}>
                    <span className="lp-stat-val">{value}</span>
                    <span className="lp-stat-lbl">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — visual only, zero fake data */}
            <div className="lp-hero-right">

              {/* Code terminal — illustrative, not a mock match */}
              <div className="lp-terminal">
                <div className="lp-terminal-bar">
                  <div className="lp-dot" style={{ background: "#ff5f57" }} />
                  <div className="lp-dot" style={{ background: "#febc2e" }} />
                  <div className="lp-dot" style={{ background: "#28c840" }} />
                  <span className="lp-terminal-filename">solution.py</span>
                </div>
                <div className="lp-terminal-body">
                  <div className="lp-code-line">
                    <span className="lp-ln">1</span>
                    <span><span className="c-kw">def </span><span className="c-fn">longest_substring</span><span className="c-op">(s: str) -&gt; int:</span></span>
                  </div>
                  <div className="lp-code-line">
                    <span className="lp-ln">2</span>
                    <span style={{ paddingLeft: 16 }}><span className="c-kw">seen</span><span className="c-op"> = </span><span className="c-kw">{ }</span><span className="c-op">;</span> <span className="c-kw">left</span><span className="c-op"> = best = </span><span className="c-num">0</span></span>
                  </div>
                  <div className="lp-code-line">
                    <span className="lp-ln">3</span>
                    <span style={{ paddingLeft: 16 }}><span className="c-kw">for </span><span className="c-op">i, ch </span><span className="c-kw">in </span><span className="c-fn">enumerate</span><span className="c-op">(s):</span></span>
                  </div>
                  <div className="lp-code-line">
                    <span className="lp-ln">4</span>
                    <span style={{ paddingLeft: 32 }}><span className="c-kw">if </span><span className="c-op">ch </span><span className="c-kw">in </span><span className="c-op">seen: left = </span><span className="c-fn">max</span><span className="c-op">(left, seen[ch]+</span><span className="c-num">1</span><span className="c-op">)</span></span>
                  </div>
                  <div className="lp-code-line">
                    <span className="lp-ln">5</span>
                    <span style={{ paddingLeft: 32 }}><span className="c-op">seen[ch] = i; best = </span><span className="c-fn">max</span><span className="c-op">(best, i-left+</span><span className="c-num">1</span><span className="c-op">)</span></span>
                  </div>
                  <div className="lp-code-line">
                    <span className="lp-ln">6</span>
                    <span style={{ paddingLeft: 16 }}><span className="c-kw">return </span><span className="c-op">best</span></span>
                  </div>
                  <div className="lp-code-line" style={{ marginTop: 8 }}>
                    <span className="lp-ln">7</span>
                    <span className="c-cm"># ✓ accepted · runtime 98ms · memory 14.2mb</span>
                  </div>
                </div>
              </div>

              {/* Match type quick grid */}
              <div className="lp-mini-grid">
                {MATCH_TYPES.map((mt) => (
                  <div className="lp-mini-card" key={mt.label} onClick={handleCTA}>
                    <div className="lp-mini-tag">{mt.tag}</div>
                    <div className="lp-mini-label">{mt.label}</div>
                    <div className="lp-mini-desc">{mt.desc}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        <hr className="lp-divider" />

        {/* ══ FEATURES ══ */}
        <section className="lp-section" ref={featuresRef}>
          <p className="lp-section-eyebrow">Why Codex</p>
          <h2 className="lp-section-title">Built different.</h2>
          <p className="lp-section-sub">
            Not a grind-and-memorise platform. Codex is live competition
            where skill is the only variable.
          </p>

          <div className="lp-features">
            {FEATURES.map((f) => (
              <div className="lp-feature" key={f.num}>
                <div className="lp-feature-num">{f.num}</div>
                <div className="lp-feature-title">{f.title}</div>
                <div className="lp-feature-body">{f.body}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="lp-divider" />

        {/* ══ MATCH MODES ══ */}
        <section className="lp-section" ref={modesRef}>
          <p className="lp-section-eyebrow">Match modes</p>
          <h2 className="lp-section-title">Six ways to fight.</h2>
          <p className="lp-section-sub">
            From 5-minute blitz rounds to 60-minute endurance marathons —
            pick the format that fits.
          </p>

          <div className="lp-modes">
            {MATCH_TYPES.map((mt) => (
              <div className="lp-mode" key={mt.label} onClick={handleCTA}>
                <div className="lp-mode-tag">{mt.tag}</div>
                <div className="lp-mode-label">{mt.label}</div>
                <div className="lp-mode-desc">{mt.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="lp-divider" />

        {/* ══ LANGUAGES ══ */}
        <section className="lp-section" ref={langsRef}>
          <p className="lp-section-eyebrow">Languages</p>
          <h2 className="lp-section-title">Your language, your queue.</h2>
          <p className="lp-section-sub">
            Queue specifically in your language and face opponents on equal footing.
            16 languages — hover to select, click to start competing.
          </p>

          {/* scrolling belt */}
          <div className="lp-lang-scroll">
            <div className="lp-lang-track">
              {[...LANGUAGES, ...LANGUAGES].map((l, i) => (
                <div className="lp-lang-pill" key={i}>{l}</div>
              ))}
            </div>
          </div>

          {/* interactive grid */}
          <div className="lp-lang-grid">
            {LANGUAGES.map((l) => (
              <div
                key={l}
                className={`lp-lang-card${activeLang === l ? " active" : ""}`}
                onClick={() => { setActiveLang(l); handleCTA(); }}
                onMouseEnter={() => setActiveLang(l)}
                onMouseLeave={() => setActiveLang(null)}
              >
                {l}
              </div>
            ))}
          </div>
        </section>

        {/* ══ CTA ══ */}
        <div className="lp-cta">
          <div className="lp-cta-inner">
            <div>
              <h2 className="lp-cta-title">Ready to compete?<br />Join the arena.</h2>
              <p className="lp-cta-sub">
                Free to start. No credit card. You enter at 1200 ELO — the rest is on you.
              </p>
            </div>
            <button className="lp-cta-btn" onClick={handleCTA}>
              {authUser ? "Go to Dashboard →" : "Create free account →"}
            </button>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer className="lp-footer">
          <div className="lp-footer-brand">
            <div className="lp-footer-box">CX</div>
            <span className="lp-footer-name">Codex</span>
          </div>
          <span className="lp-footer-copy">© 2026 Codex · Built for competitors</span>
          <div className="lp-footer-links">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <span className="lp-footer-link" key={l}>{l}</span>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
