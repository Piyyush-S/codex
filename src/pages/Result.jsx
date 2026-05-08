import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result || "win";

  const username =
    location.state?.user ||
    localStorage.getItem("username") ||
    "competitor";

  const myHP = location.state?.myHP ?? 3;
  const oppHP = location.state?.oppHP ?? 0;

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => clearTimeout(t);
  }, []);

  const isWinner = result === "win";

  return (
    <div style={styles.page}>
      {/* NOISE */}
      <div style={styles.noise}></div>

      {/* TOPBAR */}
      <div style={styles.topbar}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBox}>CX</div>

          <h2 style={styles.logo}>Codex</h2>
        </div>

        <div style={styles.topRight}>
          <div style={styles.live}>
            <span style={styles.liveDot}></span>
            Ranked Match
          </div>

          <button
            style={styles.exitBtn}
            onClick={() => navigate("/dashboard")}
          >
            Exit
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div
        style={{
          ...styles.container,
          opacity: visible ? 1 : 0,
          transform: visible
            ? "translateY(0px)"
            : "translateY(30px)",
        }}
      >
        {/* HERO */}
        <div style={styles.hero}>
          <div>
            <p style={styles.section}>
              // MATCH COMPLETE
            </p>

            <h1
              style={{
                ...styles.mainResult,
                color: isWinner
                  ? "#111"
                  : "#6b7280",
              }}
            >
              {isWinner
                ? "Dominated."
                : "Outplayed."}
            </h1>

            <p style={styles.heroSub}>
              {isWinner
                ? "You solved the challenge faster and controlled the round."
                : "The opponent finished first this time."}
            </p>
          </div>

          <div
            style={{
              ...styles.statusPill,
              background: isWinner
                ? "#EAF3DE"
                : "#FCEBEB",

              color: isWinner
                ? "#27500A"
                : "#791F1F",
            }}
          >
            {isWinner ? "VICTORY" : "DEFEAT"}
          </div>
        </div>

        {/* CENTER GRID */}
        <div style={styles.grid}>
          {/* LEFT */}
          <div style={styles.left}>
            {/* SCORECARD */}
            <div style={styles.bigCard}>
              <div style={styles.cardTop}>
                <p style={styles.cardLabel}>
                  FINAL STANDOFF
                </p>

                <div style={styles.round}>
                  ROUND 5
                </div>
              </div>

              {/* PLAYERS */}
              <div style={styles.players}>
                {/* YOU */}
                <div style={styles.player}>
                  <div style={styles.avatarBlue}>
                    {username[0]?.toUpperCase()}
                  </div>

                  <div>
                    <h3 style={styles.playerName}>
                      {username}
                    </h3>

                    <div style={styles.youBadge}>
                      ATTACKER
                    </div>
                  </div>

                  <div style={styles.hpBox}>
                    <span style={styles.hpText}>
                      HP
                    </span>

                    <h2 style={styles.hp}>
                      {myHP}
                    </h2>
                  </div>
                </div>

                {/* VS */}
                <div style={styles.vs}>
                  VS
                </div>

                {/* OPPONENT */}
                <div style={styles.player}>
                  <div style={styles.avatarRed}>
                    O
                  </div>

                  <div>
                    <h3 style={styles.playerName}>
                      shadowByte
                    </h3>

                    <div style={styles.enemyBadge}>
                      DEFENDER
                    </div>
                  </div>

                  <div style={styles.hpBox}>
                    <span style={styles.hpText}>
                      HP
                    </span>

                    <h2 style={styles.hp}>
                      {oppHP}
                    </h2>
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <p style={styles.smallLabel}>
                    LANGUAGE
                  </p>

                  <h3 style={styles.statValue}>
                    JavaScript
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={styles.smallLabel}>
                    PROBLEM
                  </p>

                  <h3 style={styles.statValue}>
                    Add Two Numbers
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={styles.smallLabel}>
                    TIME LEFT
                  </p>

                  <h3 style={styles.statValue}>
                    01:42
                  </h3>
                </div>

                <div style={styles.statCard}>
                  <p style={styles.smallLabel}>
                    RATING
                  </p>

                  <h3
                    style={{
                      ...styles.statValue,
                      color: isWinner
                        ? "#166534"
                        : "#991b1b",
                    }}
                  >
                    {isWinner
                      ? "+18 ELO"
                      : "-12 ELO"}
                  </h3>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div style={styles.timelineCard}>
              <div style={styles.timelineTop}>
                <p style={styles.cardLabel}>
                  MATCH TIMELINE
                </p>
              </div>

              <div style={styles.timeline}>
                <div style={styles.timelineRow}>
                  <div style={styles.timelineDot}></div>

                  <div>
                    <h4 style={styles.timelineTitle}>
                      Match Started
                    </h4>

                    <p style={styles.timelineSub}>
                      Both players received
                      the same random problem
                    </p>
                  </div>

                  <span style={styles.timelineTime}>
                    05:00
                  </span>
                </div>

                <div style={styles.timelineRow}>
                  <div style={styles.timelineDot}></div>

                  <div>
                    <h4 style={styles.timelineTitle}>
                      First Correct Run
                    </h4>

                    <p style={styles.timelineSub}>
                      You passed all test
                      cases
                    </p>
                  </div>

                  <span style={styles.timelineTime}>
                    02:14
                  </span>
                </div>

                <div style={styles.timelineRow}>
                  <div style={styles.timelineDotGreen}></div>

                  <div>
                    <h4 style={styles.timelineTitle}>
                      Match Finished
                    </h4>

                    <p style={styles.timelineSub}>
                      Opponent HP reached 0
                    </p>
                  </div>

                  <span style={styles.timelineTime}>
                    01:42
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={styles.right}>
            {/* PERFORMANCE */}
            <div style={styles.sideCard}>
              <p style={styles.cardLabel}>
                PERFORMANCE
              </p>

              <div style={styles.performance}>
                <div style={styles.performanceRow}>
                  <span>Accuracy</span>
                  <strong>100%</strong>
                </div>

                <div style={styles.performanceRow}>
                  <span>Submissions</span>
                  <strong>4</strong>
                </div>

                <div style={styles.performanceRow}>
                  <span>Execution</span>
                  <strong>340ms</strong>
                </div>

                <div style={styles.performanceRow}>
                  <span>Memory</span>
                  <strong>12.4MB</strong>
                </div>
              </div>
            </div>

            {/* NEXT */}
            <div style={styles.sideCard}>
              <p style={styles.cardLabel}>
                NEXT ACTION
              </p>

              <button
                style={styles.primaryBtn}
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                Return Dashboard
              </button>

              <button
                style={styles.secondaryBtn}
                onClick={() =>
                  navigate("/room/new-match")
                }
              >
                Queue Again
              </button>

              <button style={styles.watchBtn}>
                Watch Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f3",
    fontFamily:
      "'Space Grotesk', 'Inter', system-ui",
    color: "#111",
    position: "relative",
  },

  noise: {
    position: "absolute",
    inset: 0,
    opacity: 0.03,
    backgroundImage:
      "radial-gradient(#000 0.5px, transparent 0.5px)",
    backgroundSize: "8px 8px",
    pointerEvents: "none",
  },

  topbar: {
    height: "78px",
    borderBottom: "1px solid #e5e5e5",
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 34px",
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
  },

  logo: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
    letterSpacing: "-2px",
  },

  topRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  live: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    color: "#666",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  exitBtn: {
    height: "46px",
    padding: "0 22px",
    borderRadius: "14px",
    border: "1px solid #dcdcdc",
    background: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  container: {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "42px 36px",
    transition: "0.5s ease",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "38px",
  },

  section: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#9ca3af",
    marginBottom: "10px",
  },

  mainResult: {
    margin: 0,
    fontSize: "96px",
    lineHeight: 0.9,
    letterSpacing: "-6px",
    fontWeight: "700",
  },

  heroSub: {
    marginTop: "18px",
    color: "#6b7280",
    fontSize: "16px",
    maxWidth: "580px",
    lineHeight: "1.8",
  },

  statusPill: {
    padding: "14px 22px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
    letterSpacing: "1px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.6fr",
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
    gap: "24px",
  },

  bigCard: {
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: "28px",
    padding: "30px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "26px",
  },

  cardLabel: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#9ca3af",
  },

  round: {
    height: "36px",
    padding: "0 16px",
    borderRadius: "999px",
    background: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "700",
  },

  players: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: "22px",
  },

  player: {
    border: "1px solid #ededed",
    borderRadius: "22px",
    padding: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "18px",
  },

  avatarBlue: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    background: "#185FA5",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "700",
    fontSize: "24px",
  },

  avatarRed: {
    width: "68px",
    height: "68px",
    borderRadius: "50%",
    background: "#7f1d1d",
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "700",
    fontSize: "24px",
  },

  playerName: {
    margin: 0,
    fontSize: "22px",
    letterSpacing: "-1px",
  },

  youBadge: {
    marginTop: "8px",
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#EEF5FF",
    color: "#185FA5",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  enemyBadge: {
    marginTop: "8px",
    display: "inline-flex",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#FCEBEB",
    color: "#791F1F",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "1px",
  },

  hpBox: {
    textAlign: "center",
  },

  hpText: {
    fontSize: "11px",
    color: "#999",
    letterSpacing: "1px",
  },

  hp: {
    margin: "6px 0 0",
    fontSize: "42px",
    letterSpacing: "-2px",
  },

  vs: {
    fontSize: "18px",
    color: "#999",
    fontWeight: "700",
  },

  statsGrid: {
    marginTop: "26px",
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0,1fr))",
    gap: "18px",
  },

  statCard: {
    border: "1px solid #ececec",
    borderRadius: "20px",
    padding: "18px",
  },

  smallLabel: {
    fontSize: "11px",
    letterSpacing: "1.6px",
    color: "#9ca3af",
    marginBottom: "10px",
  },

  statValue: {
    margin: 0,
    fontSize: "24px",
    letterSpacing: "-1px",
  },

  timelineCard: {
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: "28px",
    padding: "30px",
  },

  timelineTop: {
    marginBottom: "24px",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  timelineRow: {
    display: "grid",
    gridTemplateColumns: "16px 1fr auto",
    gap: "16px",
    alignItems: "flex-start",
  },

  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#111",
    marginTop: "6px",
  },

  timelineDotGreen: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#16a34a",
    marginTop: "6px",
  },

  timelineTitle: {
    margin: 0,
    fontSize: "16px",
  },

  timelineSub: {
    marginTop: "6px",
    color: "#6b7280",
    lineHeight: "1.7",
    fontSize: "14px",
  },

  timelineTime: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  sideCard: {
    background: "#fff",
    border: "1px solid #ececec",
    borderRadius: "28px",
    padding: "28px",
  },

  performance: {
    marginTop: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  performanceRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "15px",
  },

  primaryBtn: {
    width: "100%",
    height: "60px",
    borderRadius: "18px",
    border: "none",
    background: "#111",
    color: "#fff",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "22px",
  },

  secondaryBtn: {
    width: "100%",
    height: "56px",
    borderRadius: "18px",
    border: "1px solid #dcdcdc",
    background: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "14px",
  },

  watchBtn: {
    width: "100%",
    height: "56px",
    borderRadius: "18px",
    border: "none",
    background: "#f5f5f5",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    marginTop: "14px",
  },
};