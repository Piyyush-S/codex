import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValid, setFieldValid] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (field, val) => {
    const errors = { ...fieldErrors };
    const valid = { ...fieldValid };

    if (field === "email") {
      if (!emailRegex.test(val)) {
        errors.email = "Enter a valid email";
        valid.email = false;
      } else {
        delete errors.email;
        valid.email = true;
      }
    }

    if (field === "password") {
      if (!val) {
        errors.password = "Password is required";
        valid.password = false;
      } else {
        delete errors.password;
        valid.password = true;
      }
    }

    setFieldErrors(errors);
    setFieldValid(valid);
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validateField(field, field === "email" ? email : password);
  };

  const handleLogin = async () => {
    setError("");
    setResetSent(false);

    const errors = {};
    const valid = {};
    let hasError = false;

    if (!emailRegex.test(email)) { errors.email = "Enter a valid email"; valid.email = false; hasError = true; }
    else valid.email = true;

    if (!password) { errors.password = "Password is required"; valid.password = false; hasError = true; }
    else valid.password = true;

    setFieldErrors(errors);
    setFieldValid(valid);
    setTouched({ email: true, password: true });

    if (hasError) return;

    try {
      setLoading(true);
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      if (userCred.user) navigate("/dashboard");
    } catch (err) {
      if (err.code === "auth/user-not-found") setError("No account found with this email");
      else if (err.code === "auth/wrong-password") setError("Incorrect password");
      else if (err.code === "auth/invalid-credential") setError("Invalid email or password");
      else setError("Login failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    setResetSent(false);

    if (!email) {
      setFieldErrors((e) => ({ ...e, email: "Enter your email first" }));
      setFieldValid((v) => ({ ...v, email: false }));
      setTouched((t) => ({ ...t, email: true }));
      return;
    }

    if (!emailRegex.test(email)) {
      setFieldErrors((e) => ({ ...e, email: "Enter a valid email" }));
      setFieldValid((v) => ({ ...v, email: false }));
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError("Failed to send reset email");
    }
  };

  const inputStyle = (field) => ({
    ...s.input,
    borderColor: fieldErrors[field] ? "#c00" : fieldValid[field] ? "#0a0a0a" : "#e0e0e0",
    background: fieldErrors[field] ? "#fff8f8" : "#f9f9f9",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #c0c0c0; font-family: 'JetBrains Mono', monospace; }
        input:focus { outline: none; border-color: #0a0a0a !important; background: #fff !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .cx-forgot:hover { color: #0a0a0a !important; }
        .cx-submit:hover:not(:disabled) { background: #222 !important; }
      `}</style>

      <div style={s.page}>

        {/* ── LEFT — black ── */}
        <div style={s.left}>
          <div style={s.gridBg} />
          <div style={s.accentLine} />

          {/* Brand */}
          <div style={s.brand}>
            <div style={s.brandMark}>CX</div>
            <span style={s.brandName}>Codex</span>
          </div>

          {/* Hero */}
          <div style={s.hero}>
            <div style={s.tag}>
              <div style={s.tagDot} />
              <span style={s.tagText}>LIVE — 847 active matches</span>
            </div>

            <h1 style={s.heroTitle}>
              Welcome<br />back,<br />competitor.
            </h1>

            <p style={s.heroSub}>
              Your rank is waiting. Jump back into the arena and keep your streak alive.
            </p>

            {/* Recent activity */}
            <div style={s.activityCard}>
              <p style={s.activityTitle}>// recent arena activity</p>
              {[
                { user: "void_ptr", action: "defeated", opp: "rx_overflow", lang: "C++" },
                { user: "null_byte", action: "solved", opp: "Hard #2847", lang: "Python" },
                { user: "segfault", action: "ranked up", opp: "→ Diamond", lang: "Rust" },
              ].map((item, i) => (
                <div key={i} style={s.activityRow}>
                  <span style={s.activityUser}>{item.user}</span>
                  <span style={s.activityAction}> {item.action} </span>
                  <span style={s.activityOpp}>{item.opp}</span>
                  <span style={s.activityLang}>[{item.lang}]</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.leftFooter}>© 2026 Codex · Built for competitors</div>
        </div>

        {/* ── RIGHT — white ── */}
        <div style={s.right}>
          <div style={s.form}>

            <div style={{ marginBottom: 36 }}>
              <p style={s.stepLabel}>02 / LOGIN</p>
              <h2 style={s.formTitle}>Sign in</h2>
              <p style={s.formSub}>Pick up where you left off.</p>
            </div>

            {/* Global error */}
            {error && (
              <div style={s.globalError}>{error}</div>
            )}

            {/* Reset sent */}
            {resetSent && (
              <div style={s.successBox}>
                Reset email sent — check your inbox.
              </div>
            )}

            {/* EMAIL */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ ...s.fieldLabel, color: fieldErrors.email ? "#c00" : "#aaa" }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={inputStyle("email")}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched.email) validateField("email", e.target.value);
                  }}
                  onBlur={() => handleBlur("email")}
                />
                {fieldValid.email && <span style={s.checkIcon}>✓</span>}
              </div>
              {fieldErrors.email && <p style={s.errorMsg}>{fieldErrors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div style={{ marginBottom: 6 }}>
              <label style={{ ...s.fieldLabel, color: fieldErrors.password ? "#c00" : "#aaa" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle("password"), paddingRight: 50 }}
                  type={showPass ? "text" : "password"}
                  placeholder="your password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => handleBlur("password")}
                />
                <span style={s.eyeToggle} onClick={() => setShowPass(!showPass)}>
                  {showPass ? "hide" : "show"}
                </span>
              </div>
              {fieldErrors.password && <p style={s.errorMsg}>{fieldErrors.password}</p>}
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <span
                className="cx-forgot"
                style={s.forgotLink}
                onClick={handleForgot}
              >
                Forgot password?
              </span>
            </div>

            {/* SUBMIT */}
            <button
              className="cx-submit"
              onClick={handleLogin}
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading && <span style={s.spinner} />}
              <span>{loading ? "Entering..." : "Enter the arena"}</span>
              {!loading && <span style={{ fontSize: 16 }}>→</span>}
            </button>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine} />
            </div>

            {/* Signup link */}
            <p style={s.switchRow}>
              New here?
              <span style={s.switchLink} onClick={() => navigate("/signup")}>
                Create account
              </span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Styles ── */
const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Syne', system-ui, sans-serif",
    background: "#fff",
  },

  /* LEFT */
  left: {
    width: "52%",
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "#0a0a0a",
    position: "relative",
    borderRight: "1px solid #1a1a1a",
  },
  gridBg: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)",
    backgroundSize: "36px 36px",
  },
  accentLine: {
    position: "absolute",
    left: 0, top: 0, bottom: 0,
    width: 3,
    background: "linear-gradient(to bottom,transparent,#fff,transparent)",
  },
  brand: {
    position: "relative", zIndex: 2,
    display: "flex", alignItems: "center", gap: 10,
  },
  brandMark: {
    width: 32, height: 32,
    border: "2px solid #fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: "#fff", fontWeight: 700,
  },
  brandName: {
    fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5,
  },
  hero: {
    position: "relative", zIndex: 2, flex: 1,
    display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "40px 0 24px",
  },
  tag: {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "1px solid #2a2a2a", background: "rgba(255,255,255,0.04)",
    padding: "5px 12px", borderRadius: 4, marginBottom: 24, width: "fit-content",
  },
  tagDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "#fff", animation: "pulse 2s infinite",
  },
  tagText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "#888", letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 44, fontWeight: 800, lineHeight: 1.05,
    color: "#fff", letterSpacing: -1.5, marginBottom: 16,
  },
  heroSub: {
    fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 32,
  },
  activityCard: {
    background: "#111",
    border: "1px solid #1e1e1e",
    borderRadius: 8,
    padding: "16px 20px",
  },
  activityTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "#333", letterSpacing: 0.5,
    marginBottom: 12, textTransform: "uppercase",
  },
  activityRow: {
    display: "flex", alignItems: "center", gap: 4,
    padding: "7px 0", borderBottom: "1px solid #1a1a1a",
    fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
  },
  activityUser: { color: "#fff", fontWeight: 700 },
  activityAction: { color: "#444" },
  activityOpp: { color: "#666", flex: 1 },
  activityLang: { color: "#2a2a2a", fontSize: 10 },
  leftFooter: {
    position: "relative", zIndex: 2,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "#2a2a2a",
  },

  /* RIGHT */
  right: {
    width: "48%", background: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "48px 40px",
  },
  form: { width: "100%", maxWidth: 360 },
  stepLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "#999", letterSpacing: 1, marginBottom: 8,
  },
  formTitle: {
    fontSize: 28, fontWeight: 800, color: "#0a0a0a",
    letterSpacing: -0.8, lineHeight: 1.1,
  },
  formSub: { fontSize: 13, color: "#888", marginTop: 6, lineHeight: 1.6 },

  fieldLabel: {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
    marginBottom: 6, transition: "color 0.2s",
  },
  input: {
    width: "100%", padding: "12px 14px",
    background: "#f9f9f9", border: "1px solid #e0e0e0",
    borderRadius: 6,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13, color: "#0a0a0a",
    transition: "border-color 0.2s, background 0.2s",
  },
  eyeToggle: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "#bbb", cursor: "pointer",
    userSelect: "none", letterSpacing: 0.5,
  },
  checkIcon: {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    fontSize: 14, color: "#0a0a0a", pointerEvents: "none",
  },
  errorMsg: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "#c00", marginTop: 5, letterSpacing: 0.3,
  },
  forgotLink: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10, color: "#bbb", cursor: "pointer",
    letterSpacing: 0.5, transition: "color 0.2s",
  },
  globalError: {
    background: "#fff0f0", border: "1px solid #fcc",
    borderRadius: 6, padding: "10px 14px", marginBottom: 16,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "#c00", lineHeight: 1.5,
  },
  successBox: {
    background: "#f0faf5", border: "1px solid #9fe1cb",
    borderRadius: 6, padding: "10px 14px", marginBottom: 16,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: "#0f6e56", lineHeight: 1.5,
  },
  submitBtn: {
    width: "100%", padding: 14, marginTop: 0,
    background: "#0a0a0a", border: "none", borderRadius: 6,
    fontFamily: "'Syne', sans-serif",
    fontSize: 14, fontWeight: 700, color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "background 0.2s",
  },
  spinner: {
    display: "inline-block", width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#fff", borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  divider: {
    display: "flex", alignItems: "center", gap: 10, margin: "20px 0",
  },
  dividerLine: { flex: 1, height: 1, background: "#eee" },
  dividerText: {
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#ccc",
  },
  switchRow: { textAlign: "center", fontSize: 13, color: "#aaa" },
  switchLink: {
    marginLeft: 4, color: "#0a0a0a", fontWeight: 700,
    cursor: "pointer", textDecoration: "underline",
  },
};
