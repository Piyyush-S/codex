import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [matchSettings, setMatchSettings] = useState({
    difficulty: "Medium",
    language: "JavaScript",
    mode: "Ranked",
  });

  const [copied, setCopied] = useState(false);

  // AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // TEMP PLAYERS
  useEffect(() => {
    if (!user) return;

    const fakePlayers = [
      {
        username:
          user.displayName || user.email?.split("@")[0] || "Player",
        rating: 1284,
        ready: true,
      },
      {
        username: "shadowByte",
        rating: 1311,
        ready: false,
      },
    ];

    setPlayers(fakePlayers);
  }, [user]);

  // START MATCH
  const startMatch = () => {
    navigate(`/match/${roomId}`);
  };

  // COPY ROOM
  const copyRoom = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.log(err);
    }
  };

  const difficulties = ["Easy", "Medium", "Hard"];

  const languages = [
    "JavaScript",
    "Python",
    "C++",
    "Java",
    "Go",
    "Rust",
    "TypeScript",
    "C",
  ];

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoDot} />
          <span style={styles.logo}>Codex</span>
        </div>

        <div style={styles.roomTopActions}>
          <button style={styles.shareBtn} onClick={copyRoom}>
            {copied ? "Copied" : "Copy Room ID"}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.container}>
        {/* LEFT */}
        <div style={styles.left}>
          {/* ROOM HEADER */}
          <div style={styles.heroCard}>
            <div style={styles.heroTop}>
              <div>
                <p style={styles.sectionLabel}>ROOM</p>
                <h1 style={styles.roomTitle}>
                  Competitive Match Lobby
                </h1>
              </div>

              <div style={styles.liveBadge}>
                <div style={styles.liveDot} />
                LIVE
              </div>
            </div>

            <p style={styles.roomId}>
              Room ID · <span>{roomId}</span>
            </p>

            <div style={styles.roomMeta}>
              <div style={styles.metaBox}>
                <span style={styles.metaLabel}>Mode</span>
                <span style={styles.metaValue}>
                  {matchSettings.mode}
                </span>
              </div>

              <div style={styles.metaBox}>
                <span style={styles.metaLabel}>Difficulty</span>
                <span style={styles.metaValue}>
                  {matchSettings.difficulty}
                </span>
              </div>

              <div style={styles.metaBox}>
                <span style={styles.metaLabel}>Language</span>
                <span style={styles.metaValue}>
                  {matchSettings.language}
                </span>
              </div>
            </div>
          </div>

          {/* PLAYERS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionLabel}>PLAYERS</p>
                <h3 style={styles.cardTitle}>
                  Players in room
                </h3>
              </div>

              <span style={styles.playerCount}>
                {players.length}/2
              </span>
            </div>

            <div style={styles.playersList}>
              {players.map((p, i) => (
                <div key={i} style={styles.playerCard}>
                  <div style={styles.playerLeft}>
                    <div style={styles.avatar}>
                      {p.username[0]?.toUpperCase()}
                    </div>

                    <div>
                      <p style={styles.playerName}>
                        {p.username}
                      </p>

                      <p style={styles.playerRating}>
                        Rating · {p.rating}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      ...styles.readyBadge,
                      background: p.ready
                        ? "#EAF3DE"
                        : "#FCEBEB",
                      color: p.ready
                        ? "#27500A"
                        : "#791F1F",
                    }}
                  >
                    {p.ready ? "Ready" : "Waiting"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SETTINGS */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <p style={styles.sectionLabel}>MATCH SETTINGS</p>
                <h3 style={styles.cardTitle}>
                  Configure battle
                </h3>
              </div>
            </div>

            {/* DIFFICULTY */}
            <div style={styles.settingBlock}>
              <p style={styles.settingLabel}>
                Problem Difficulty
              </p>

              <div style={styles.pills}>
                {difficulties.map((d) => (
                  <button
                    key={d}
                    onClick={() =>
                      setMatchSettings({
                        ...matchSettings,
                        difficulty: d,
                      })
                    }
                    style={{
                      ...styles.pill,
                      background:
                        matchSettings.difficulty === d
                          ? "#185FA5"
                          : "#f3f4f6",
                      color:
                        matchSettings.difficulty === d
                          ? "#fff"
                          : "#444",
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* LANGUAGES */}
            <div style={styles.settingBlock}>
              <p style={styles.settingLabel}>
                Programming Language
              </p>

              <div style={styles.languageScroll}>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() =>
                      setMatchSettings({
                        ...matchSettings,
                        language: lang,
                      })
                    }
                    style={{
                      ...styles.languageBtn,
                      border:
                        matchSettings.language === lang
                          ? "1px solid #185FA5"
                          : "1px solid #e5e7eb",
                      background:
                        matchSettings.language === lang
                          ? "#EEF5FF"
                          : "#fff",
                      color:
                        matchSettings.language === lang
                          ? "#185FA5"
                          : "#444",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* MATCH INFO */}
          <div style={styles.sideCard}>
            <p style={styles.sectionLabel}>MATCH INFO</p>

            <div style={styles.infoRow}>
              <span>Rounds</span>
              <strong>Best of 5</strong>
            </div>

            <div style={styles.infoRow}>
              <span>Timer</span>
              <strong>15 min</strong>
            </div>

            <div style={styles.infoRow}>
              <span>Problem Type</span>
              <strong>Randomized</strong>
            </div>

            <div style={styles.infoRow}>
              <span>Matchmaking</span>
              <strong>ELO Based</strong>
            </div>
          </div>

          {/* TIPS */}
          <div style={styles.sideCard}>
            <p style={styles.sectionLabel}>QUEUE TIPS</p>

            <div style={styles.tip}>
              Same problem appears for both players.
            </div>

            <div style={styles.tip}>
              Faster correct submissions gain bonus ELO.
            </div>

            <div style={styles.tip}>
              Leaving a ranked match counts as loss.
            </div>
          </div>

          {/* START */}
          <div style={styles.startCard}>
            <button
              onClick={startMatch}
              style={styles.startBtn}
            >
              Start Match
            </button>

            <button style={styles.leaveBtn}>
              Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9f9f9",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#111827",
  },

  navbar: {
    height: "72px",
    background: "#fff",
    borderBottom: "1px solid #ececec",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logoDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#185FA5",
  },

  logo: {
    fontSize: "20px",
    fontWeight: "700",
  },

  roomTopActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  shareBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "30px",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "24px",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  heroCard: {
    background: "#fff",
    borderRadius: "22px",
    padding: "28px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "1px",
    color: "#9ca3af",
    marginBottom: "6px",
  },

  roomTitle: {
    fontSize: "34px",
    margin: 0,
    letterSpacing: "-1px",
  },

  liveBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "#FCEBEB",
    color: "#791F1F",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  liveDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#dc2626",
  },

  roomId: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "14px",
  },

  roomMeta: {
    display: "flex",
    gap: "14px",
    marginTop: "24px",
    flexWrap: "wrap",
  },

  metaBox: {
    background: "#f3f4f6",
    borderRadius: "14px",
    padding: "14px 18px",
    minWidth: "140px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  metaLabel: {
    fontSize: "11px",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  metaValue: {
    fontWeight: "600",
    fontSize: "14px",
  },

  card: {
    background: "#fff",
    borderRadius: "22px",
    padding: "24px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "18px",
  },

  playerCount: {
    background: "#EEF5FF",
    color: "#185FA5",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  playersList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  playerCard: {
    border: "1px solid #ececec",
    borderRadius: "16px",
    padding: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  playerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "#185FA5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },

  playerName: {
    margin: 0,
    fontWeight: "600",
    fontSize: "15px",
  },

  playerRating: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: "13px",
  },

  readyBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  settingBlock: {
    marginBottom: "26px",
  },

  settingLabel: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  pills: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  pill: {
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "0.2s",
  },

  languageScroll: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    paddingBottom: "6px",
  },

  languageBtn: {
    padding: "12px 16px",
    borderRadius: "12px",
    background: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontSize: "13px",
    fontWeight: "500",
  },

  sideCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f1f1f1",
    fontSize: "14px",
  },

  tip: {
    fontSize: "13px",
    color: "#4b5563",
    lineHeight: "1.7",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },

  startCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  startBtn: {
    width: "100%",
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: "#185FA5",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  leaveBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
};