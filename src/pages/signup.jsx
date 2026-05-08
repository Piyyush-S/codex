import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/* ── password strength helper ── */
function getStrength(p) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 3);
}

const strengthColors = ["#bbb", "#888", "#444", "#0a0a0a"];

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

  /* per-field validation state */
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldValid, setFieldValid] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const strength = getStrength(password);

  /* ── blur validation ── */
  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    validate(field);
  };

  const validate = (field) => {
    const errors = { ...fieldErrors };
    const valid = { ...fieldValid };

    if (field === "username") {
      if (!username.trim()) {
        errors.username = "Username is required";
        valid.username = false;
      } else {
        delete errors.username;
        valid.username = true;
      }
    }

    if (field === "email") {
      if (!emailRegex.test(email)) {
        errors.email = "Enter a valid email";
        valid.email = false;
      } else {
        delete errors.email;
        valid.email = true;
      }
    }

    if (field === "password") {
      if (password.length < 6) {
        errors.password = "Password must be at least 6 characters";
        valid.password = false;
      } else {
        delete errors.password;
        valid.password = true;
      }
    }

    if (field === "confirm") {
      if (confirm !== password) {
        errors.confirm = "Passwords do not match";
        valid.confirm = false;
      } else {
        delete errors.confirm;
        valid.confirm = true;
      }
    }

    setFieldErrors(errors);
    setFieldValid(valid);
  };

  /* live confirm check */
  const handleConfirmChange = (val) => {
    setConfirm(val);
    if (touched.confirm) {
      const errors = { ...fieldErrors };
      const valid = { ...fieldValid };
      if (val !== password) {
        errors.confirm = "Passwords do not match";
        valid.confirm = false;
      } else {
        delete errors.confirm;
        valid.confirm = true;
      }
      setFieldErrors(errors);
      setFieldValid(valid);
    }
  };

  /* ── submit ── */
  const handleSignup = async () => {
    setError("");

    /* validate all fields */
    const allFields = ["username", "email", "password", "confirm"];
    let hasError = false;
    const errors = {};
    const valid = {};

    if (!username.trim()) { errors.username = "Username is required"; valid.username = false; hasError = true; }
    else valid.username = true;

    if (!emailRegex.test(email)) { errors.email = "Enter a valid email"; valid.email = false; hasError = true; }
    else valid.email = true;

    if (password.length < 6) { errors.password = "Password must be at least 6 characters"; valid.password = false; hasError = true; }
    else valid.password = true;

    if (password !== confirm) { errors.confirm = "Passwords do not match"; valid.confirm = false; hasError = true; }
    else valid.confirm = true;

    setFieldErrors(errors);
    setFieldValid(valid);
    setTouched({ username: true, email: true, password: true, confirm: true });

    if (hasError) return;

    try {
      setLoading(true);

      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCred.user, { displayName: username });

      await setDoc(doc(db, "users", userCred.user.uid), {
        username,
        email,
        rating: 1200,
        wins: 0,
        losses: 0,
        streak: 0,
        rank: 999,
        createdAt: Date.now(),
      });

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      if (err.code === "auth/email-already-in-use") setError("Email already in use");
      else if (err.code === "auth/invalid-email") setError("Invalid email");
      else if (err.code === "auth/weak-password") setError("Weak password");
      else setError("Signup failed. Try again");
    } finally {
      setLoading(false);
    }
  };

  /* ── input style helper ── */
  const inputStyle = (field) => ({
    ...s.input,
    borderColor: fieldErrors[field]
      ? "#c00"
      : fieldValid[field]
        ? "#0a0a0a"
        : "#e0e0e0",
    background: fieldErrors[field] ? "#fff8f8" : "#f9f9f9",
    paddingRight: fieldValid[field] ? "36px" : "14px",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: #c0c0c0; }
        input:focus { outline: none; }
        .cx-input:focus {
          border-color: #0a0a0a !important;
          background: #fff !important;
        }
        .cx-label-active { color: #0a0a0a !important; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.2 } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={s.page}>

        {/* ── LEFT ── */}
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
              Code.<br />Compete.<br />Dominate.
            </h1>

            <p style={s.heroSub}>
              Real-time coding battles against developers worldwide.
              Climb the ranks, build your streak, prove your craft.
            </p>

            <div style={s.statsGrid}>
              {[
                { num: "12k+", lbl: "Developers" },
                { num: "340ms", lbl: "Avg match start" },
                { num: "8", lbl: "Languages" },
                { num: "ELO", lbl: "Rank system" },
              ].map(({ num, lbl }) => (
                <div key={lbl} style={s.statCell}>
                  <span style={s.statNum}>{num}</span>
                  <span style={s.statLbl}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s.leftFooter}>© 2026 Codex · Built for competitors</div>
        </div>

        {/* ── RIGHT ── */}
        <div style={s.right}>
          <div style={s.form}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <p style={s.stepLabel}>01 / REGISTER</p>
              <h2 style={s.formTitle}>Create your account</h2>
              <p style={s.formSub}>Start at 1200 ELO. Climb from there.</p>
            </div>

            {/* Global error */}
            {error && <div style={s.globalError}>{error}</div>}

            {/* USERNAME */}
            <Field label="Username" error={fieldErrors.username} valid={fieldValid.username}>
              <div style={{ position: "relative" }}>
                <input
                  className="cx-input"
                  style={inputStyle("username")}
                  placeholder="e.g. leetmaster99"
                  value={username}
                  autoComplete="off"
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => handleBlur("username")}
                />
                {fieldValid.username && <CheckIcon />}
              </div>
            </Field>

            {/* EMAIL */}
            <Field label="Email address" error={fieldErrors.email} valid={fieldValid.email}>
              <div style={{ position: "relative" }}>
                <input
                  className="cx-input"
                  style={inputStyle("email")}
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                />
                {fieldValid.email && <CheckIcon />}
              </div>
            </Field>

            {/* PASSWORD */}
            <Field label="Password" error={fieldErrors.password}>
              <div style={{ position: "relative" }}>
                <input
                  className="cx-input"
                  style={{ ...inputStyle("password"), paddingRight: 50 }}
                  placeholder="min. 6 characters"
                  type={showPass ? "text" : "password"}
                  value={password}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) validate("password");
                  }}
                  onBlur={() => handleBlur("password")}
                />
                <span style={s.eyeToggle} onClick={() => setShowPass(!showPass)}>
                  {showPass ? "hide" : "show"}
                </span>
              </div>
              {/* Strength bars */}
              <div style={s.strengthRow}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      ...s.strengthBar,
                      background: password.length > 0 && i <= strength
                        ? strengthColors[strength]
                        : "#eee",
                    }}
                  />
                ))}
              </div>
            </Field>

            {/* CONFIRM */}
            <Field label="Confirm password" error={fieldErrors.confirm} valid={fieldValid.confirm}>
              <div style={{ position: "relative" }}>
                <input
                  className="cx-input"
                  style={{ ...inputStyle("confirm"), paddingRight: 50 }}
                  placeholder="repeat password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  autoComplete="new-password"
                  onChange={(e) => handleConfirmChange(e.target.value)}
                  onBlur={() => { setTouched((t) => ({ ...t, confirm: true })); validate("confirm"); }}
                />
                <span style={s.eyeToggle} onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? "hide" : "show"}
                </span>
                {fieldValid.confirm && <CheckIcon />}
              </div>
            </Field>

            {/* SUBMIT */}
            <button
              onClick={handleSignup}
              disabled={loading}
              style={{ ...s.submitBtn, opacity: loading ? 0.5 : 1 }}
            >
              {loading && (
                <span style={s.spinner} />
              )}
              <span>{loading ? "Creating account..." : "Enter the arena"}</span>
              {!loading && <span style={{ fontSize: 16 }}>→</span>}
            </button>

            {/* Divider */}
            <div style={s.divider}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>or</span>
              <div style={s.dividerLine} />
            </div>

            {/* Login link */}
            <p style={s.loginRow}>
              Already competing?
              <span style={s.loginLink} onClick={() => navigate("/login")}>
                Sign in
              </span>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ── */

