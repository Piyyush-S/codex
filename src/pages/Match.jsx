import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Match() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [time, setTime] = useState(300);

  const [code, setCode] = useState(`function solve(a, b) {
  return a + b;
}`);

  const [role] = useState("Attacker");

  const [myHP, setMyHP] = useState(3);
  const [oppHP, setOppHP] = useState(3);

  const [submitted, setSubmitted] = useState(false);

  const [language, setLanguage] = useState("JavaScript");

  const [chatInput, setChatInput] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "shadowByte",
      text: "glhf",
    },
  ]);

  const [opponentName] = useState("shadowByte");

  const timerRef = useRef(null);
  const endedRef = useRef(false);

  /* ================= AUTH ================= */

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login");
      } else {
        setUser(u);
      }
    });

    return () => unsub();
  }, [navigate]);

  /* ================= TIMER ================= */

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          safeEndMatch("timeout");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  /* ================= FORMAT TIMER ================= */

  const formatTime = () => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  /* ================= USERNAME ================= */

  const username =
    user?.displayName ||
    localStorage.getItem("username") ||
    user?.email?.split("@")[0] ||
    "Player";

  /* ================= CHECK SOLUTION ================= */

  const checkSolution = () => {
    return code.includes("+");
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = () => {
    if (submitted || endedRef.current) return;

    setSubmitted(true);

    const correct = checkSolution();

    if (correct) {
      setOppHP((prev) => {
        const hp = prev - 1;

        if (hp <= 0) {
          safeEndMatch("win");
        }

        return hp;
      });
    } else {
      setMyHP((prev) => {
        const hp = prev - 1;

        if (hp <= 0) {
          safeEndMatch("lose");
        }

        return hp;
      });
    }

    setTimeout(() => {
      setSubmitted(false);
    }, 1400);
  };

  /* ================= END ================= */

  const safeEndMatch = (result) => {
    if (endedRef.current) return;

    endedRef.current = true;

    clearInterval(timerRef.current);

    setTimeout(() => {
      navigate(`/result/${roomId}`, {
        state: {
          result,
          user: username,
          myHP,
          oppHP,
        },
      });
    }, 400);
  };

  /* ================= CHAT ================= */

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: username,
        text: chatInput,
      },
    ]);

    setChatInput("");

    // fake opponent reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: opponentName,
          text: "typing fast huh",
        },
      ]);
    }, 1800);
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      {/* TOPBAR */}

      <div style={styles.topbar}>
        <div style={styles.logoWrap}>
          <div style={styles.dot}></div>
          <h2 style={styles.logo}>Codex</h2>
        </div>

        <div style={styles.matchInfo}>
          <span style={styles.matchBadge}>Ranked Match</span>
          <span style={styles.roomText}>Room: {roomId}</span>
        </div>
      </div>

      {/* MAIN */}

      <div style={styles.container}>
        {/* LEFT */}

        <div style={styles.left}>
          <div style={styles.problemCard}>
            <div style={styles.problemTop}>
              <div>
                <p style={styles.label}>PROBLEM</p>

                <h2 style={styles.problemTitle}>
                  Add Two Numbers
                </h2>
              </div>

              <div style={styles.difficulty}>
                Easy
              </div>
            </div>

            <p style={styles.problemDesc}>
              Given two integers, return their sum.
            </p>

            <div style={styles.exampleBox}>
              <p>Input: 2 3</p>
              <p>Output: 5</p>
            </div>

            {/* LANGUAGE */}

            <div style={styles.languageSection}>
              <p style={styles.label}>LANGUAGE</p>

              <div style={styles.languageScroll}>
                {[
                  "JavaScript",
                  "Python",
                  "C++",
                  "Java",
                  "Go",
                  "Rust",
                  "TypeScript",
                ].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    style={{
                      ...styles.langBtn,
                      background:
                        language === lang
                          ? "#185FA5"
                          : "#fff",

                      color:
                        language === lang
                          ? "#fff"
                          : "#444",

                      border:
                        language === lang
                          ? "1px solid #185FA5"
                          : "1px solid #e5e7eb",
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CHAT */}

          <div style={styles.chatCard}>
            <div style={styles.chatTop}>
              <p style={styles.label}>MATCH CHAT</p>
            </div>

            <div style={styles.chatMessages}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.message,
                    alignSelf:
                      msg.sender === username
                        ? "flex-end"
                        : "flex-start",

                    background:
                      msg.sender === username
                        ? "#185FA5"
                        : "#f3f4f6",

                    color:
                      msg.sender === username
                        ? "#fff"
                        : "#111",
                  }}
                >
                  <span style={styles.messageSender}>
                    {msg.sender}
                  </span>

                  {msg.text}
                </div>
              ))}
            </div>

            <div style={styles.chatInputWrap}>
              <input
                value={chatInput}
                onChange={(e) =>
                  setChatInput(e.target.value)
                }
                placeholder="Message opponent..."
                style={styles.chatInput}
              />

              <button
                onClick={sendMessage}
                style={styles.sendBtn}
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* CENTER */}

        <div style={styles.center}>
          {/* MATCH HEADER */}

          <div style={styles.matchHeader}>
            <div style={styles.playerCard}>
              <div style={styles.avatar}>
                {username[0]?.toUpperCase()}
              </div>

              <div>
                <p style={styles.playerName}>
                  {username}
                </p>

                <span style={styles.attackerBadge}>
                  {role}
                </span>
              </div>
            </div>

            <div style={styles.vsSection}>
              <div style={styles.timer}>
                {formatTime()}
              </div>

              <span style={styles.vs}>VS</span>
            </div>

            <div style={styles.playerCard}>
              <div style={styles.avatarRed}>
                {opponentName[0]?.toUpperCase()}
              </div>

              <div>
                <p style={styles.playerName}>
                  {opponentName}
                </p>

                <span style={styles.defenderBadge}>
                  Defender
                </span>
              </div>
            </div>
          </div>

          {/* HP */}

          <div style={styles.hpRow}>
            <div style={styles.hpCard}>
              <p>Your HP</p>
              <h2>{myHP}</h2>
            </div>

            <div style={styles.hpCard}>
              <p>{opponentName} HP</p>
              <h2>{oppHP}</h2>
            </div>
          </div>

          {/* CODE */}

          <div style={styles.editorWrap}>
            <div style={styles.editorTop}>
              <div style={styles.editorDots}>
                <div style={styles.red}></div>
                <div style={styles.yellow}></div>
                <div style={styles.green}></div>
              </div>

              <span style={styles.languageText}>
                {language}
              </span>
            </div>

            <textarea
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              style={styles.editor}
            />
          </div>

          {/* ACTIONS */}

          <div style={styles.actions}>
            <button
              style={{
                ...styles.submitBtn,
                opacity: submitted ? 0.7 : 1,
              }}
              onClick={handleSubmit}
              disabled={submitted}
            >
              {submitted
                ? "Submitting..."
                : "Submit Solution"}
            </button>

            <button style={styles.secondaryBtn}>
              Run Code
            </button>
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
    background: "#f5f7fb",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  topbar: {
    height: "72px",
    background: "#fff",
    borderBottom: "1px solid #ececec",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
  },

  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#185FA5",
  },

  logo: {
    margin: 0,
    fontSize: "20px",
  },

  matchInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  matchBadge: {
    background: "#EEF5FF",
    color: "#185FA5",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  roomText: {
    fontSize: "13px",
    color: "#666",
  },

  container: {
    display: "flex",
    gap: "24px",
    padding: "24px",
    height: "calc(100vh - 72px)",
  },

  left: {
    width: "340px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  problemCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  problemTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: "11px",
    color: "#9ca3af",
    letterSpacing: "1px",
    marginBottom: "6px",
  },

  problemTitle: {
    margin: 0,
    fontSize: "24px",
  },

  difficulty: {
    background: "#EAF3DE",
    color: "#27500A",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
  },

  problemDesc: {
    color: "#555",
    lineHeight: "1.7",
    marginTop: "16px",
  },

  exampleBox: {
    marginTop: "20px",
    background: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #edf2f7",
    lineHeight: "1.8",
    fontSize: "14px",
  },

  languageSection: {
    marginTop: "24px",
  },

  languageScroll: {
    display: "flex",
    overflowX: "auto",
    gap: "10px",
    paddingBottom: "6px",
  },

  langBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    whiteSpace: "nowrap",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  chatCard: {
    background: "#fff",
    borderRadius: "20px",
    padding: "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  chatTop: {
    marginBottom: "14px",
  },

  chatMessages: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
  },

  message: {
    maxWidth: "80%",
    padding: "12px",
    borderRadius: "14px",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  messageSender: {
    fontSize: "11px",
    opacity: 0.7,
  },

  chatInputWrap: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },

  chatInput: {
    flex: 1,
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "12px",
    outline: "none",
    fontSize: "13px",
  },

  sendBtn: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },

  matchHeader: {
    background: "#fff",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  playerCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  avatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#185FA5",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  avatarRed: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#791F1F",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
  },

  playerName: {
    margin: 0,
    fontWeight: "600",
    fontSize: "15px",
  },

  attackerBadge: {
    display: "inline-block",
    marginTop: "5px",
    background: "#EEEDFE",
    color: "#3C3489",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "600",
  },

  defenderBadge: {
    display: "inline-block",
    marginTop: "5px",
    background: "#FCEBEB",
    color: "#791F1F",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "600",
  },

  vsSection: {
    textAlign: "center",
  },

  timer: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "6px",
  },

  vs: {
    color: "#999",
    fontSize: "13px",
  },

  hpRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px",
  },

  hpCard: {
    background: "#fff",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  editorWrap: {
    flex: 1,
    background: "#111827",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  editorTop: {
    height: "54px",
    background: "#0f172a",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px",
  },

  editorDots: {
    display: "flex",
    gap: "8px",
  },

  red: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#ef4444",
  },

  yellow: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#f59e0b",
  },

  green: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  languageText: {
    color: "#9ca3af",
    fontSize: "13px",
  },

  editor: {
    flex: 1,
    width: "100%",
    background: "#111827",
    color: "#f8fafc",
    border: "none",
    outline: "none",
    resize: "none",
    padding: "24px",
    fontSize: "14px",
    lineHeight: "1.7",
    fontFamily: "monospace",
  },

  actions: {
    display: "flex",
    gap: "14px",
  },

  submitBtn: {
    flex: 1,
    padding: "16px",
    borderRadius: "14px",
    border: "none",
    background: "#185FA5",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },

  secondaryBtn: {
    width: "180px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
};