import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  {
    id: "blitz",
    label: "Blitz",
    desc: "5 min · 1 problem",
    icon: "⚡",
    tag: "FAST",
  },
  {
    id: "ranked",
    label: "Ranked",
    desc: "20 min · 2 problems",
    icon: "🏆",
    tag: "ELO",
  },
  {
    id: "marathon",
    label: "Marathon",
    desc: "60 min · 5 problems",
    icon: "🏃",
    tag: "HARD",
  },
  {
    id: "team",
    label: "Team 2v2",
    desc: "30 min · collaborative",
    icon: "👥",
    tag: "TEAM",
  },
  {
    id: "practice",
    label: "Practice",
    desc: "No timer · unranked",
    icon: "📚",
    tag: "FREE",
  },
  {
    id: "custom",
    label: "Custom Room",
    desc: "Set your own rules",
    icon: "⚙️",
    tag: "ROOM",
  },
];

const NAV_ITEMS = ["Dashboard", "Matches", "Problems", "Leaderboard", "Rooms"];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [username, setUsername] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");

  // Match modal
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Python");
  const [selectedType, setSelectedType] = useState("ranked");
  const [roomCode, setRoomCode] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchStep, setMatchStep] = useState("select"); // select | searching | found

  // Profile sidebar
  const [showProfile, setShowProfile] = useState(false);

  /* ── AUTH ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        navigate("/login");
      } else {
        setUser(u);
        await fetchUserData(u.uid);
        await fetchRecentMatches(u.uid);
      }
    });
    return () => unsub();
  }, []);

  /* ── FETCH USER ── */
  const fetchUserData = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      setStats(data);
      setUsername(data.username);
    }
  };

  /* ── FETCH MATCHES ── */
  const fetchRecentMatches = async (uid) => {
    try {
      const q = query(
        collection(db, "matches"),
        where("players", "array-contains", uid),
        orderBy("createdAt", "desc"),
        limit(8)
      );
      const snap = await getDocs(q);
      setRecent(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch {
      setRecent([]);
    }
  };

  /* ── MATCH FLOW ── */
  const handleStartMatch = () => {
    setMatchLoading(true);
    setMatchStep("searching");
    // Simulate matchmaking — replace with your actual logic
    setTimeout(() => {
      setMatchStep("found");
      setTimeout(() => {
        setMatchLoading(false);
        setShowMatchModal(false);
        setMatchStep("select");
        navigate(`/room/demo-room`);
      }, 1200);
    }, 2500);
  };

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;
    navigate(`/room/${roomCode.trim().toLowerCase()}`);
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ── DERIVED ── */
  const winRate = stats
    ? Math.round((stats.wins / (stats.wins + stats.losses || 1)) * 100)
    : 0;

  const getRankLabel = (rating) => {
    if (!rating) return { label: "Unranked", color: "#444" };
    if (rating >= 2000) return { label: "Grandmaster", color: "#0a0a0a" };
    if (rating >= 1800) return { label: "Master", color: "#0a0a0a" };
    if (rating >= 1600) return { label: "Diamond", color: "#0a0a0a" };
    if (rating >= 1400) return { label: "Platinum", color: "#0a0a0a" };
    if (rating >= 1200) return { label: "Gold", color: "#0a0a0a" };
    return { label: "Silver", color: "#0a0a0a" };
  };

  const rank = getRankLabel(stats?.rating);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Syne:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f5f3; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes searchPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        .nav-item { cursor:pointer; padding:6px 12px; border-radius:6px; font-family:'Syne',sans-serif; font-size:13px; font-weight:600; color:#888; transition:all 0.15s; }
        .nav-item:hover { color:#0a0a0a; background:#f0f0ee; }
        .nav-item.active { color:#0a0a0a; background:#ebebea; }
        .action-btn { cursor:pointer; font-family:'Syne',sans-serif; font-weight:700; transition:all 0.15s; border:none; }
        .action-btn:hover { transform:translateY(-1px); }
        .action-btn:active { transform:translateY(0); }
        .lang-chip { cursor:pointer; padding:6px 12px; border-radius:6px; font-family:'JetBrains Mono',monospace; font-size:12px; border:1px solid #e0e0e0; background:#f9f9f9; color:#555; transition:all 0.15s; }
        .lang-chip:hover { border-color:#0a0a0a; color:#0a0a0a; }
        .lang-chip.selected { background:#0a0a0a; color:#fff; border-color:#0a0a0a; }
        .match-type-card { cursor:pointer; padding:16px; border-radius:10px; border:1px solid #e8e8e8; background:#fff; transition:all 0.15s; }
        .match-type-card:hover { border-color:#0a0a0a; transform:translateY(-1px); }
        .match-type-card.selected { border-color:#0a0a0a; border-width:2px; background:#fafafa; }
        .stat-card { background:#fff; border:1px solid #ebebea; border-radius:12px; padding:20px 24px; }
        .recent-row { display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid #f0f0ee; font-family:'JetBrains Mono',monospace; font-size:12px; }
        .recent-row:last-child { border-bottom:none; }
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:100; display:flex; align-items:center; justify-content:center; animation:fadeUp 0.2s ease; }
        .modal { background:#fff; border-radius:16px; padding:32px; width:100%; max-width:600px; max-height:88vh; overflow-y:auto; position:relative; }
        .profile-drawer { position:fixed; right:0; top:0; bottom:0; width:300px; background:#fff; border-left:1px solid #ebebea; z-index:200; padding:32px 24px; animation:fadeUp 0.2s; display:flex; flex-direction:column; gap:20px; }
        input[type=text]:focus { outline:none; }
      `}</style>

      <div style={s.page}>

        {/* ══ NAVBAR ══ */}
        <nav style={s.navbar}>
          <div style={s.navLeft}>
            <div style={s.brandMark}>CX</div>
            <span style={s.brandName}>Codex</span>
            <div style={s.navDivider} />
            {NAV_ITEMS.map((item) => (
              <span
                key={item}
                className={`nav-item${activeNav === item ? " active" : ""}`}
                onClick={() => setActiveNav(item)}
              >
                {item}
              </span>
            ))}
          </div>

          <div style={s.navRight}>
            <div style={s.liveDot}>
              <div style={s.livePulse} />
              <span style={s.liveText}>847 live</span>
            </div>
            <div style={s.userPill} onClick={() => setShowProfile(!showProfile)}>
              <div style={s.userAvatar}>
                {username?.[0]?.toUpperCase() || "?"}
              </div>
              <span style={s.userPillName}>{username || user?.email}</span>
              <span style={{ color: "#aaa", fontSize: 12 }}>▾</span>
            </div>
          </div>
        </nav>

        {/* ══ MAIN ══ */}
        <div style={s.main}>

          {/* ── Header row ── */}
          <div style={s.pageHeader}>
            <div>
              <p style={s.pageLabel}>// DASHBOARD</p>
              <h1 style={s.pageTitle}>
                Welcome back,{" "}
                <span style={{ color: "#0a0a0a" }}>{username || "Competitor"}</span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="action-btn"
                style={s.btnOutline}
                onClick={() => navigate("/room/watch")}
              >
                Watch Live →
              </button>
              <button
                className="action-btn"
                style={s.btnPrimary}
                onClick={() => setShowMatchModal(true)}
              >
                + New Match
              </button>
            </div>
          </div>

          {/* ── Stats row ── */}
          <div style={s.statsGrid}>
            <StatCard
              label="ELO Rating"
              value={stats?.rating ?? "—"}
              sub={rank.label}
              mono
            />
            <StatCard
              label="Win Rate"
              value={`${winRate}%`}
              sub={`${stats?.wins ?? 0}W / ${stats?.losses ?? 0}L`}
              mono
            />
            <StatCard
              label="Win Streak"
              value={stats?.streak ?? "—"}
              sub="current streak"
              mono
            />
            <StatCard
              label="Global Rank"
              value={`#${stats?.rank ?? 999}`}
              sub="worldwide"
              mono
            />
          </div>

          {/* ── Quick actions ── */}
          <div style={s.quickActions}>
            <QuickAction icon="⚡" label="Blitz Match" sub="5 min" onClick={() => { setSelectedType("blitz"); setShowMatchModal(true); }} />
            <QuickAction icon="🏆" label="Ranked" sub="ELO match" onClick={() => { setSelectedType("ranked"); setShowMatchModal(true); }} />
            <QuickAction icon="👥" label="Team 2v2" sub="collaborative" onClick={() => { setSelectedType("team"); setShowMatchModal(true); }} />
            <QuickAction icon="📚" label="Practice" sub="unranked" onClick={() => { setSelectedType("practice"); setShowMatchModal(true); }} />
            <QuickAction icon="🔗" label="Join Room" sub="enter code" onClick={() => { setSelectedType("custom"); setShowMatchModal(true); }} />
            <QuickAction icon="👁" label="Watch Live" sub="spectate" onClick={() => navigate("/room/watch")} />
          </div>

          {/* ── Content grid ── */}
          <div style={s.contentGrid}>

            {/* Recent matches */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <p style={s.cardLabel}>RECENT MATCHES</p>
                <span style={s.cardLink}>View all →</span>
              </div>

              {recent.length === 0 ? (
                <div style={s.emptyState}>
                  <p style={s.emptyIcon}>⚔️</p>
                  <p style={s.emptyText}>No matches yet. Jump in!</p>
                  <button
                    className="action-btn"
                    style={{ ...s.btnPrimary, marginTop: 12, fontSize: 13, padding: "9px 18px" }}
                    onClick={() => setShowMatchModal(true)}
                  >
                    Start your first match
                  </button>
                </div>
              ) : (
                recent.map((m, i) => (
                  <div className="recent-row" key={m.id || i}>
                    <span style={m.winner === user?.uid ? s.winBadge : s.lossBadge}>
                      {m.winner === user?.uid ? "WIN" : "LOSS"}
                    </span>
                    <span style={{ flex: 1, color: "#333", fontSize: 12, fontFamily: "'Syne',sans-serif" }}>
                      {m.problem || "Unknown problem"}
                    </span>
                    <span style={{ color: "#888", fontSize: 11 }}>{m.type || "ranked"}</span>
                    <span style={{ color: "#888", fontSize: 11 }}>{m.language || "—"}</span>
                    <span style={{
                      fontWeight: 700,
                      color: (m.ratingChange?.[user?.uid] ?? 0) > 0 ? "#1d9e75" : "#c00",
                      minWidth: 40, textAlign: "right"
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

              {/* Rating history placeholder */}
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <p style={s.cardLabel}>RATING HISTORY</p>
                </div>
                <RatingChart rating={stats?.rating ?? 1200} wins={stats?.wins ?? 0} losses={stats?.losses ?? 0} />
              </div>

              {/* Top languages */}
              <div style={s.card}>
                <div style={s.cardHeader}>
                  <p style={s.cardLabel}>PREFERRED LANGUAGES</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {["Python", "C++", "JavaScript"].map((l) => (
                    <span key={l} style={s.langTag}>{l}</span>
                  ))}
                  <span
                    style={{ ...s.langTag, background: "transparent", color: "#aaa", cursor: "pointer" }}
                    onClick={() => setShowMatchModal(true)}
                  >
                    + add more
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ══ MATCH MODAL ══ */}
        {showMatchModal && (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget && matchStep === "select") { setShowMatchModal(false); setMatchStep("select"); } }}>
            <div className="modal">
              {matchStep === "select" && (
                <>
                  <div style={s.modalHeader}>
                    <div>
                      <p style={s.cardLabel}>NEW MATCH</p>
                      <h2 style={s.modalTitle}>Configure your match</h2>
                    </div>
                    <button style={s.closeBtn} onClick={() => setShowMatchModal(false)}>✕</button>
                  </div>

                  {/* Match type */}
                  <p style={{ ...s.cardLabel, marginBottom: 10 }}>MATCH TYPE</p>
                  <div style={s.matchTypeGrid}>
                    {MATCH_TYPES.map((mt) => (
                      <div
                        key={mt.id}
                        className={`match-type-card${selectedType === mt.id ? " selected" : ""}`}
                        onClick={() => setSelectedType(mt.id)}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontSize: 20 }}>{mt.icon}</span>
                          <span style={s.matchTag}>{mt.tag}</span>
                        </div>
                        <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0a0a0a", marginBottom: 2 }}>{mt.label}</p>
                        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#888" }}>{mt.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Join room code (only for custom) */}
                  {selectedType === "custom" && (
                    <div style={{ marginTop: 20 }}>
                      <p style={{ ...s.cardLabel, marginBottom: 8 }}>ROOM CODE</p>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          placeholder="Enter room code..."
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          style={s.roomInput}
                        />
                        <button className="action-btn" style={s.btnPrimary} onClick={handleJoinRoom}>
                          Join →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Language selector */}
                  <div style={{ marginTop: 20 }}>
                    <p style={{ ...s.cardLabel, marginBottom: 10 }}>LANGUAGE</p>
                    <div style={s.langGrid}>
                      {LANGUAGES.map((l) => (
                        <span
                          key={l}
                          className={`lang-chip${selectedLang === l ? " selected" : ""}`}
                          onClick={() => setSelectedLang(l)}
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Summary + start */}
                  <div style={s.modalFooter}>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#888" }}>
                      {MATCH_TYPES.find(m => m.id === selectedType)?.label} · {selectedLang}
                    </div>
                    {selectedType !== "custom" && (
                      <button
                        className="action-btn"
                        style={s.btnPrimary}
                        onClick={handleStartMatch}
                      >
                        Find Match →
                      </button>
                    )}
                  </div>
                </>
              )}

              {matchStep === "searching" && (
                <div style={s.searchingState}>
                  <div style={s.searchRing} />
                  <p style={s.searchTitle}>Finding opponent...</p>
                  <p style={s.searchSub}>{MATCH_TYPES.find(m => m.id === selectedType)?.label} · {selectedLang}</p>
                  <button
                    style={{ ...s.btnOutline, marginTop: 24, fontSize: 13 }}
                    onClick={() => { setMatchStep("select"); setMatchLoading(false); }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {matchStep === "found" && (
                <div style={s.searchingState}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                  <p style={s.searchTitle}>Opponent found!</p>
                  <p style={s.searchSub}>Entering room...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ PROFILE DRAWER ══ */}
        {showProfile && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 199 }} onClick={() => setShowProfile(false)} />
            <div className="profile-drawer">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={s.cardLabel}>PROFILE</p>
                <button style={s.closeBtn} onClick={() => setShowProfile(false)}>✕</button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={s.profileAvatar}>{username?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#0a0a0a" }}>{username}</p>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#888" }}>{user?.email}</p>
                </div>
              </div>

              <div style={s.profileStats}>
                {[
                  { label: "Rating", value: stats?.rating ?? "—" },
                  { label: "Wins", value: stats?.wins ?? 0 },
                  { label: "Losses", value: stats?.losses ?? 0 },
                  { label: "Streak", value: stats?.streak ?? 0 },
                ].map(({ label, value }) => (
                  <div key={label} style={s.profileStat}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, fontWeight: 700, color: "#0a0a0a" }}>{value}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#aaa", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                <button className="action-btn" style={{ ...s.btnOutline, width: "100%", padding: 11 }}>
                  Edit Profile
                </button>
                <button className="action-btn" style={{ ...s.btnOutline, width: "100%", padding: 11 }}>
                  Settings
                </button>
                <button
                  className="action-btn"
                  style={{ ...s.btnDanger, width: "100%", padding: 11 }}
                  onClick={logout}
                >
                  Logout
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
   SUB-COMPONENTS
───────────────────────────────────────────── */

function StatCard({ label, value, sub, mono }) {
  return (
    <div className="stat-card">
      <p style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 10, color: "#aaa",
        textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
      }}>{label}</p>
      <p style={{
        fontFamily: mono ? "'JetBrains Mono',monospace" : "'Syne',sans-serif",
        fontSize: 32, fontWeight: 700, color: "#0a0a0a", lineHeight: 1, marginBottom: 4,
      }}>{value}</p>
      <p style={{
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 11, color: "#888",
      }}>{sub}</p>
    </div>
  );
}

function QuickAction({ icon, label, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", border: "1px solid #ebebea",
        borderRadius: 12, padding: "16px 20px",
        cursor: "pointer", flex: 1, minWidth: 0,
        transition: "all 0.15s",
        fontFamily: "'Syne',sans-serif",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#0a0a0a"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebea"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <span style={{ fontSize: 22, display: "block", marginBottom: 8 }}>{icon}</span>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#0a0a0a", marginBottom: 2 }}>{label}</p>
      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#aaa" }}>{sub}</p>
    </div>
  );
}

function RatingChart({ rating, wins, losses }) {
  const total = wins + losses || 1;
  const points = Array.from({ length: 8 }, (_, i) => {
    const base = rating - 80 + i * 20 + Math.sin(i * 1.3) * 30;
    return Math.max(800, Math.round(base));
  });
  const min = Math.min(...points) - 20;
  const max = Math.max(...points) + 20;
  const range = max - min || 1;
  const w = 260, h = 80;
  const pts = points.map((p, i) => [
    (i / (points.length - 1)) * w,
    h - ((p - min) / range) * h,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  return (
    <div style={{ marginTop: 8 }}>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
        <path d={d} fill="none" stroke="#0a0a0a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#0a0a0a" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#aaa" }}>8 matches ago</span>
        <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#0a0a0a", fontWeight: 700 }}>{rating ?? 1200} ELO</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const s = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f3",
    fontFamily: "'Syne', system-ui, sans-serif",
  },

  /* NAVBAR */
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
    height: 56,
    background: "#fff",
    borderBottom: "1px solid #ebebea",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  navLeft: { display: "flex", alignItems: "center", gap: 4 },
  brandMark: {
    width: 28, height: 28,
    border: "2px solid #0a0a0a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700,
    marginRight: 6,
  },
  brandName: {
    fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15,
    color: "#0a0a0a", marginRight: 16, letterSpacing: -0.3,
  },
  navDivider: { width: 1, height: 20, background: "#e8e8e8", margin: "0 12px" },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  liveDot: { display: "flex", alignItems: "center", gap: 6 },
  livePulse: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#0a0a0a", animation: "pulse 2s infinite",
  },
  liveText: { fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#888" },
  userPill: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "5px 10px 5px 6px",
    border: "1px solid #e8e8e8", borderRadius: 8,
    cursor: "pointer", background: "#fafafa",
  },
  userAvatar: {
    width: 26, height: 26, borderRadius: "50%",
    background: "#0a0a0a", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 800,
  },
  userPillName: { fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, color: "#0a0a0a" },

  /* MAIN */
  main: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
  pageHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-end",
    marginBottom: 24,
  },
  pageLabel: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
    color: "#aaa", letterSpacing: 1, marginBottom: 4,
  },
  pageTitle: {
    fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800,
    color: "#888", letterSpacing: -0.8, lineHeight: 1,
  },

  /* STATS */
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: 12, marginBottom: 16,
  },

  /* QUICK ACTIONS */
  quickActions: {
    display: "flex", gap: 10, marginBottom: 20,
  },

  /* CARDS */
  contentGrid: {
    display: "grid", gridTemplateColumns: "1fr 380px", gap: 16,
  },
  card: {
    background: "#fff", border: "1px solid #ebebea",
    borderRadius: 12, padding: "20px 24px",
  },
  cardHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 16,
  },
  cardLabel: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 10,
    color: "#aaa", letterSpacing: 1, textTransform: "uppercase",
  },
  cardLink: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
    color: "#888", cursor: "pointer",
  },

  /* BADGES */
  winBadge: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
    background: "#f0faf5", color: "#0f6e56",
    padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5,
  },
  lossBadge: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700,
    background: "#fff0f0", color: "#a32d2d",
    padding: "3px 8px", borderRadius: 4, letterSpacing: 0.5,
  },

  /* EMPTY */
  emptyState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "32px 0", textAlign: "center",
  },
  emptyIcon: { fontSize: 36, marginBottom: 12 },
  emptyText: { fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "#aaa" },

  /* BUTTONS */
  btnPrimary: {
    background: "#0a0a0a", color: "#fff",
    padding: "10px 20px", borderRadius: 8,
    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
    border: "none", cursor: "pointer",
  },
  btnOutline: {
    background: "transparent", color: "#0a0a0a",
    padding: "10px 20px", borderRadius: 8,
    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
    border: "1px solid #0a0a0a", cursor: "pointer",
  },
  btnDanger: {
    background: "transparent", color: "#a32d2d",
    padding: "10px 20px", borderRadius: 8,
    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
    border: "1px solid #fcc", cursor: "pointer",
  },

  /* LANG TAG */
  langTag: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 11,
    background: "#f5f5f3", color: "#555",
    padding: "4px 10px", borderRadius: 6,
    border: "1px solid #e8e8e8",
  },

  /* MODAL */
  modalHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 24,
  },
  modalTitle: {
    fontFamily: "'Syne',sans-serif", fontSize: 22,
    fontWeight: 800, color: "#0a0a0a", letterSpacing: -0.5, marginTop: 4,
  },
  closeBtn: {
    background: "transparent", border: "none",
    fontSize: 18, color: "#aaa", cursor: "pointer", padding: "0 4px",
    fontFamily: "'Syne',sans-serif",
  },
  matchTypeGrid: {
    display: "grid", gridTemplateColumns: "repeat(3,1fr)",
    gap: 10, marginBottom: 4,
  },
  matchTag: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 9,
    background: "#f0f0ee", color: "#888",
    padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5,
  },
  langGrid: {
    display: "flex", flexWrap: "wrap", gap: 6,
  },
  roomInput: {
    flex: 1, padding: "11px 14px",
    background: "#f9f9f9", border: "1px solid #e0e0e0",
    borderRadius: 8, fontFamily: "'JetBrains Mono',monospace",
    fontSize: 14, fontWeight: 700, color: "#0a0a0a",
    letterSpacing: 2,
  },
  modalFooter: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginTop: 24,
    paddingTop: 20, borderTop: "1px solid #f0f0ee",
  },

  /* SEARCHING */
  searchingState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", padding: "40px 0", textAlign: "center",
  },
  searchRing: {
    width: 60, height: 60, borderRadius: "50%",
    border: "3px solid #e0e0e0", borderTopColor: "#0a0a0a",
    animation: "spin 0.8s linear infinite", marginBottom: 24,
  },
  searchTitle: {
    fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800,
    color: "#0a0a0a", marginBottom: 6,
  },
  searchSub: {
    fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#888",
  },

  /* PROFILE DRAWER */
  profileAvatar: {
    width: 52, height: 52, borderRadius: "50%",
    background: "#0a0a0a", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800,
    flexShrink: 0,
  },
  profileStats: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 1, background: "#ebebea",
    border: "1px solid #ebebea", borderRadius: 10, overflow: "hidden",
  },
  profileStat: {
    background: "#fff", padding: "14px 16px",
    display: "flex", flexDirection: "column", gap: 4,
  },
};