function Field({ label, error, valid, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ ...s.fieldLabel, color: error ? "#c00" : "#aaa" }}>
        {label}
      </label>
      {children}
      {error && <p style={s.errorMsg}>{error}</p>}
    </div>
  );
}

function CheckIcon() {
  return (
    <span style={s.checkIcon}>✓</span>
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
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    background: "linear-gradient(to bottom,transparent,#fff,transparent)",
  },
  brand: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 32,
    height: 32,
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    color: "#fff",
    fontWeight: 700,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: -0.5,
  },
  hero: {
    position: "relative",
    zIndex: 2,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "40px 0 24px",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    border: "1px solid #2a2a2a",
    background: "rgba(255,255,255,0.04)",
    padding: "5px 12px",
    borderRadius: 4,
    marginBottom: 24,
    width: "fit-content",
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#fff",
    animation: "pulse 2s infinite",
  },
  tagText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#888",
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: 800,
    lineHeight: 1.05,
    color: "#fff",
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 14,
    color: "#555",
    lineHeight: 1.8,
    marginBottom: 36,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 1,
    background: "#1e1e1e",
    border: "1px solid #1e1e1e",
    borderRadius: 8,
    overflow: "hidden",
  },
  statCell: {
    background: "#111",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  statNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
  },
  statLbl: {
    fontSize: 11,
    color: "#444",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  leftFooter: {
    position: "relative",
    zIndex: 2,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#2a2a2a",
  },

  /* RIGHT */
  right: {
    width: "48%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 40px",
  },
  form: {
    width: "100%",
    maxWidth: 360,
  },
  stepLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 8,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0a0a0a",
    letterSpacing: -0.8,
    lineHeight: 1.1,
  },
  formSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 6,
    lineHeight: 1.6,
  },

  /* Fields */
  fieldLabel: {
    display: "block",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
    transition: "color 0.2s",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: 6,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    color: "#0a0a0a",
    transition: "border-color 0.2s, background 0.2s",
  },
  eyeToggle: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#bbb",
    cursor: "pointer",
    userSelect: "none",
    letterSpacing: 0.5,
  },
  checkIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    color: "#0a0a0a",
    pointerEvents: "none",
  },
  strengthRow: {
    display: "flex",
    gap: 3,
    height: 2,
    marginTop: 6,
  },
  strengthBar: {
    flex: 1,
    borderRadius: 2,
    background: "#eee",
    transition: "background 0.3s",
  },
  errorMsg: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#c00",
    marginTop: 5,
    letterSpacing: 0.3,
  },
  globalError: {
    background: "#fff0f0",
    border: "1px solid #fcc",
    borderRadius: 6,
    padding: "10px 14px",
    marginBottom: 16,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "#c00",
    lineHeight: 1.5,
  },

  /* Button */
  submitBtn: {
    width: "100%",
    padding: 14,
    marginTop: 8,
    background: "#0a0a0a",
    border: "none",
    borderRadius: 6,
    fontFamily: "'Syne', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "background 0.2s",
  },
  spinner: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },

  /* Footer */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: "#eee",
  },
  dividerText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#ccc",
  },
  loginRow: {
    textAlign: "center",
    fontSize: 13,
    color: "#aaa",
  },
  loginLink: {
    marginLeft: 4,
    color: "#0a0a0a",
    fontWeight: 700,
    cursor: "pointer",
    textDecoration: "underline",
  },
};
