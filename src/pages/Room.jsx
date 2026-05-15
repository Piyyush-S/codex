import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, arrayUnion,
} from "firebase/firestore";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const LANGUAGES = ["JavaScript", "Python", "C++", "Java", "Go", "Rust", "TypeScript", "C"];
const MODES = ["Ranked", "Casual", "Practice"];

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function Avatar({ name, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "#111", color: "#fff", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
      fontSize: size * 0.38, letterSpacing: "-0.5px",
    }}>
      {name[0].toUpperCase()}
    </div>
  );
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const joinInputRef = useRef(null);

  const [matchSettings, setMatchSettings] = useState({
    difficulty: "Medium",
    language: "JavaScript",
    mode: "Ranked",
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { navigate("/login"); return; }
      setUser(currentUser);
      const roomRef = doc(db, "rooms", roomId);
      const roomSnap = await getDoc(roomRef);
      const currentPlayer = {
        uid: currentUser.uid,
        username: currentUser.displayName || currentUser.email?.split("@")[0] || "Player",
        rating: 1200,
        ready: false,
      };
      if (!roomSnap.exists()) {
        await setDoc(roomRef, { roomId, createdAt: Date.now(), players: [currentPlayer], settings: matchSettings });
      } else {
        const data = roomSnap.data();
        const exists = data.players?.find((p) => p.uid === currentUser.uid);
        if (!exists && data.players.length < 2) await updateDoc(roomRef, { players: arrayUnion(currentPlayer) });
        if (data.settings) setMatchSettings(data.settings);
      }
      const listener = onSnapshot(roomRef, (snap) => {
        if (snap.exists()) { setPlayers(snap.data().players || []); setLoading(false); }
      });
      return () => listener();
    });
    return () => unsub();
  }, []);

  const toggleReady = async () => {
    const roomRef = doc(db, "rooms", roomId);
    const snap = await getDoc(roomRef);
    const updated = snap.data().players.map((p) => p.uid === user.uid ? { ...p, ready: !p.ready } : p);
    await updateDoc(roomRef, { players: updated });
  };

  const updateSettings = async (key, value) => {
    const newSettings = { ...matchSettings, [key]: value };
    setMatchSettings(newSettings);
    await updateDoc(doc(db, "rooms", roomId), { settings: newSettings });
  };

  const allReady = players.length === 2 && players.every((p) => p.ready);
  const myPlayer = players.find((p) => p.uid === user?.uid);
  const isReady = myPlayer?.ready || false;

  const copyRoom = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinByCode = async () => {
    const code = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 6) { setJoinError("Room code must be 6 characters"); return; }
    setJoinLoading(true); setJoinError("");
    try {
      const snap = await getDoc(doc(db, "rooms", code));
      if (!snap.exists()) { setJoinError("Room not found. Check the code and try again."); setJoinLoading(false); return; }
      if (snap.data().players?.length >= 2) { setJoinError("Room is full (2/2)."); setJoinLoading(false); return; }
      navigate(`/room/${code}`);
    } catch { setJoinError("Failed to join. Please try again."); }
    setJoinLoading(false);
  };

  const createNewRoom = () => navigate(`/room/${generateRoomCode()}`);
  const ratingTier = (r) => r >= 1600 ? "Expert" : r >= 1400 ? "Advanced" : r >= 1200 ? "Intermediate" : "Beginner";

  const S = {
    page: { background: "#F6F6F4", minHeight: "100vh", fontFamily: "'Syne', sans-serif" },
    nav: {
      height: 60, background: "#fff", borderBottom: "1px solid #E8E8E6",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 32px", position: "sticky", top: 0, zIndex: 200,
    },
    navLeft: { display: "flex", alignItems: "center", gap: 28 },
    logoBox: {
      width: 28, height: 28, border: "1.5px solid #111", borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: "#111",
    },
    logoText: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: "#111", letterSpacing: "-0.03em" },
    navLink: {
      fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 500,
      color: "#888", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
      border: "none", background: "none", transition: "all 0.15s",
    },
    navLinkActive: {
      fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600,
      color: "#111", padding: "6px 12px", borderRadius: 8, cursor: "pointer",
      border: "none", background: "#EBEBEA",
    },
    navRight: { display: "flex", alignItems: "center", gap: 8 },
    btnOutline: {
      fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600,
      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
      background: "#fff", color: "#111", border: "1px solid #DDDDD8",
      display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
    },
    btnSolid: {
      fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600,
      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
      background: "#111", color: "#fff", border: "1px solid #111",
      display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap",
    },
    btnGhost: {
      fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600,
      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
      background: "transparent", color: "#888", border: "1px solid #E8E8E6",
      display: "inline-flex", alignItems: "center", gap: 7,
    },
    main: { maxWidth: 1400, margin: "0 auto", padding: "32px 32px" },
    pageHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
    breadcrumb: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#AAA", letterSpacing: "0.05em", marginBottom: 6 },
    title: { fontSize: 30, fontWeight: 800, color: "#111", letterSpacing: "-0.04em", margin: 0 },
    statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 },
    stat: { background: "#F0F0EE", borderRadius: 12, padding: "16px 18px" },
    statLabel: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", color: "#AAA", textTransform: "uppercase", marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: 800, color: "#111", letterSpacing: "-0.04em", fontFamily: "'Syne', sans-serif" },
    statSub: { fontSize: 12, color: "#999", marginTop: 2, fontFamily: "'JetBrains Mono', monospace" },
    mainGrid: { display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" },
    col: { display: "flex", flexDirection: "column", gap: 16 },
    card: { background: "#fff", border: "1px solid #E8E8E6", borderRadius: 16, padding: 24 },
    cardSm: { background: "#fff", border: "1px solid #E8E8E6", borderRadius: 16, padding: "18px 20px" },
    label: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#AAA", textTransform: "uppercase", display: "block", marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: "#111", letterSpacing: "-0.02em", margin: 0 },
    codeBlock: {
      display: "inline-flex", alignItems: "center", gap: 2,
      background: "#F6F6F4", border: "1px solid #E0E0DC", borderRadius: 10, padding: "10px 16px",
    },
    codeSeg: { fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 700, color: "#111", letterSpacing: "0.15em" },
    codeDash: { fontSize: 18, color: "#CCC", margin: "0 4px", fontWeight: 300 },
    playerGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 },
    playerCard: {
      border: "1px solid #E8E8E6", borderRadius: 12, padding: 16,
      display: "flex", flexDirection: "column", gap: 12, background: "#FAFAFA",
    },
    playerCardYou: {
      border: "1.5px solid #111", borderRadius: 12, padding: 16,
      display: "flex", flexDirection: "column", gap: 12, background: "#fff",
    },
    playerTop: { display: "flex", alignItems: "center", gap: 12 },
    playerName: { fontSize: 15, fontWeight: 700, color: "#111", letterSpacing: "-0.01em" },
    playerRating: { fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#888", marginTop: 2 },
    readyBadge: {
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
      padding: "5px 12px", borderRadius: 999, background: "#111", color: "#fff",
    },
    waitingBadge: {
      display: "inline-flex", alignItems: "center", gap: 5,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600,
      padding: "5px 12px", borderRadius: 999, background: "#F0F0EE", color: "#999",
      border: "1px solid #E8E8E6",
    },
    waitingSlot: {
      border: "1px dashed #DDDDD8", borderRadius: 12, padding: "20px",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "#FAFAFA", gap: 8,
    },
    settingGroup: { marginBottom: 22 },
    settingGroupLabel: { fontSize: 12, fontWeight: 600, color: "#AAA", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" },
    pills: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
    modeRow: { display: "flex", gap: 8, marginTop: 10 },
    langRow: { display: "flex", gap: 8, overflowX: "auto", marginTop: 10, paddingBottom: 4 },
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F4F4F2" },
    infoKey: { fontSize: 13, color: "#999", fontFamily: "'Syne', sans-serif" },
    infoVal: { fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: "#111" },
    startBtn: {
      width: "100%", padding: 14, background: "#111", color: "#fff",
      border: "none", borderRadius: 12, fontFamily: "'Syne', sans-serif",
      fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
    },
    readyBtn: {
      width: "100%", padding: 14, background: "#fff", color: "#111",
      border: "1.5px solid #111", borderRadius: 12, fontFamily: "'Syne', sans-serif",
      fontSize: 15, fontWeight: 700, cursor: "pointer",
    },
    readyBtnOn: {
      width: "100%", padding: 14, background: "#111", color: "#fff",
      border: "1.5px solid #111", borderRadius: 12, fontFamily: "'Syne', sans-serif",
      fontSize: 15, fontWeight: 700, cursor: "pointer",
    },
    leaveBtn: {
      width: "100%", padding: 13, background: "#fff", color: "#888",
      border: "1px solid #E8E8E6", borderRadius: 12, fontFamily: "'Syne', sans-serif",
      fontSize: 14, fontWeight: 600, cursor: "pointer",
    },
    statusCard: {
      borderRadius: 12, padding: "16px 18px", border: "1.5px solid #111", background: "#111", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    statusCardPending: {
      borderRadius: 12, padding: "16px 18px", border: "1px solid #E8E8E6", background: "#fff", color: "#111",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    rbarRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10 },
    rbarTrack: { flex: 1, height: 3, background: "#EEEEE8", borderRadius: 999, overflow: "hidden" },
    rbarFill: { height: "100%", background: "#111", borderRadius: 999, transition: "width 0.4s ease" },
    modalBg: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
    },
    modal: { background: "#fff", border: "1px solid #E0E0DC", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400 },
  };

  const pill = (active) => ({
    padding: "7px 16px", borderRadius: 999, fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: active ? "1px solid #111" : "1px solid #E8E8E6",
    background: active ? "#111" : "#fff", color: active ? "#fff" : "#888",
    fontFamily: "'Syne', sans-serif",
  });

  const modeBtn = (active) => ({
    flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
    cursor: "pointer", border: active ? "1px solid #111" : "1px solid #E8E8E6",
    background: active ? "#111" : "#fff", color: active ? "#fff" : "#888",
    fontFamily: "'Syne', sans-serif",
  });

  const langBtn = (active) => ({
    padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600, flexShrink: 0,
    cursor: "pointer", border: active ? "1px solid #111" : "1px solid #E8E8E6",
    background: active ? "#111" : "#fff", color: active ? "#fff" : "#888",
    fontFamily: "'JetBrains Mono', monospace", whiteSpace: "nowrap",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F6F6F4; }
        .cx-blink { animation: cxblink 1.4s infinite; }
        @keyframes cxblink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .cx-nav-link:hover { color: #111 !important; background: #F0F0EE !important; }
        .cx-pc:hover { border-color: #bbb !important; }
        .cx-btn-o:hover { border-color: #111 !important; }
        .cx-btn-g:hover { border-color: #bbb !important; color: #111 !important; }
        .cx-ready-btn:hover { background: #111 !important; color: #fff !important; }
        .cx-leave-btn:hover { border-color: #bbb !important; color: #111 !important; }
        .cx-lang-row::-webkit-scrollbar { height: 3px; }
        .cx-lang-row::-webkit-scrollbar-thumb { background: #DDD; border-radius: 3px; }
      `}</style>

      {showJoinModal && (
        <div style={S.modalBg} onClick={(e) => { if (e.target === e.currentTarget) { setShowJoinModal(false); setJoinCode(""); setJoinError(""); } }}>
          <div style={S.modal}>
            <span style={S.label}>Join room</span>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#111", letterSpacing: "-0.03em", marginBottom: 4 }}>Enter room code</p>
            <p style={{ fontSize: 14, color: "#999", marginBottom: 20 }}>Ask your opponent for their 6-character code.</p>
            <input
              ref={joinInputRef}
              style={{
                width: "100%", background: "#F6F6F4", border: "1.5px solid #E0E0DC",
                borderRadius: 10, padding: "14px 18px", color: "#111",
                fontFamily: "'JetBrains Mono', monospace", fontSize: 22,
                fontWeight: 700, letterSpacing: "0.2em", textAlign: "center",
                textTransform: "uppercase", outline: "none",
              }}
              placeholder="ABC123"
              value={joinCode}
              maxLength={6}
              onChange={(e) => { setJoinCode(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()); setJoinError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinByCode()}
              autoFocus
            />
            {joinError && <p style={{ color: "#c0392b", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, marginTop: 8 }}>↳ {joinError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ ...S.btnGhost, flex: 1, justifyContent: "center" }} onClick={() => { setShowJoinModal(false); setJoinCode(""); setJoinError(""); }}>Cancel</button>
              <button style={{ ...S.btnSolid, flex: 1, justifyContent: "center", opacity: joinCode.length !== 6 ? 0.3 : 1 }} onClick={handleJoinByCode} disabled={joinLoading || joinCode.length !== 6}>
                {joinLoading ? "Joining..." : "Join →"}
              </button>
            </div>
            <div style={{ borderTop: "1px solid #F0F0EE", margin: "20px 0 16px" }} />
            <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginBottom: 14 }}>or start a fresh room</p>
            <button style={{ ...S.btnOutline, width: "100%", justifyContent: "center" }} onClick={createNewRoom}>+ Create new room</button>
          </div>
        </div>
      )}

      <div style={S.page}>
        <nav style={S.nav}>
          <div style={S.navLeft}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
              <div style={S.logoBox}>CX</div>
              <span style={S.logoText}>Codex</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {["Dashboard", "Matches", "Problem", "Leaderboard"].map(label => (
                <button key={label} className="cx-nav-link" style={S.navLink} onClick={() => navigate(`/${label.toLowerCase()}`)}>{label}</button>
              ))}
              <button style={S.navLinkActive}>Rooms</button>
            </div>
          </div>
          <div style={S.navRight}>
            <button className="cx-btn-o" style={S.btnOutline} onClick={() => { setShowJoinModal(true); setTimeout(() => joinInputRef.current?.focus(), 80); }}>
              Join room
            </button>
            <button style={S.btnSolid} onClick={createNewRoom}>+ New room</button>
          </div>
        </nav>

        <div style={S.main}>
          <div style={S.pageHeader}>
            <div>
              <p style={S.breadcrumb}>// ROOMS</p>
              <h1 style={S.title}>
                Match Lobby{" "}
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, color: "#AAA", fontWeight: 500 }}>
                  #{roomId}
                </span>
              </h1>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="cx-btn-o" style={S.btnOutline} onClick={copyRoom}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                {copied ? "Copied!" : "Copy room ID"}
              </button>
              <button className="cx-btn-g" style={S.btnGhost} onClick={() => navigate("/dashboard")}>← Leave</button>
            </div>
          </div>

          <div style={S.statGrid}>
            {[
              { label: "Room code", value: `${roomId.slice(0, 3)}-${roomId.slice(3)}`, sub: "shareable", mono: true },
              { label: "Players", value: `${players.length}/2`, sub: players.length === 2 ? "room full" : "waiting" },
              { label: "Mode", value: matchSettings.mode, sub: matchSettings.difficulty.toLowerCase() },
              { label: "Status", value: allReady ? "Ready" : "Lobby", sub: `${players.filter(p => p.ready).length}/${players.length} ready` },
            ].map(({ label, value, sub, mono }) => (
              <div key={label} style={S.stat}>
                <div style={S.statLabel}>{label}</div>
                <div style={{ ...S.statValue, ...(mono ? { fontFamily: "'JetBrains Mono', monospace", fontSize: 20, letterSpacing: "0.06em" } : {}) }}>{value}</div>
                <div style={S.statSub}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={S.mainGrid}>
            <div style={S.col}>
              <div style={S.card}>
                <span style={S.label}>Share room</span>
                <p style={{ ...S.sectionTitle, marginBottom: 12 }}>Invite opponent</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={S.codeBlock}>
                    <span style={S.codeSeg}>{roomId.slice(0, 3)}</span>
                    <span style={S.codeDash}>—</span>
                    <span style={S.codeSeg}>{roomId.slice(3)}</span>
                  </div>
                  <button className="cx-btn-o" style={{ ...S.btnOutline, height: 48 }} onClick={copyRoom}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button className="cx-btn-g" style={{ ...S.btnGhost, height: 48 }} onClick={() => { setShowJoinModal(true); setTimeout(() => joinInputRef.current?.focus(), 80); }}>
                    Join by code
                  </button>
                </div>
                <p style={{ fontSize: 13, color: "#AAA", marginTop: 12 }}>
                  Share this code with your opponent — they can join from the navbar or any room page.
                </p>
              </div>

              <div style={S.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={S.label}>Participants</span>
                    <p style={S.sectionTitle}>Players in room</p>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "#AAA", background: "#F6F6F4", padding: "4px 10px", borderRadius: 8, border: "1px solid #EEEEE8" }}>
                    {players.length} / 2
                  </span>
                </div>

                {loading ? (
                  <div style={{ marginTop: 14, padding: 18, background: "#F6F6F4", borderRadius: 10, textAlign: "center", fontSize: 13, color: "#AAA", fontFamily: "'JetBrains Mono', monospace" }}>
                    Connecting...
                  </div>
                ) : (
                  <div style={S.playerGrid}>
                    {players.map((p) => (
                      <div key={p.uid} className="cx-pc" style={p.uid === user?.uid ? S.playerCardYou : S.playerCard}>
                        <div style={S.playerTop}>
                          <Avatar name={p.username} size={42} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span style={S.playerName}>{p.username}</span>
                              {p.uid === user?.uid && (
                                <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#999", background: "#F0F0EE", padding: "2px 7px", borderRadius: 999, border: "1px solid #E8E8E6" }}>you</span>
                              )}
                            </div>
                            <p style={S.playerRating}>{p.rating} ELO · {ratingTier(p.rating)}</p>
                          </div>
                        </div>
                        <span style={p.ready ? S.readyBadge : S.waitingBadge}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                          {p.ready ? "Ready" : "Waiting"}
                        </span>
                      </div>
                    ))}
                    {players.length < 2 && (
                      <div style={S.waitingSlot}>
                        <div className="cx-blink" style={{ width: 7, height: 7, borderRadius: "50%", background: "#CCC" }} />
                        <span style={{ fontSize: 13, color: "#AAA" }}>Waiting for opponent…</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={S.card}>
                <span style={S.label}>Match settings</span>
                <p style={{ ...S.sectionTitle, marginBottom: 22 }}>Configure battle</p>

                <div style={S.settingGroup}>
                  <p style={S.settingGroupLabel}>Game mode</p>
                  <div style={S.modeRow}>
                    {MODES.map((m) => <button key={m} style={modeBtn(matchSettings.mode === m)} onClick={() => updateSettings("mode", m)}>{m}</button>)}
                  </div>
                </div>

                <div style={S.settingGroup}>
                  <p style={S.settingGroupLabel}>Difficulty</p>
                  <div style={S.pills}>
                    {DIFFICULTIES.map((d) => <button key={d} style={pill(matchSettings.difficulty === d)} onClick={() => updateSettings("difficulty", d)}>{d}</button>)}
                  </div>
                </div>

                <div>
                  <p style={S.settingGroupLabel}>Language</p>
                  <div className="cx-lang-row" style={S.langRow}>
                    {LANGUAGES.map((lang) => <button key={lang} style={langBtn(matchSettings.language === lang)} onClick={() => updateSettings("language", lang)}>{lang}</button>)}
                  </div>
                </div>
              </div>
            </div>

            <div style={S.col}>
              <div style={allReady ? S.statusCard : S.statusCardPending}>
                <div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: "0.1em", opacity: 0.4, textTransform: "uppercase", marginBottom: 2 }}>match status</p>
                  <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>
                    {allReady ? "All systems go" : players.length < 2 ? "Waiting for players" : "Players not ready"}
                  </p>
                </div>
                {allReady ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <div className="cx-blink" style={{ width: 8, height: 8, borderRadius: "50%", background: "#CCC" }} />
                )}
              </div>

              <div style={S.cardSm}>
                <span style={S.label}>Readiness</span>
                {players.length > 0 ? players.map((p) => (
                  <div key={p.uid} style={S.rbarRow}>
                    <Avatar name={p.username} size={26} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111", minWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.username}{p.uid === user?.uid ? " (you)" : ""}
                        </span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#AAA", letterSpacing: "0.05em" }}>
                          {p.ready ? "READY" : "WAITING"}
                        </span>
                      </div>
                      <div style={S.rbarTrack}>
                        <div style={{ ...S.rbarFill, width: p.ready ? "100%" : "0%" }} />
                      </div>
                    </div>
                  </div>
                )) : <p style={{ fontSize: 13, color: "#CCC", marginTop: 8 }}>No players yet.</p>}
              </div>

              <div style={S.cardSm}>
                <span style={S.label}>Summary</span>
                {[
                  { k: "Format", v: "1v1 Duel" },
                  { k: "Mode", v: matchSettings.mode },
                  { k: "Difficulty", v: matchSettings.difficulty },
                  { k: "Language", v: matchSettings.language },
                  { k: "Room ID", v: roomId },
                ].map(({ k, v }, i, arr) => (
                  <div key={k} style={{ ...S.infoRow, ...(i === arr.length - 1 ? { borderBottom: "none" } : {}) }}>
                    <span style={S.infoKey}>{k}</span>
                    <span style={S.infoVal}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button className="cx-ready-btn" style={isReady ? S.readyBtnOn : S.readyBtn} onClick={toggleReady}>
                  {isReady ? "✓ Ready — click to unready" : "Mark as ready"}
                </button>
                <button style={{ ...S.startBtn, opacity: allReady ? 1 : 0.25, cursor: allReady ? "pointer" : "not-allowed" }} onClick={() => { if (allReady) navigate(`/match/${roomId}`); }}>
                  {players.length < 2 ? "Waiting for opponent" : allReady ? "Start match →" : "Waiting for players…"}
                </button>
                <button className="cx-leave-btn" style={S.leaveBtn} onClick={() => navigate("/dashboard")}>Leave room</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
