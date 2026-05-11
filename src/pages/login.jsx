import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

const FEED = [
  "ranked queue active",
  "python arena overloaded",
  "new hard problems deployed",
  "2v2 mode launching soon",
  "live coding battles running",
];

const STATS = [
  { num: "12k+", lbl: "Active players" },
  { num: "340ms", lbl: "Queue speed" },
  { num: "16", lbl: "Languages" },
  { num: "ELO", lbl: "Ranked system" },
];

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedIdx, setFeedIdx] = useState(0);

  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % FEED.length), 2600);
    return () => clearInterval(t);
  }, []);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!email) { setEmailError("Email is required"); setEmailValid(false); }
    else if (!emailRegex.test(email)) { setEmailError("Enter a valid email"); setEmailValid(false); }
    else { setEmailError(""); setEmailValid(true); }
  };

  const handleLogin = async () => {
    setError(""); setSuccess("");

    if (!email || !password) { setError("Enter email and password"); return; }
    if (!emailRegex.test(email)) { setError("Enter a valid email"); return; }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account with this email");
      else if (err.code === "auth/wrong-password") setError("Wrong password");
      else if (err.code === "auth/invalid-credential") setError("Invalid email or password");
      else setError("Login failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError(""); setSuccess("");
    if (!email) { setError("Enter your email first"); return; }
    if (!emailRegex.test(email)) { setError("Enter a valid email first"); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Reset link sent — check your inbox");
    } catch {
      setError("Could not send reset email");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-page {
          min-height: 100vh;
          display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          background: #0a0a0a;
          overflow-x: hidden;
        }

        /* ── LEFT — black ── */
        .lp-left {
          width: 58%;
          min-height: 100vh;
          padding: 44px 52px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* subtle grid */
        .lp-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: lp-fade 1s ease both;
        }
        @keyframes lp-fade { from{opacity:0} to{opacity:1} }

        /* glows — no harsh edges */
        .lp-glow-tl {
          position: absolute; pointer-events: none;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.055) 0%, transparent 65%);
          top: -260px; left: -220px; filter: blur(8px);
        }
        .lp-glow-br {
          position: absolute; pointer-events: none;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 65%);
          bottom: -200px; right: -160px;
        }

        .lp-brand {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 10px;
          animation: lp-up 0.5s ease both;
        }
        .lp-brand-box {
          width: 30px; height: 30px;
          border: 2px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; letter-spacing: 0.5px;
        }
        .lp-brand-name { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }

        .lp-hero {
          position: relative; z-index: 2;
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 28px 0;
        }

        /* live feed pill */
        .lp-live {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid #1a1a1a; border-radius: 4px;
          padding: 5px 12px; background: rgba(255,255,255,0.03);
          width: fit-content; margin-bottom: 28px;
          animation: lp-up 0.5s 0.08s ease both;
          overflow: hidden;
        }
        .lp-live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #fff; flex-shrink: 0;
          animation: lp-pulse 2s ease infinite;
        }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .lp-live-text {
          font-size: 11px; color: #555; letter-spacing: 0.5px;
          transition: opacity 0.3s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 260px;
        }

        .lp-h1 {
          font-size: clamp(44px, 5.5vw, 68px);
          font-weight: 700; line-height: 1.0; letter-spacing: -2.5px;
          color: #fff; margin-bottom: 16px;
          animation: lp-up 0.5s 0.12s ease both;
        }
        .lp-h1 em { font-style: normal; color: #333; }

        .lp-sub {
          font-size: 14px; color: #444; line-height: 1.8;
          max-width: 380px; margin-bottom: 36px;
          animation: lp-up 0.5s 0.16s ease both;
        }

        /* terminal */
        .lp-terminal {
          border-radius: 10px; overflow: hidden;
          background: #0d0d0d; border: 1px solid #161616;
          max-width: 560px; margin-bottom: 28px;
          animation: lp-up 0.5s 0.2s ease both;
        }
        .lp-term-bar {
          height: 38px; background: #111; border-bottom: 1px solid #161616;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px;
        }
        .lp-term-dots { display: flex; gap: 6px; }
        .lp-term-dot { width: 9px; height: 9px; border-radius: 50%; }
        .lp-term-file { font-size: 11px; color: #333; }
        .lp-term-body {
          padding: 16px 18px;
          font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
          font-size: 12px; line-height: 1.9; color: #3a3a3a;
        }
        .lp-term-line { animation: lp-fade 0.4s ease both; }
        .lp-term-line:nth-child(1){ animation-delay:0.3s }
        .lp-term-line:nth-child(2){ animation-delay:0.55s }
        .lp-term-line:nth-child(3){ animation-delay:0.8s; color:#666; }
        .lp-term-line:nth-child(4){ animation-delay:1.05s }
        .lp-term-line:nth-child(5){ animation-delay:1.3s; color:#555; }

        /* stats */
        .lp-stats {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: #141414;
          border: 1px solid #141414; border-radius: 8px; overflow: hidden;
          animation: lp-up 0.5s 0.25s ease both;
        }
        .lp-stat {
          background: #0d0d0d; padding: 16px;
          display: flex; flex-direction: column; gap: 5px;
          transition: background 0.2s;
        }
        .lp-stat:hover { background: #111; }
        .lp-stat-num { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
        .lp-stat-lbl { font-size: 10px; color: #333; text-transform: uppercase; letter-spacing: 0.5px; }

        .lp-footer {
          position: relative; z-index: 2;
          font-size: 11px; color: #222;
          animation: lp-up 0.5s 0.3s ease both;
        }

        @keyframes lp-up {
          from { opacity:0; transform: translateY(14px); }
          to   { opacity:1; transform: translateY(0); }
        }

        /* ── RIGHT — white ── */
        .lp-right {
          width: 42%;
          min-height: 100vh;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 52px 44px;
          /* no border-left — avoids seam artifact */
        }

        .lp-form {
          width: 100%; max-width: 360px;
          animation: lp-up 0.6s 0.1s ease both;
        }

        .lp-eyebrow {
          font-size: 11px; font-weight: 600; color: #bbb;
          letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;
        }
        .lp-form-title {
          font-size: 28px; font-weight: 700; color: #0a0a0a;
          letter-spacing: -1px; line-height: 1.1; margin-bottom: 4px;
        }
        .lp-form-sub { font-size: 13px; color: #999; line-height: 1.6; margin-bottom: 28px; }

        /* alerts */
        .lp-alert {
          border-radius: 7px; padding: 10px 14px; margin-bottom: 16px;
          font-size: 12px; line-height: 1.5;
          animation: lp-up 0.2s ease;
        }
        .lp-alert-err { background: #fff0f0; border: 1px solid #fcc; color: #c00; }
        .lp-alert-ok  { background: #f0fff6; border: 1px solid #b8f5ce; color: #1a6e3c; }

        /* field */
        .lp-field { margin-bottom: 14px; }
        .lp-label {
          display: block; font-size: 11px; font-weight: 600;
          color: #bbb; text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 6px; transition: color 0.2s;
        }
        .lp-field:focus-within .lp-label { color: #0a0a0a; }
        .lp-field.lp-err .lp-label { color: #e00; }

        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%; padding: 11px 14px;
          background: #f8f8f6; border-radius: 7px;
          font-size: 14px; color: #0a0a0a; font-family: inherit;
          border: 1.5px solid #e2e2e0;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .lp-input::placeholder { color: #c8c8c4; }
        .lp-input:focus {
          background: #fff; border-color: #0a0a0a;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.06);
        }
        .lp-input.lp-valid   { border-color: #0a0a0a; }
        .lp-input.lp-invalid { border-color: #e00; background: #fff8f8; }
        .lp-input.lp-pr      { padding-right: 56px; }

        .lp-check {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 14px; color: #0a0a0a; pointer-events: none;
          animation: lp-popin 0.2s ease;
        }
        @keyframes lp-popin {
          from { opacity:0; transform: translateY(-50%) scale(0.5); }
          to   { opacity:1; transform: translateY(-50%) scale(1); }
        }

        .lp-eye {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          font-size: 11px; font-weight: 600; color: #c0c0bc;
          cursor: pointer; user-select: none; letter-spacing: 0.3px;
          transition: color 0.15s;
        }
        .lp-eye:hover { color: #0a0a0a; }

        .lp-field-err { font-size: 11px; color: #e00; margin-top: 5px; animation: lp-up 0.2s ease; }

        /* forgot */
        .lp-forgot-row { text-align: right; margin-bottom: 20px; }
        .lp-forgot {
          font-size: 12px; color: #bbb; cursor: pointer;
          transition: color 0.15s;
          border: none; background: none; font-family: inherit; padding: 0;
        }
        .lp-forgot:hover { color: #0a0a0a; }

        /* button */
        .lp-btn {
          width: 100%; padding: 13px;
          background: #0a0a0a; border: none; border-radius: 7px;
          font-size: 14px; font-weight: 600; color: #fff;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          transition: background 0.15s, opacity 0.15s, transform 0.1s;
          font-family: inherit; position: relative; overflow: hidden;
        }
        .lp-btn::after {
          content: "";
          position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transition: left 0.6s ease;
        }
        .lp-btn:hover::after { left: 160%; }
        .lp-btn:hover:not(:disabled) { background: #1a1a1a; transform: translateY(-1px); }
        .lp-btn:active:not(:disabled) { transform: translateY(0); }
        .lp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes lp-spin { to { transform: rotate(360deg) } }
        .lp-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          animation: lp-spin 0.7s linear infinite; flex-shrink: 0;
        }

        /* divider */
        .lp-divider { display: flex; align-items: center; gap: 10px; margin: 20px 0; }
        .lp-divider-line { flex: 1; height: 1px; background: #ebebea; }
        .lp-divider-text { font-size: 11px; color: #ccc; }

        .lp-switch { text-align: center; font-size: 13px; color: #aaa; }
        .lp-switch-link {
          margin-left: 5px; color: #0a0a0a; font-weight: 700;
          cursor: pointer; text-decoration: underline;
          text-underline-offset: 2px; transition: color 0.15s;
        }
        .lp-switch-link:hover { color: #333; }

        /* responsive */
        @media (max-width: 900px) {
          .lp-page { flex-direction: column; }
          .lp-left, .lp-right { width: 100%; min-height: auto; }
          .lp-right { padding: 44px 28px; }
          .lp-stats { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .lp-left { padding: 28px 24px; }
          .lp-h1 { font-size: 40px; letter-spacing: -1.5px; }
        }
      `}</style>

      <div className="lp-page">

        {/* ══ LEFT ══ */}
        <div className="lp-left">
          <div className="lp-grid" />
          <div className="lp-glow-tl" />
          <div className="lp-glow-br" />

          <div className="lp-brand">
            <div className="lp-brand-box">CX</div>
            <span className="lp-brand-name">Codex</span>
          </div>

          <div className="lp-hero">
            <div className="lp-live">
              <div className="lp-live-dot" />
              <span className="lp-live-text" key={feedIdx}>{FEED[feedIdx]}</span>
            </div>

            <h1 className="lp-h1">
              Welcome<br />
              <em>back.</em>
            </h1>

            <p className="lp-sub">
              Continue your ranked journey, enter live coding battles,
              and climb the global leaderboard.
            </p>

            {/* Terminal */}
            <div className="lp-terminal">
              <div className="lp-term-bar">
                <div className="lp-term-dots">
                  <div className="lp-term-dot" style={{ background: "#ff5f57" }} />
                  <div className="lp-term-dot" style={{ background: "#febc2e" }} />
                  <div className="lp-term-dot" style={{ background: "#28c840" }} />
                </div>
                <span className="lp-term-file">codex_queue.sh</span>
              </div>
              <div className="lp-term-body">
                <div className="lp-term-line">&gt; initializing ranked arena...</div>
                <div className="lp-term-line">&gt; searching for opponent</div>
                <div className="lp-term-line">&gt; opponent found</div>
                <div className="lp-term-line">&gt; loading problem · difficulty: medium</div>
                <div className="lp-term-line">&gt; battle starting in 3s</div>
              </div>
            </div>

            {/* Stats */}
            <div className="lp-stats">
              {STATS.map(({ num, lbl }) => (
                <div className="lp-stat" key={lbl}>
                  <span className="lp-stat-num">{num}</span>
                  <span className="lp-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-footer">© 2026 Codex · Built for competitors</div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lp-right">
          <div className="lp-form">

            <p className="lp-eyebrow">02 / Login</p>
            <h2 className="lp-form-title">Sign in</h2>
            <p className="lp-form-sub">Pick up where you left off.</p>

            {error && <div className="lp-alert lp-alert-err">{error}</div>}
            {success && <div className="lp-alert lp-alert-ok">{success}</div>}

            {/* EMAIL */}
            <div className={`lp-field${emailError ? " lp-err" : ""}`}>
              <label className="lp-label">Email address</label>
              <div className="lp-input-wrap">
                <input
                  className={`lp-input${emailValid ? " lp-valid" : ""}${emailError ? " lp-invalid" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTouched) {
                      const ok = emailRegex.test(e.target.value);
                      setEmailValid(ok);
                      setEmailError(ok ? "" : "Enter a valid email");
                    }
                  }}
                  onBlur={handleEmailBlur}
                  onKeyDown={handleKey}
                />
                {emailValid && <span className="lp-check">✓</span>}
              </div>
              {emailError && <p className="lp-field-err">{emailError}</p>}
            </div>

            {/* PASSWORD */}
            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-input-wrap">
                <input
                  className="lp-input lp-pr"
                  type={showPass ? "text" : "password"}
                  placeholder="your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                />
                <span className="lp-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "hide" : "show"}
                </span>
              </div>
            </div>

            {/* FORGOT */}
            <div className="lp-forgot-row">
              <button className="lp-forgot" onClick={handleForgot}>
                Forgot password?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              className="lp-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading && <span className="lp-spinner" />}
              <span>{loading ? "Entering..." : "Enter the arena"}</span>
              {!loading && <span>→</span>}
            </button>

            <div className="lp-divider">
              <div className="lp-divider-line" />
              <span className="lp-divider-text">or</span>
              <div className="lp-divider-line" />
            </div>

            <p className="lp-switch">
              New competitor?
              <span className="lp-switch-link" onClick={() => navigate("/signup")}>
                Create account
              </span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
