import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function getStrength(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 3);
}

const S_LABEL = ["Too short", "Weak", "Fair", "Strong"];
const S_COLOR = ["#666", "#999", "#ccc", "#fff"];

const FEED = [
  "Python ranked queue active",
  "New hard challenge deployed",
  "Rust arena now live",
  "2v2 battle room opened",
  "JS queue reached 300+",
];

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedIdx, setFeedIdx] = useState(0);
  const [entered, setEntered] = useState(false);

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValid, setFieldValid] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strength = getStrength(password);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFeedIdx((i) => (i + 1) % FEED.length), 2600);
    return () => clearInterval(t);
  }, []);

  const validate = (field, ov = {}) => {
    const u = ov.username ?? username;
    const e = ov.email ?? email;
    const p = ov.password ?? password;
    const c = ov.confirm ?? confirm;
    const err = { ...fieldErrors };
    const val = { ...fieldValid };

    if (field === "username") {
      if (!u.trim()) { err.username = "Username required"; val.username = false; }
      else { delete err.username; val.username = true; }
    }
    if (field === "email") {
      if (!emailRegex.test(e)) { err.email = "Enter a valid email"; val.email = false; }
      else { delete err.email; val.email = true; }
    }
    if (field === "password") {
      if (p.length < 6) { err.password = "Min. 6 characters"; val.password = false; }
      else { delete err.password; val.password = true; }
    }
    if (field === "confirm") {
      if (c !== p) { err.confirm = "Passwords do not match"; val.confirm = false; }
      else { delete err.confirm; val.confirm = true; }
    }
    setFieldErrors(err);
    setFieldValid(val);
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validate(field);
  };

  const handleSignup = async () => {
    setError("");
    const err = {}; const val = {}; let bad = false;
    if (!username.trim()) { err.username = "Username required"; val.username = false; bad = true; } else val.username = true;
    if (!emailRegex.test(email)) { err.email = "Enter a valid email"; val.email = false; bad = true; } else val.email = true;
    if (password.length < 6) { err.password = "Min. 6 characters"; val.password = false; bad = true; } else val.password = true;
    if (password !== confirm) { err.confirm = "Passwords do not match"; val.confirm = false; bad = true; } else val.confirm = true;
    setFieldErrors(err); setFieldValid(val);
    setTouched({ username: true, email: true, password: true, confirm: true });
    if (bad) return;

    try {
      setLoading(true);
      const uc = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(uc.user, { displayName: username });
      await setDoc(doc(db, "users", uc.user.uid), {
        username, email, rating: 1200, wins: 0, losses: 0, streak: 0, createdAt: Date.now(),
      });
      navigate("/dashboard");
    } catch (e) {
      if (e.code === "auth/email-already-in-use") setError("Email already in use");
      else if (e.code === "auth/weak-password") setError("Password too weak");
      else setError("Signup failed. Try again");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050505; overflow-x: hidden; }

        /* ── PAGE ── */
        .sp { min-height: 100vh; display: flex; background: #050505;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }

        /* ── GRID BG ── */
        .sp-grid {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 52px 52px;
        }

        /* ── LEFT ── */
        .sp-left {
          width: 55%; min-height: 100vh;
          display: flex; flex-direction: column;
          padding: 48px 56px;
          position: relative; z-index: 2;
          background: #050505;
        }

        /* animated glow blob */
        .sp-blob {
          position: absolute; pointer-events: none;
          width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 60%);
          top: -280px; left: -240px;
          animation: blob 8s ease-in-out infinite alternate;
        }
        @keyframes blob {
          from { transform: scale(1) translate(0,0);   opacity: 0.7; }
          to   { transform: scale(1.15) translate(30px,40px); opacity: 1; }
        }

        /* brand */
        .sp-brand {
          position: relative; z-index: 2;
          display: flex; align-items: center; gap: 12px;
          opacity: 0; animation: up 0.6s 0.05s ease forwards;
        }
        .sp-brand-box {
          width: 32px; height: 32px; border: 2px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff; letter-spacing: 1px;
        }
        .sp-brand-name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }

        /* hero */
        .sp-hero {
          position: relative; z-index: 2;
          flex: 1; display: flex; flex-direction: column;
          justify-content: center; padding: 40px 0 32px; gap: 0;
        }

        /* live tag */
        .sp-live {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid #222; border-radius: 6px;
          padding: 6px 14px; background: rgba(255,255,255,0.04);
          width: fit-content; margin-bottom: 32px;
          opacity: 0; animation: up 0.6s 0.15s ease forwards;
        }
        .sp-live-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #fff;
          flex-shrink: 0; animation: pulse 2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
        .sp-live-text { font-size: 12px; color: #888; letter-spacing: 0.3px; }

        /* big title */
        .sp-title {
          font-size: clamp(56px, 6vw, 80px);
          font-weight: 800; line-height: 0.95; letter-spacing: -3px;
          color: #fff; margin-bottom: 20px;
          opacity: 0; animation: up 0.6s 0.22s ease forwards;
        }
        .sp-title .dim { color: #444; }

        .sp-sub {
          font-size: 15px; color: #777; line-height: 1.8;
          max-width: 440px; margin-bottom: 44px;
          opacity: 0; animation: up 0.6s 0.3s ease forwards;
        }

        /* stats grid — 2x2 */
        .sp-stats {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: #111;
          border: 1px solid #111; border-radius: 10px; overflow: hidden;
          max-width: 420px; margin-bottom: 36px;
          opacity: 0; animation: up 0.6s 0.38s ease forwards;
        }
        .sp-stat {
          background: #0a0a0a; padding: 18px 20px;
          display: flex; flex-direction: column; gap: 5px;
          transition: background 0.2s;
        }
        .sp-stat:hover { background: #0f0f0f; }
        .sp-stat-num { font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -1px; }
        .sp-stat-lbl { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 0.8px; }

        /* terminal */
        .sp-terminal {
          border-radius: 10px; overflow: hidden;
          background: #0a0a0a; border: 1px solid #141414;
          max-width: 480px;
          opacity: 0; animation: up 0.6s 0.46s ease forwards;
        }
        .sp-term-bar {
          height: 38px; background: #0d0d0d; border-bottom: 1px solid #141414;
          display: flex; align-items: center; justify-content: space-between; padding: 0 14px;
        }
        .sp-term-dots { display: flex; gap: 6px; }
        .sp-term-dot  { width: 9px; height: 9px; border-radius: 50%; }
        .sp-term-file { font-size: 11px; color: #333; font-family: monospace; }
        .sp-term-body {
          padding: 16px 18px;
          font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
          font-size: 12px; line-height: 1.9;
        }
        .sp-tl { opacity: 0; animation: up 0.4s ease forwards; }
        .sp-tl:nth-child(1){ animation-delay:.5s;  color:#888 }
        .sp-tl:nth-child(2){ animation-delay:.75s; color:#aaa }
        .sp-tl:nth-child(3){ animation-delay:1s;   color:#fff }
        .sp-tl:nth-child(4){ animation-delay:1.25s;color:#aaa }
        .sp-tl:nth-child(5){ animation-delay:1.5s; color:#555 }

        .sp-footer {
          position: relative; z-index: 2;
          font-size: 11px; color: #2a2a2a;
          opacity: 0; animation: up 0.6s 0.5s ease forwards;
        }

        /* ── RIGHT ── */
        .sp-right {
          width: 45%; min-height: 100vh;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 52px 48px;
          position: relative; z-index: 2;
        }

        .sp-form {
          width: 100%; max-width: 380px;
          opacity: 0; animation: up 0.7s 0.12s ease forwards;
        }

        .sp-eyebrow { font-size: 11px; font-weight: 600; color: #bbb; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 8px; }
        .sp-form-title { font-size: 30px; font-weight: 800; color: #0a0a0a; letter-spacing: -1px; line-height: 1.1; margin-bottom: 4px; }
        .sp-form-sub { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 28px; }

        /* global error */
        .sp-gerr {
          background: #fff0f0; border: 1px solid #fcc; border-radius: 8px;
          padding: 11px 14px; margin-bottom: 18px;
          font-size: 13px; color: #c00; line-height: 1.5;
          animation: up 0.2s ease;
        }

        /* field */
        .sp-field { margin-bottom: 16px; }
        .sp-label {
          display: block; font-size: 11px; font-weight: 700;
          color: #999; text-transform: uppercase; letter-spacing: 1px;
          margin-bottom: 7px; transition: color 0.2s;
        }
        .sp-field:focus-within .sp-label { color: #0a0a0a; }
        .sp-field.sp-bad .sp-label { color: #d00; }

        .sp-iw { position: relative; }
        .sp-in {
          width: 100%; padding: 13px 16px;
          background: #f5f5f3; border-radius: 8px;
          font-size: 15px; color: #0a0a0a; font-family: inherit;
          border: 1.5px solid #e8e8e5; outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .sp-in::placeholder { color: #bbb; }
        .sp-in:focus { background: #fff; border-color: #0a0a0a; box-shadow: 0 0 0 3px rgba(0,0,0,0.07); }
        .sp-in.ok  { border-color: #0a0a0a; }
        .sp-in.bad { border-color: #d00; background: #fff8f8; }
        .sp-in.pr  { padding-right: 56px; }

        .sp-check {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 15px; color: #0a0a0a; pointer-events: none;
          animation: pop 0.2s ease;
        }
        @keyframes pop {
          from { opacity:0; transform: translateY(-50%) scale(0.4); }
          to   { opacity:1; transform: translateY(-50%) scale(1); }
        }
        .sp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          font-size: 11px; font-weight: 700; color: #bbb;
          cursor: pointer; user-select: none; transition: color 0.15s;
        }
        .sp-eye:hover { color: #0a0a0a; }
        .sp-ferr { font-size: 11px; color: #d00; margin-top: 5px; animation: up 0.2s ease; }

        /* strength */
        .sp-bars { display: flex; gap: 4px; height: 3px; margin-top: 8px; }
        .sp-bar { flex: 1; border-radius: 2px; transition: background 0.3s; }
        .sp-hint { font-size: 11px; margin-top: 5px; text-align: right; min-height: 15px; transition: color 0.3s; }

        /* submit */
        .sp-btn {
          width: 100%; padding: 15px;
          background: #0a0a0a; border: none; border-radius: 8px;
          font-size: 15px; font-weight: 700; color: #fff;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 9px;
          transition: background 0.15s, transform 0.1s;
          margin-top: 8px; font-family: inherit;
          position: relative; overflow: hidden;
        }
        .sp-btn::after {
          content: ""; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.65s ease;
        }
        .sp-btn:hover::after { left: 160%; }
        .sp-btn:hover:not(:disabled) { background: #1c1c1c; transform: translateY(-1px); }
        .sp-btn:active:not(:disabled) { transform: translateY(0); }
        .sp-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg) } }
        .sp-spin {
          width: 15px; height: 15px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }

        .sp-div { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .sp-div-line { flex: 1; height: 1px; background: #eee; }
        .sp-div-text { font-size: 11px; color: #ccc; }

        .sp-switch { text-align: center; font-size: 13px; color: #999; }
        .sp-slink {
          margin-left: 5px; color: #0a0a0a; font-weight: 700;
          cursor: pointer; text-decoration: underline;
          text-underline-offset: 2px; transition: color 0.15s;
        }
        .sp-slink:hover { color: #444; }

        @keyframes up {
          from { opacity:0; transform: translateY(16px); }
          to   { opacity:1; transform: translateY(0); }
        }

        @media (max-width: 860px) {
          .sp { flex-direction: column; }
          .sp-left, .sp-right { width: 100%; min-height: auto; }
          .sp-left { padding: 36px 28px; }
          .sp-right { padding: 44px 28px; }
          .sp-title { font-size: 52px; }
          .sp-stats { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="sp">
        <div className="sp-grid" />

        {/* ══ LEFT ══ */}
        <div className="sp-left">
          <div className="sp-blob" />

          {/* brand */}
          <div className="sp-brand">
            <div className="sp-brand-box">CX</div>
            <span className="sp-brand-name">Codex</span>
          </div>

          {/* hero */}
          <div className="sp-hero">

            <div className="sp-live">
              <div className="sp-live-dot" />
              <span className="sp-live-text" key={feedIdx}>{FEED[feedIdx]}</span>
            </div>

            <h1 className="sp-title">
              Code.<br />
              Compete.<br />
              <span className="dim">Dominate.</span>
            </h1>

            <p className="sp-sub">
              Multiplayer coding battles against real developers worldwide.
              Climb the ranks, build streaks, and prove your skill.
            </p>

            {/* stats */}
            <div className="sp-stats">
              {[
                { num: "12k+", lbl: "Developers" },
                { num: "340ms", lbl: "Queue time" },
                { num: "16", lbl: "Languages" },
                { num: "ELO", lbl: "Ranked system" },
              ].map(({ num, lbl }) => (
                <div className="sp-stat" key={lbl}>
                  <span className="sp-stat-num">{num}</span>
                  <span className="sp-stat-lbl">{lbl}</span>
                </div>
              ))}
            </div>

            {/* terminal */}
            <div className="sp-terminal">
              <div className="sp-term-bar">
                <div className="sp-term-dots">
                  <div className="sp-term-dot" style={{ background: "#ff5f57" }} />
                  <div className="sp-term-dot" style={{ background: "#febc2e" }} />
                  <div className="sp-term-dot" style={{ background: "#28c840" }} />
                </div>
                <span className="sp-term-file">ranked_match.py</span>
              </div>
              <div className="sp-term-body">
                <div className="sp-tl">&gt; finding opponent...</div>
                <div className="sp-tl">&gt; opponent found</div>
                <div className="sp-tl">&gt; difficulty: medium · launching arena</div>
                <div className="sp-tl">&gt; loading problem set</div>
                <div className="sp-tl">&gt; battle starts in 3s_</div>
              </div>
            </div>

          </div>

          <div className="sp-footer">© 2026 Codex · Built for competitors</div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="sp-right">
          <div className="sp-form">

            <p className="sp-eyebrow">01 / Register</p>
            <h2 className="sp-form-title">Create your account</h2>
            <p className="sp-form-sub">Start at 1200 ELO. Climb from there.</p>

            {error && <div className="sp-gerr">{error}</div>}

            {/* USERNAME */}
            <div className={`sp-field${fieldErrors.username ? " sp-bad" : ""}`}>
              <label className="sp-label">Username</label>
              <div className="sp-iw">
                <input
                  className={`sp-in${fieldValid.username ? " ok" : ""}${fieldErrors.username ? " bad" : ""}`}
                  placeholder="e.g. leetmaster99"
                  value={username}
                  autoComplete="off"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (touched.username) validate("username", { username: e.target.value });
                  }}
                  onBlur={() => handleBlur("username")}
                />
                {fieldValid.username && <span className="sp-check">✓</span>}
              </div>
              {fieldErrors.username && <p className="sp-ferr">{fieldErrors.username}</p>}
            </div>

            {/* EMAIL */}
            <div className={`sp-field${fieldErrors.email ? " sp-bad" : ""}`}>
              <label className="sp-label">Email address</label>
              <div className="sp-iw">
                <input
                  className={`sp-in${fieldValid.email ? " ok" : ""}${fieldErrors.email ? " bad" : ""}`}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validate("email", { email: e.target.value });
                  }}
                  onBlur={() => handleBlur("email")}
                />
                {fieldValid.email && <span className="sp-check">✓</span>}
              </div>
              {fieldErrors.email && <p className="sp-ferr">{fieldErrors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div className={`sp-field${fieldErrors.password ? " sp-bad" : ""}`}>
              <label className="sp-label">Password</label>
              <div className="sp-iw">
                <input
                  className={`sp-in pr${fieldValid.password ? " ok" : ""}${fieldErrors.password ? " bad" : ""}`}
                  type={showPass ? "text" : "password"}
                  placeholder="min. 6 characters"
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validate("password", { password: e.target.value });
                    if (touched.confirm && confirm) validate("confirm", { password: e.target.value, confirm });
                  }}
                  onBlur={() => handleBlur("password")}
                  style={{ paddingRight: 56 }}
                />
                <span className="sp-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "hide" : "show"}
                </span>
              </div>
              <div className="sp-bars">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="sp-bar" style={{
                    background: password.length > 0 && i <= strength ? S_COLOR[strength] : "#e8e8e5"
                  }} />
                ))}
              </div>
              <p className="sp-hint" style={{ color: password.length > 0 ? S_COLOR[strength] : "#ccc" }}>
                {password.length > 0 ? S_LABEL[strength] : ""}
              </p>
              {fieldErrors.password && <p className="sp-ferr">{fieldErrors.password}</p>}
            </div>

            {/* CONFIRM */}
            <div className={`sp-field${fieldErrors.confirm ? " sp-bad" : ""}`}>
              <label className="sp-label">Confirm password</label>
              <div className="sp-iw">
                <input
                  className={`sp-in${fieldValid.confirm ? " ok" : ""}${fieldErrors.confirm ? " bad" : ""}`}
                  type={showConfirm ? "text" : "password"}
                  placeholder="repeat password"
                  value={confirm}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (touched.confirm) validate("confirm", { confirm: e.target.value });
                  }}
                  onBlur={() => { setTouched((t) => ({ ...t, confirm: true })); validate("confirm"); }}
                  style={{ paddingRight: 56 }}
                />
                <span className="sp-eye" onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "hide" : "show"}
                </span>
                {fieldValid.confirm && <span className="sp-check" style={{ right: 48 }}>✓</span>}
              </div>
              {fieldErrors.confirm && <p className="sp-ferr">{fieldErrors.confirm}</p>}
            </div>

            {/* SUBMIT */}
            <button className="sp-btn" onClick={handleSignup} disabled={loading}>
              {loading && <span className="sp-spin" />}
              <span>{loading ? "Creating account..." : "Enter the arena"}</span>
              {!loading && <span>→</span>}
            </button>

            <div className="sp-div">
              <div className="sp-div-line" />
              <span className="sp-div-text">or</span>
              <div className="sp-div-line" />
            </div>

            <p className="sp-switch">
              Already competing?
              <span className="sp-slink" onClick={() => navigate("/login")}>Sign in</span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}
