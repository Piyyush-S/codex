import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */

const LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "C++", "C", "C#",
  "Java", "Go", "Rust", "Kotlin", "Swift", "Ruby",
  "PHP", "Scala", "Haskell", "Dart", "Lua", "R",
];

const MATCH_TYPES = [
  { id: "blitz",    label: "Blitz",       desc: "5 min · 1 problem",      tag: "FAST" },
  { id: "ranked",   label: "Ranked",      desc: "20 min · 2 problems",    tag: "ELO"  },
  { id: "marathon", label: "Marathon",    desc: "60 min · 5 problems",    tag: "HARD" },
  { id: "team",     label: "Team 2v2",    desc: "30 min · collaborative", tag: "TEAM" },
  { id: "practice", label: "Practice",   desc: "No timer · unranked",    tag: "FREE" },
  { id: "custom",   label: "Custom Room", desc: "Set your own rules",     tag: "ROOM" },
];

const NAV_ROUTES = [
  { label: "Dashboard",   path: "/dashboard" },
  { label: "Matches",     path: "/matches"   },
  { label: "Problems",    path: "/problems"  },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Rooms",       path: "/rooms"     },
];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getRankLabel(rating) {
  if (!rating)        return "Unranked";
  if (rating >= 2000) return "Grandmaster";
  if (rating >= 1800) return "Master";
  if (rating >= 1600) return "Diamond";
  if (rating >= 1400) return "Platinum";
  if (rating >= 1200) return "Gold";
  return "Silver";
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */

export default function Dashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [user,         setUser]         = useState(null);
  const [stats,        setStats]        = useState(null);
  const [recent,       setRecent]       = useState([]);
  const [username,     setUsername]     = useState("");
  const [showModal,    setShowModal]    = useState(false);
  const [selectedLang, setSelectedLang] = useState("Python");
  const [selectedType, setSelectedType] = useState("ranked");
  const [roomCode,     setRoomCode]     = useState("");
  const [matchStep,    setMatchStep]    = useState("select"); // select | searching | found
  const [showProfile,  setShowProfile]  = useState(false);

  /* ── AUTH ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate("/login"); return; }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid));
      if (snap.exists()) {
        setStats(snap.data());
        setUsername(snap.data().username || u.displayName || u.email?.split("@")[0]);
      }
      try {
        const q = query(
          collection(db, "matches"),
          where("players", "array-contains", u.uid),
          orderBy("createdAt", "desc"),
          limit(8)
        );
        const ms = await getDocs(q);
        setRecent(ms.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { setRecent([]); }
    });
    return () => unsub();
  }, []);

  /* ── MATCH FLOW ── */
  const openModal = (type = "ranked") => {
    setSelectedType(type);
    setMatchStep("select");
    setRoomCode("");
    setShowModal(true);
  };

  const handleFindMatch = () => {
    setMatchStep("searching");
    setTimeout(() => {
      setMatchStep("found");
      setTimeout(() => {
        setShowModal(false);
        setMatchStep("select");
        navigate(`/room/${generateRoomCode()}`);
      }, 1000);
    }, 2500);
  };

  const handleJoinRoom = () => {
    const code = roomCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 6) return;
    navigate(`/room/${code}`);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ── DERIVED ── */
  const winRate = stats
    ? Math.round((stats.wins / ((stats.wins + stats.losses) || 1)) * 100)
    : 0;

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F5F3; font-family: 'Inter', system-ui, sans-serif; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #DDD; border-radius: 4px; }

        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp{ from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn{ from{transform:translateX(100%)} to{transform:translateX(0)} }

        /* ── NAV ── */
        .cx-nav-link {
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          color: #888; padding: 6px 11px; border-radius: 7px;
          cursor: pointer; border: none; background: none;
          transition: color 0.15s, background 0.15s; white-space: nowrap;
        }
        .cx-nav-link:hover  { color: #111; background: #F0F0EE; }
        .cx-nav-link.active { color: #111; background: #EBEBEA; font-weight: 600; }

        /* ── HOVER EFFECTS ── */
        .cx-quick-card {
          background: #fff; border: 1px solid #EAEAE8; border-radius: 14px;
          padding: 18px 20px; cursor: pointer; flex: 1; min-width: 0;
          transition: border-color 0.15s, transform 0.15s;
        }
        .cx-quick-card:hover { border-color: #111; transform: translateY(-2px); }

        .cx-match-type {
          cursor: pointer; padding: 15px; border-radius: 11px;
          border: 1px solid #E8E8E8; background: #fff; transition: border-color 0.15s;
        }
        .cx-match-type:hover  { border-color: #888; }
        .cx-match-type.sel    { border: 2px solid #111; background: #FAFAFA; }

        .cx-lang-chip {
          cursor: pointer; padding: 6px 12px; border-radius: 7px;
          font-family: 'JetBrains Mono', monospace; font-size: 12px;
          border: 1px solid #E0E0DC; background: #FAFAFA; color: #666;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
        }
        .cx-lang-chip:hover  { border-color: #111; color: #111; }
        .cx-lang-chip.sel    { background: #111; color: #fff; border-color: #111; }

        .cx-btn {
          font-family: 'Inter', sans-serif; font-weight: 600; cursor: pointer;
          border: none; display: inline-flex; align-items: center; gap: 7px;
          transition: opacity 0.15s, transform 0.15s; border-radius: 9px;
        }
        .cx-btn:hover:not(:disabled)  { opacity: 0.85; transform: translateY(-1px); }
        .cx-btn:active:not(:disabled) { transform: translateY(0); }
        .cx-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .cx-btn-solid   { background: #111; color: #fff; padding: 10px 20px; font-size: 14px; border: none; }
        .cx-btn-outline { background: #fff; color: #111; padding: 10px 20px; font-size: 14px; border: 1px solid #DDDDD8; }
        .cx-btn-outline:hover:not(:disabled) { border-color: #111; opacity: 1; }
        .cx-btn-ghost   { background: transparent; color: #777; padding: 9px 14px; font-size: 13px; border: 1px solid #E8E8E6; }
        .cx-btn-ghost:hover:not(:disabled) { color: #111; border-color: #AAA; opacity: 1; }
        .cx-btn-danger  { background: transparent; color: #a32d2d; padding: 10px 14px; font-size: 13px; border: 1px solid #FCC; }
        .cx-btn-danger:hover:not(:disabled) { background: #FFF5F5; opacity: 1; }

        .cx-recent-row {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 0; border-bottom: 1px solid #F2F2F0;
        }
        .cx-recent-row:last-child { border-bottom: none; }

        .cx-quick-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 10px; border-radius: 9px; cursor: pointer;
          transition: background 0.12s;
        }
        .cx-quick-link:hover { background: #F5F5F3; }

        /* ── OVERLAY / MODAL / DRAWER ── */
        .cx-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.35);
          z-index: 300; display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.18s ease;
        }
        .cx-modal {
          background: #fff; border-radius: 18px; padding: 32px;
          width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
          position: relative; animation: slideUp 0.2s ease;
        }
        .cx-drawer {
          position: fixed; right: 0; top: 0; bottom: 0; width: 296px;
          background: #fff; border-left: 1px solid #EAEAE8; z-index: 300;
          padding: 26px 22px; display: flex; flex-direction: column; gap: 20px;
          animation: slideIn 0.2s ease;
        }

        input[type="text"]:focus { outline: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F5F5F3" }}>

        {/* ══════════ NAVBAR ══════════ */}
        <nav style={{
          height: 56, background: "#fff", borderBottom: "1px solid #EAEAE8",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", position: "sticky", top: 0, zIndex: 100,
        }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 12, cursor: "pointer" }}
              onClick={() => navigate("/dashboard")}
            >
              <div style={{
                width: 28, height: 28, border: "1.5px solid #111", borderRadius: 7,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "#111",
                flexShrink: 0,
              }}>CX</div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 15, color: "#111", letterSpacing: "-0.03em" }}>
                Codex
              </span>
            </div>

            <div style={{ width: 1, height: 18, background: "#E8E8E6", margin: "0 10px" }} />

            {NAV_ROUTES.map(({ label, path }) => (
              <button
                key={label}
                className={`cx-nav-link${location.pathname.startsWith(path) ? " active" : ""}`}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Live */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#111", animation: "pulse 2s infinite" }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#888" }}>847 live</span>
            </div>

            {/* New match shortcut */}
            <button className="cx-btn cx-btn-solid" style={{ fontSize: 13, padding: "7px 16px" }} onClick={() => openModal("ranked")}>
              + New Match
            </button>

            {/* User pill */}
            <div
              onClick={() => setShowProfile(v => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "5px 10px 5px 6px",
                border: "1px solid #E8E8E6", borderRadius: 9, cursor: "pointer",
                background: "#FAFAFA",
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "#111", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 800,
                flexShrink: 0,
              }}>
                {username?.[0]?.toUpperCase() || "?"}
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#111" }}>
                {username || user?.email?.split("@")[0] || "User"}
              </span>
              <span style={{ color: "#AAA", fontSize: 11 }}>▾</span>
            </div>
          </div>
        </nav>

        {/* ══════════ MAIN ══════════ */}
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "32px 32px" }}>

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28 }}>
            <div>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#AAA", letterSpacing: "0.08em", marginBottom: 5 }}>
                // DASHBOARD
              </p>
              <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 800, color: "#999", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Welcome back, <span style={{ color: "#111" }}>{username || "Competitor"}</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="cx-btn cx-btn-outline" onClick={() => navigate("/rooms/watch")}>
                Watch Live →
              </button>
              <button className="cx-btn cx-btn-solid" onClick={() => openModal("ranked")}>
                + New Match
              </button>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
            {[
              { label: "ELO Rating",  value: stats?.rating ?? "—",           sub: getRankLabel(stats?.rating) },
              { label: "Win Rate",    value: `${winRate}%`,                  sub: `${stats?.wins ?? 0}W / ${stats?.losses ?? 0}L` },
              { label: "Win Streak",  value: stats?.streak ?? "—",           sub: "current streak" },
              { label: "Global Rank", value: `#${stats?.rank ?? 999}`,       sub: "worldwide" },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: "#fff", border: "1px solid #EAEAE8", borderRadius: 14, padding: "20px 24px" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 32, fontWeight: 700, color: "#111", lineHeight: 1, marginBottom: 5 }}>
                  {value}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#999" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Quick action cards ── */}
          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            {[
              { label: "Blitz Match",  sub: "5 min",          type: "blitz",    svgPath: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
              { label: "Ranked",       sub: "ELO match",      type: "ranked",   svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
              { label: "Team 2v2",     sub: "collaborative",  type: "team",     svgPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
              { label: "Practice",     sub: "unranked",       type: "practice", svgPath: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" },
              { label: "Join Room",    sub: "enter code",     type: "custom",   svgPath: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" },
              { label: "Watch Live",   sub: "spectate",       type: null,       svgPath: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" },
            ].map(({ label, sub, type, svgPath }) => (
              <div
                key={label}
                className="cx-quick-card"
                onClick={() => type ? openModal(type) : navigate("/rooms/watch")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10, display: "block" }}>
                  <path d={svgPath} />
                </svg>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 3 }}>{label}</p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#AAA" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* ── Content grid ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 18, alignItems: "start" }}>

            {/* Recent matches */}
            <div style={{ background: "#fff", border: "1px solid #EAEAE8", borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Matches</p>
                <span
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#888", cursor: "pointer" }}
                  onClick={() => navigate("/matches")}
                >
                  View all →
                </span>
              </div>

              {recent.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", textAlign: "center" }}>
                  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#DDD" strokeWidth="1.5" style={{ marginBottom: 14 }}>
                    <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zM20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5zM3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14zM14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5zM15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5zM8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z"/>
                  </svg>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#AAA", marginBottom: 16 }}>No matches yet. Jump in!</p>
                  <button className="cx-btn cx-btn-solid" style={{ fontSize: 13, padding: "9px 20px" }} onClick={() => openModal("ranked")}>
                    Start your first match
                  </button>
                </div>
              ) : (
                recent.map((m, i) => (
                  <div className="cx-recent-row" key={m.id || i}>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
                      padding: "3px 8px", borderRadius: 5, flexShrink: 0,
                      background: m.winner === user?.uid ? "#F0FAF5" : "#FFF0F0",
                      color:      m.winner === user?.uid ? "#0F6E56" : "#A32D2D",
                    }}>
                      {m.winner === user?.uid ? "WIN" : "LOSS"}
                    </span>
                    <span style={{ flex: 1, fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#333", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.problem || "Unknown problem"}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#BBB", whiteSpace: "nowrap" }}>
                      {m.type || "ranked"}
                    </span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#BBB", whiteSpace: "nowrap" }}>
                      {m.language || "—"}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12,
                      color: (m.ratingChange?.[user?.uid] ?? 0) >= 0 ? "#0F6E56" : "#A32D2D",
                      minWidth: 38, textAlign: "right",
                    }}>
                      {(m.ratingChange?.[user?.uid] ?? 0) > 0 ? "+" : ""}
                      {m.ratingChange?.[user?.uid] ?? 0}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Rating history */}
              <div style={{ background: "#fff", border: "1px solid #EAEAE8", borderRadius: 14, padding: "22px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase" }}>Rating History</p>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#888", cursor: "pointer" }} onClick={() => navigate("/matches")}>
                    Full history →
                  </span>
                </div>
                <RatingChart rating={stats?.rating ?? 1200} wins={stats?.wins ?? 0} losses={stats?.losses ?? 0} />
              </div>

              {/* Preferred languages */}
              <div style={{ background: "#fff", border: "1px solid #EAEAE8", borderRadius: 14, padding: "20px 24px" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                  Preferred Languages
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {["Python", "C++", "JavaScript"].map(l => (
                    <span key={l} style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                      background: "#F5F5F3", color: "#555",
                      padding: "5px 11px", borderRadius: 7, border: "1px solid #E8E8E6",
                    }}>{l}</span>
                  ))}
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                      background: "transparent", color: "#AAA",
                      padding: "5px 11px", borderRadius: 7, border: "1px dashed #DDD",
                      cursor: "pointer",
                    }}
                    onClick={() => openModal("ranked")}
                  >
                    + add more
                  </span>
                </div>
              </div>

              {/* Quick links */}
              <div style={{ background: "#fff", border: "1px solid #EAEAE8", borderRadius: 14, padding: "20px 24px" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                  Quick Links
                </p>
                {[
                  { label: "Browse Problems",      onClick: () => navigate("/problems"),                    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
                  { label: "Leaderboard",          onClick: () => navigate("/leaderboard"),                 icon: "M18 20V10M12 20V4M6 20v-6" },
                  { label: "My Match History",     onClick: () => navigate("/matches"),                     icon: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
                  { label: "Create a Room",        onClick: () => navigate(`/room/${generateRoomCode()}`),  icon: "M12 5v14M5 12h14" },
                  { label: "Watch Live Matches",   onClick: () => navigate("/rooms/watch"),                 icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" },
                ].map(({ label, onClick, icon }) => (
                  <div key={label} className="cx-quick-link" onClick={onClick}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: "#444", flex: 1 }}>
                      {label}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* ══════════ MATCH MODAL ══════════ */}
        {showModal && (
          <div
            className="cx-overlay"
            onClick={(e) => { if (e.target === e.currentTarget && matchStep === "select") { setShowModal(false); } }}
          >
            <div className="cx-modal">

              {/* ── SELECT ── */}
              {matchStep === "select" && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
                    <div>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>New Match</p>
                      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: "-0.03em" }}>Configure your match</h2>
                    </div>
                    <button style={{ background: "none", border: "none", fontSize: 20, color: "#AAA", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }} onClick={() => setShowModal(false)}>✕</button>
                  </div>

                  {/* Match type grid */}
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Match Type</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 20 }}>
                    {MATCH_TYPES.map(mt => (
                      <div
                        key={mt.id}
                        className={`cx-match-type${selectedType === mt.id ? " sel" : ""}`}
                        onClick={() => setSelectedType(mt.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: "#111" }}>{mt.label}</span>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                            background: selectedType === mt.id ? "#111" : "#F0F0EE",
                            color:      selectedType === mt.id ? "#fff" : "#888",
                            padding: "2px 7px", borderRadius: 5, letterSpacing: "0.05em",
                          }}>{mt.tag}</span>
                        </div>
                        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#AAA" }}>{mt.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Room code (custom only) */}
                  {selectedType === "custom" && (
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Room Code</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Enter 6-char code..."
                          value={roomCode}
                          maxLength={6}
                          onChange={e => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                          style={{
                            flex: 1, padding: "11px 14px", background: "#F5F5F3",
                            border: "1px solid #E0E0DC", borderRadius: 9,
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 18,
                            fontWeight: 700, color: "#111", letterSpacing: "0.18em",
                          }}
                          onFocus={e => e.target.style.borderColor = "#111"}
                          onBlur={e => e.target.style.borderColor = "#E0E0DC"}
                        />
                        <button className="cx-btn cx-btn-solid" style={{ fontSize: 13 }} onClick={handleJoinRoom} disabled={roomCode.length !== 6}>
                          Join →
                        </button>
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#AAA", marginTop: 8 }}>
                        Or{" "}
                        <span
                          style={{ color: "#111", cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => navigate(`/room/${generateRoomCode()}`)}
                        >
                          create a new room
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Language */}
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Language</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
                    {LANGUAGES.map(l => (
                      <span
                        key={l}
                        className={`cx-lang-chip${selectedLang === l ? " sel" : ""}`}
                        onClick={() => setSelectedLang(l)}
                      >
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: "1px solid #F0F0EE" }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#888" }}>
                      {MATCH_TYPES.find(m => m.id === selectedType)?.label} · {selectedLang}
                    </span>
                    {selectedType !== "custom" && (
                      <button className="cx-btn cx-btn-solid" onClick={handleFindMatch}>
                        Find Match →
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* ── SEARCHING ── */}
              {matchStep === "searching" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", textAlign: "center" }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: "50%",
                    border: "3px solid #E0E0DC", borderTopColor: "#111",
                    animation: "spin 0.8s linear infinite", marginBottom: 24,
                  }} />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 6 }}>
                    Finding opponent...
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#AAA" }}>
                    {MATCH_TYPES.find(m => m.id === selectedType)?.label} · {selectedLang}
                  </p>
                  <button className="cx-btn cx-btn-ghost" style={{ marginTop: 24 }} onClick={() => setMatchStep("select")}>
                    Cancel
                  </button>
                </div>
              )}

              {/* ── FOUND ── */}
              {matchStep === "found" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 0", textAlign: "center" }}>
                  <div style={{
                    width: 58, height: 58, borderRadius: "50%",
                    background: "#111", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 26, marginBottom: 20,
                  }}>✓</div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 6 }}>
                    Opponent found!
                  </p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#AAA" }}>
                    Entering room...
                  </p>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ══════════ PROFILE DRAWER ══════════ */}
        {showProfile && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 299 }} onClick={() => setShowProfile(false)} />
            <div className="cx-drawer">

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.1em", textTransform: "uppercase" }}>Profile</p>
                <button style={{ background: "none", border: "none", fontSize: 18, color: "#AAA", cursor: "pointer" }} onClick={() => setShowProfile(false)}>✕</button>
              </div>

              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "#111", color: "#fff", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 800,
                }}>
                  {username?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: "#111" }}>{username}</p>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#888", marginTop: 2 }}>{user?.email}</p>
                </div>
              </div>

              {/* Mini stat grid */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 1, background: "#EAEAE8", border: "1px solid #EAEAE8",
                borderRadius: 11, overflow: "hidden",
              }}>
                {[
                  { label: "Rating", value: stats?.rating ?? "—" },
                  { label: "Wins",   value: stats?.wins   ?? 0   },
                  { label: "Losses", value: stats?.losses ?? 0   },
                  { label: "Streak", value: stats?.streak ?? 0   },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: "#fff", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 3 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: "#111" }}>{value}</span>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* Nav shortcuts */}
              <div style={{ borderTop: "1px solid #F0F0EE", paddingTop: 14 }}>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Navigate</p>
                {NAV_ROUTES.map(({ label, path }) => (
                  <div
                    key={label}
                    onClick={() => { navigate(path); setShowProfile(false); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "9px 8px", borderRadius: 8, cursor: "pointer", transition: "background 0.12s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#F5F5F3"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <span style={{
                      fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500,
                      color: location.pathname.startsWith(path) ? "#111" : "#666",
                    }}>{label}</span>
                    {location.pathname.startsWith(path) && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="cx-btn cx-btn-ghost" style={{ width: "100%", justifyContent: "center", padding: 11 }}>
                  Edit Profile
                </button>
                <button
                  className="cx-btn cx-btn-ghost"
                  style={{ width: "100%", justifyContent: "center", padding: 11 }}
                  onClick={() => { navigate("/settings"); setShowProfile(false); }}
                >
                  Settings
                </button>
                <button className="cx-btn cx-btn-danger" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
                  Log out
                </button>
              </div>

            </div>
          </>
        )}

      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   RATING CHART
───────────────────────────────────────────── */

function RatingChart({ rating, wins, losses }) {
  const points = Array.from({ length: 8 }, (_, i) => {
    const base = rating - 80 + i * 20 + Math.sin(i * 1.3) * 30;
    return Math.max(800, Math.round(base));
  });
  const min   = Math.min(...points) - 20;
  const max   = Math.max(...points) + 20;
  const range = max - min || 1;
  const W = 280, H = 80;
  const pts = points.map((p, i) => [
    (i / (points.length - 1)) * W,
    H - ((p - min) / range) * H,
  ]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <path d={d} fill="none" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5} fill="#111" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA" }}>8 matches ago</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#111", fontWeight: 700 }}>
          {rating ?? 1200} ELO
        </span>
      </div>
    </div>
  );
}