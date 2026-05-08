import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../firebase";

export default function Landing() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleEnter = () => {
    if (auth.currentUser) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div style={styles.page}>
      {/* GRID */}
      <div style={styles.grid}></div>

      {/* NAVBAR */}
      <div style={styles.nav}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBox}>CX</div>

          <h1 style={styles.logo}>Codex</h1>
        </div>

        <div style={styles.navLinks}>
          <span style={styles.link}>Matches</span>
          <span style={styles.link}>Leaderboard</span>
          <span style={styles.link}>Problems</span>
          <span style={styles.link}>Ranked</span>
        </div>

        <button style={styles.navBtn} onClick={handleEnter}>
          Enter Arena
        </button>
      </div>

      {/* HERO */}
      <div
        style={{
          ...styles.hero,
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0px)"
            : "translateY(30px)",
        }}
      >
        {/* LEFT */}
        <div style={styles.left}>
          <div style={styles.liveBar}>
            <span style={styles.liveDot}></span>
            847 live matches happening now
          </div>

          <p style={styles.label}>
            // REAL-TIME COMPETITIVE CODING
          </p>

          <h1 style={styles.title}>
            Code.
            <br />
            Compete.
            <br />
            Dominate.
          </h1>

          <p style={styles.desc}>
            Multiplayer coding battles with live matchmaking,
            random problems, rankings, HP combat mechanics,
            language-based queues, and real-time duels.
          </p>

          <div style={styles.heroBtns}>
            <button
              style={styles.primaryBtn}
              onClick={handleEnter}
            >
              Start Competing →
            </button>

            <button style={styles.secondaryBtn}>
              Watch Live Matches
            </button>
          </div>

          {/* STATS */}
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <h2 style={styles.statNum}>12K+</h2>
              <p style={styles.statLabel}>
                active competitors
              </p>
            </div>

            <div style={styles.statCard}>
              <h2 style={styles.statNum}>340ms</h2>
              <p style={styles.statLabel}>
                avg queue time
              </p>
            </div>

            <div style={styles.statCard}>
              <h2 style={styles.statNum}>8</h2>
              <p style={styles.statLabel}>
                programming languages
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          {/* MATCH CARD */}
          <div style={styles.matchCard}>
            <div style={styles.matchTop}>
              <div>
                <p style={styles.cardMini}>
                  LIVE MATCH
                </p>

                <h3 style={styles.matchTitle}>
                  Ranked Arena
                </h3>
              </div>

              <div style={styles.liveBadge}>
                LIVE
              </div>
            </div>

            {/* PLAYERS */}
            <div style={styles.players}>
              <div style={styles.player}>
                <div style={styles.avatarBlue}>
                  P
                </div>

                <div>
                  <h4 style={styles.playerName}>
                    piyush
                  </h4>

                  <div style={styles.attacker}>
                    Attacker
                  </div>
                </div>
              </div>

              <div style={styles.vs}>VS</div>

              <div style={styles.player}>
                <div style={styles.avatarRed}>
                  S
                </div>

                <div>
                  <h4 style={styles.playerName}>
                    shadowByte
                  </h4>

                  <div style={styles.defender}>
                    Defender
                  </div>
                </div>
              </div>
            </div>

            {/* PROBLEM */}
            <div style={styles.problemBox}>
              <div style={styles.problemTop}>
                <span style={styles.problemBadge}>
                  Medium
                </span>

                <span style={styles.langBadge}>
                  JavaScript
                </span>
              </div>

              <h3 style={styles.problemTitle}>
                Longest Substring Without Repeating
                Characters
              </h3>

              <p style={styles.problemSub}>
                Randomly drawn ranked problem
              </p>
            </div>

            {/* TIMER */}
            <div style={styles.timerRow}>
              <span>Time remaining</span>

              <span style={styles.timer}>
                04:22
              </span>
            </div>

            <div style={styles.progress}>
              <div style={styles.progressFill}></div>
            </div>
          </div>

          {/* FEATURES */}
          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>
                ⚡
              </span>

              <h4 style={styles.featureTitle}>
                Blitz Battles
              </h4>

              <p style={styles.featureText}>
                Fast paced real-time duels
              </p>
            </div>

            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>
                🧠
              </span>

              <h4 style={styles.featureTitle}>
                Random Problems
              </h4>

              <p style={styles.featureText}>
                No predictable question pool
              </p>
            </div>

            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>
                🏆
              </span>

              <h4 style={styles.featureTitle}>
                Ranked System
              </h4>

              <p style={styles.featureText}>
                Climb ELO leaderboard
              </p>
            </div>

            <div style={styles.featureCard}>
              <span style={styles.featureIcon}>
                💬
              </span>

              <h4 style={styles.featureTitle}>
                Live Chat
              </h4>

              <p style={styles.featureText}>
                Talk while battling
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div style={styles.bottom}>
        <div style={styles.bottomCard}>
          <p style={styles.bottomLabel}>
            MATCHMAKING
          </p>

          <h2 style={styles.bottomTitle}>
            Language based queue system
          </h2>

          <p style={styles.bottomText}>
            Queue specifically for JavaScript, Python,
            Java, C++, Go, Rust and more. Get matched
            against players using the same language.
          </p>

          <div style={styles.languageRow}>
            {[
              "JavaScript",
              "Python",
              "C++",
              "Java",
              "Go",
              "Rust",
            ].map((lang) => (
              <div key={lang} style={styles.langChip}>
                {lang}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== STYLES ====================== */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f3f3f1",
    color: "#111",
    fontFamily:
      "'Space Grotesk', 'Inter', system-ui",
    overflow: "hidden",
    position: "relative",
  },

  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "64px 64px",
    pointerEvents: "none",
  },

  nav: {
    height: "82px",
    padding: "0 42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #ddd",
    position: "relative",
    zIndex: 5,
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  logoBox: {
    width: "38px",
    height: "38px",
    border: "2px solid #111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "13px",
    background: "#fff",
  },

  logo: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "700",
    letterSpacing: "-2px",
  },

  navLinks: {
    display: "flex",
    gap: "36px",
    color: "#666",
    fontSize: "15px",
  },

  link: {
    cursor: "pointer",
  },

  navBtn: {
    height: "48px",
    padding: "0 24px",
    borderRadius: "14px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
  },

  hero: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "70px 42px 40px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "42px",
    transition: "0.7s ease",
    position: "relative",
    zIndex: 2,
  },

  left: {},

  liveBar: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "#fff",
    border: "1px solid #ddd",
    height: "42px",
    padding: "0 18px",
    borderRadius: "999px",
    marginBottom: "32px",
    color: "#555",
    fontSize: "14px",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#16a34a",
  },

  label: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#8b8b8b",
    marginBottom: "18px",
  },

  title: {
    margin: 0,
    fontSize: "110px",
    lineHeight: "0.92",
    letterSpacing: "-7px",
    fontWeight: "700",
    maxWidth: "720px",
  },

  desc: {
    marginTop: "30px",
    fontSize: "18px",
    color: "#555",
    lineHeight: "1.9",
    maxWidth: "720px",
  },

  heroBtns: {
    display: "flex",
    gap: "18px",
    marginTop: "40px",
  },

  primaryBtn: {
    height: "58px",
    padding: "0 28px",
    borderRadius: "16px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
  },

  secondaryBtn: {
    height: "58px",
    padding: "0 28px",
    borderRadius: "16px",
    border: "1px solid #dcdcdc",
    background: "#fff",
    color: "#111",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "18px",
    marginTop: "54px",
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: "24px",
    padding: "28px",
  },

  statNum: {
    margin: 0,
    fontSize: "42px",
    letterSpacing: "-2px",
  },

  statLabel: {
    marginTop: "12px",
    color: "#777",
    fontSize: "14px",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  matchCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "30px",
    padding: "28px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
  },

  matchTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  },

  cardMini: {
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#999",
    marginBottom: "10px",
  },

  matchTitle: {
    margin: 0,
    fontSize: "32px",
    letterSpacing: "-1px",
  },

  liveBadge: {
    height: "36px",
    padding: "0 16px",
    borderRadius: "999px",
    background: "#FCEBEB",
    color: "#791F1F",
    display: "flex",
    alignItems: "center",
    fontWeight: "700",
    fontSize: "12px",
  },

  players: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "18px",
  },

  player: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #ededed",
    padding: "18px",
    borderRadius: "22px",
  },

  avatarBlue: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "#185FA5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "22px",
  },

  avatarRed: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    background: "#791F1F",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "22px",
  },

  playerName: {
    margin: 0,
    fontSize: "18px",
  },

  attacker: {
    marginTop: "6px",
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#EEEDFE",
    color: "#3C3489",
    fontSize: "11px",
    fontWeight: "700",
  },

  defender: {
    marginTop: "6px",
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#FCEBEB",
    color: "#791F1F",
    fontSize: "11px",
    fontWeight: "700",
  },

  vs: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#888",
  },

  problemBox: {
    marginTop: "24px",
    background: "#f7f7f7",
    borderRadius: "24px",
    padding: "22px",
  },

  problemTop: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
  },

  problemBadge: {
    background: "#FFF4D6",
    color: "#b45309",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },

  langBadge: {
    background: "#EAF3FF",
    color: "#185FA5",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
  },

  problemTitle: {
    margin: 0,
    fontSize: "24px",
    lineHeight: "1.3",
  },

  problemSub: {
    marginTop: "12px",
    color: "#777",
    fontSize: "14px",
  },

  timerRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "22px",
    marginBottom: "12px",
    color: "#555",
  },

  timer: {
    fontFamily: "monospace",
    fontSize: "18px",
    fontWeight: "700",
    color: "#111",
  },

  progress: {
    width: "100%",
    height: "10px",
    borderRadius: "999px",
    background: "#ececec",
    overflow: "hidden",
  },

  progressFill: {
    width: "72%",
    height: "100%",
    background: "#185FA5",
    borderRadius: "999px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "18px",
  },

  featureCard: {
    background: "#fff",
    border: "1px solid #e7e7e7",
    borderRadius: "24px",
    padding: "24px",
  },

  featureIcon: {
    fontSize: "24px",
  },

  featureTitle: {
    marginTop: "18px",
    marginBottom: "8px",
    fontSize: "20px",
  },

  featureText: {
    color: "#777",
    lineHeight: "1.7",
    fontSize: "14px",
  },

  bottom: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "10px 42px 80px",
    position: "relative",
    zIndex: 2,
  },

  bottomCard: {
    background: "#fff",
    border: "1px solid #e5e5e5",
    borderRadius: "32px",
    padding: "36px",
  },

  bottomLabel: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#9ca3af",
    marginBottom: "12px",
  },

  bottomTitle: {
    margin: 0,
    fontSize: "52px",
    letterSpacing: "-3px",
  },

  bottomText: {
    marginTop: "18px",
    color: "#666",
    lineHeight: "1.9",
    maxWidth: "760px",
    fontSize: "17px",
  },

  languageRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "30px",
  },

  langChip: {
    height: "44px",
    padding: "0 18px",
    borderRadius: "999px",
    border: "1px solid #ddd",
    background: "#fafafa",
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "600",
  },
};