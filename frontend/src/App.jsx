import { useState, useRef, useEffect } from "react";

// ── Interactive Quiz Component ────────────────────────────────
function QuizCard({ quiz }) {
  const [selected, setSelected] = useState({});
  const [revealed, setRevealed] = useState({});
  const [score, setScore] = useState(null);

  const handleSelect = (qId, letter) => {
    if (revealed[qId]) return;
    setSelected((prev) => ({ ...prev, [qId]: letter }));
  };

  const handleReveal = (qId) => {
    if (!selected[qId]) return;
    setRevealed((prev) => ({ ...prev, [qId]: true }));
  };

  const handleFinish = () => {
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (selected[q.id] === q.reponse) correct++;
    });
    setScore(correct);
  };

  const allAnswered = quiz.questions.every((q) => selected[q.id]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ background: "linear-gradient(135deg,#7c3aed,#9F94E8)", borderRadius: "12px 12px 0 0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>📝</span>
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Quiz : {quiz.sujet}</div>
          <div style={{ color: "#ddd6fe", fontSize: 11 }}>{quiz.questions.length} questions · Choisissez une option puis "Vérifier"</div>
        </div>
        {score !== null && (
          <div style={{ marginLeft: "auto", background: "#fff", color: "#7c3aed", fontWeight: 800, fontSize: 14, padding: "4px 14px", borderRadius: 20 }}>
            {score}/{quiz.questions.length}
          </div>
        )}
      </div>

      <div style={{ background: "#fafafa", border: "1px solid #e8e6f0", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
        {quiz.questions.map((q) => {
          const isRevealed = revealed[q.id];
          const userPick = selected[q.id];
          return (
            <div key={q.id} style={{ background: "#fff", border: "1px solid #e8e6f0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 10 }}>
                <span style={{ background: "#7c3aed", color: "#fff", borderRadius: "50%", width: 22, height: 22, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginRight: 8 }}>
                  {q.id}
                </span>
                {q.question}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(q.options).map(([letter, text]) => {
                  let bg = "#f8f8fc", border = "1px solid #e8e6f0", color = "#333";
                  if (isRevealed) {
                    if (letter === q.reponse) { bg = "#dcfce7"; border = "1.5px solid #22c55e"; color = "#15803d"; }
                    else if (letter === userPick) { bg = "#fee2e2"; border = "1.5px solid #ef4444"; color = "#b91c1c"; }
                  } else if (letter === userPick) {
                    bg = "#ede9fb"; border = "1.5px solid #7c3aed"; color = "#7c3aed";
                  }
                  return (
                    <div key={letter} onClick={() => handleSelect(q.id, letter)}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: bg, border, borderRadius: 8, padding: "7px 12px", cursor: isRevealed ? "default" : "pointer", transition: "all 0.15s", fontSize: 13, color, fontWeight: (letter === userPick || (isRevealed && letter === q.reponse)) ? 600 : 400 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: letter === userPick ? "#7c3aed" : "#e8e6f0", color: letter === userPick ? "#fff" : "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, transition: "all 0.15s" }}>
                        {letter}
                      </span>
                      {text}
                      {isRevealed && letter === q.reponse && <span style={{ marginLeft: "auto" }}>✅</span>}
                      {isRevealed && letter === userPick && letter !== q.reponse && <span style={{ marginLeft: "auto" }}>❌</span>}
                    </div>
                  );
                })}
              </div>
              {!isRevealed ? (
                <button onClick={() => handleReveal(q.id)} disabled={!userPick}
                  style={{ marginTop: 10, background: userPick ? "#7c3aed" : "#ccc", color: "#fff", border: "none", borderRadius: 8, padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: userPick ? "pointer" : "not-allowed" }}>
                  Vérifier
                </button>
              ) : (
                <div style={{ marginTop: 10, background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6d28d9" }}>
                  💡 {q.explication}
                </div>
              )}
            </div>
          );
        })}
        {score === null ? (
          <button onClick={handleFinish} disabled={!allAnswered}
            style={{ background: allAnswered ? "linear-gradient(135deg,#7c3aed,#9F94E8)" : "#ccc", color: "#fff", border: "none", borderRadius: 10, padding: "10px", fontSize: 14, fontWeight: 700, cursor: allAnswered ? "pointer" : "not-allowed" }}>
            Voir mon score
          </button>
        ) : (
          <div style={{ background: score === quiz.questions.length ? "#dcfce7" : score >= quiz.questions.length / 2 ? "#fef9c3" : "#fee2e2", border: "1px solid #e8e6f0", borderRadius: 10, padding: "14px", textAlign: "center", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>
            {score === quiz.questions.length ? "🎉 Parfait !" : score >= quiz.questions.length / 2 ? "👍 Bien joué !" : "📚 Révisez encore !"} Score : {score}/{quiz.questions.length}
          </div>
        )}
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { icon: "⚙️", text: "Comment créer un composant Angular ?" },
  { icon: "🌱", text: "Explique les annotations Spring Boot" },
  { icon: "📝", text: "Génère un quiz sur Angular" },
  { icon: "🔗", text: "Comment fonctionne l'injection de dépendances ?" },
];

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#7C6FCD",
            animation: "bounce 1.2s infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </span>
  );
}

function ToolBadge({ name }) {
  const labels = {
    chercher_dans_documents: { label: "RAG Search", color: "#0f766e", bg: "#f0fdf4" },
    generer_quiz: { label: "Quiz Generator", color: "#7c3aed", bg: "#f5f3ff" },
  };
  const info = labels[name] || { label: name, color: "#555", bg: "#f3f4f6" };
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 20,
        background: info.bg,
        color: info.color,
        border: `1px solid ${info.color}30`,
        letterSpacing: 0.3,
      }}
    >
      🔧 {info.label}
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  const isQuiz = !isUser && msg.quiz;

  return (
    <div style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", gap: 10, marginBottom: 20, alignItems: "flex-start" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", background: isUser ? "linear-gradient(135deg,#7C6FCD,#9F94E8)" : "linear-gradient(135deg,#0f766e,#14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, color: "#fff", fontWeight: 700 }}>
        {isUser ? "U" : "AI"}
      </div>
      <div style={{ maxWidth: isQuiz ? "90%" : "75%", minWidth: 60, width: isQuiz ? "90%" : undefined }}>
        {msg.toolUsed && !isQuiz && (
          <div style={{ marginBottom: 6 }}>
            <ToolBadge name={msg.toolUsed} />
          </div>
        )}
        {isQuiz ? (
          <QuizCard quiz={msg.quiz} />
        ) : (
          <div style={{ background: isUser ? "linear-gradient(135deg,#7C6FCD,#9F94E8)" : "#f8f8fc", color: isUser ? "#fff" : "#1a1a2e", padding: "10px 14px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.65, border: isUser ? "none" : "1px solid #e8e6f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {msg.content || <TypingDots />}
          </div>
        )}
        <div style={{ fontSize: 11, color: "#aaa", marginTop: 4, textAlign: isUser ? "right" : "left" }}>
          {msg.time}
        </div>
      </div>
    </div>
  );
}

function ArchitectureDiagram() {
  const steps = [
    { icon: "👤", label: "User", color: "#7C6FCD" },
    { icon: "🤖", label: "LLM (LLaMA3)", color: "#0f766e" },
    { icon: "🔍", label: "RAG Tool", color: "#d97706" },
    { icon: "🗄️", label: "ChromaDB", color: "#1d4ed8" },
    { icon: "📄", label: "PDF Docs", color: "#be185d" },
  ];
  return (
    <div
      style={{
        background: "#f8f8fc",
        borderRadius: 12,
        padding: "12px 16px",
        margin: "0 0 16px",
        border: "1px solid #e8e6f0",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: 1, marginBottom: 10 }}>
        PIPELINE ARCHITECTURE
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap", rowGap: 8 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: s.color + "18",
                border: `1px solid ${s.color}40`,
                borderRadius: 8,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                color: s.color,
                whiteSpace: "nowrap",
              }}
            >
              {s.icon} {s.label}
            </div>
            {i < steps.length - 1 && (
              <span style={{ color: "#ccc", fontSize: 16, padding: "0 4px" }}>→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RAGInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showArch, setShowArch] = useState(false);
  const [stats, setStats] = useState({ queries: 0, toolCalls: 0, quizzes: 0 });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const now = () =>
    new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: question, time: now() };
    const thinkingMsg = { role: "assistant", content: "", time: now(), thinking: true };
    setMessages((prev) => [...prev, userMsg, thinkingMsg]);

    try {
      // ── Single fetch to Flask — Flask calls run_agent() which handles everything ──
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Server error");
      }

      const data = await res.json();
      const finalContent = data.answer;
      const toolUsed = data.tool_used || null;
      const quiz = data.quiz || null;

      // Update stats
      setStats((s) => ({
        queries: s.queries + 1,
        toolCalls: toolUsed ? s.toolCalls + 1 : s.toolCalls,
        quizzes: toolUsed === "generer_quiz" ? s.quizzes + 1 : s.quizzes,
      }));

      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: finalContent, time: now(), toolUsed, quiz }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { role: "assistant", content: "❌ Erreur : " + err.message, time: now() }
            : m
        )
      );
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        background: "#f0eef8",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes bounce {
          0%,80%,100%{transform:translateY(0)}
          40%{transform:translateY(-6px)}
        }
        textarea:focus { outline: none; }
        .suggest-btn:hover { background: #ede9fb !important; border-color: #9F94E8 !important; }
        .send-btn:hover { background: #5a50aa !important; }
        .send-btn:active { transform: scale(0.96); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
      `}</style>

      {/* ── Sidebar ── */}
      <div
        style={{
          width: 240,
          background: "#1a1a2e",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            🧠 RAG Agent
          </div>
          <div style={{ fontSize: 11, color: "#9F94E8", marginTop: 2 }}>
            Groq · LLaMA3 · ChromaDB
          </div>
        </div>

        <div
          style={{
            background: "#ffffff0d",
            borderRadius: 10,
            padding: "12px",
            border: "1px solid #ffffff15",
          }}
        >
          <div style={{ fontSize: 11, color: "#9F94E8", fontWeight: 700, marginBottom: 10 }}>
            SESSION STATS
          </div>
          {[
            { label: "Queries", value: stats.queries, icon: "💬" },
            { label: "Tool calls", value: stats.toolCalls, icon: "🔧" },
            { label: "Quizzes", value: stats.quizzes, icon: "📝" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#aaa" }}>{s.icon} {s.label}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                  background: "#9F94E820",
                  padding: "0 8px",
                  borderRadius: 20,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#9F94E8", fontWeight: 700, marginBottom: 8 }}>
            TOOLS AVAILABLE
          </div>
          {[
            { short: "RAG Search", desc: "Vector similarity search", color: "#0f766e" },
            { short: "Quiz Generator", desc: "QCM from context", color: "#7c3aed" },
          ].map((t) => (
            <div
              key={t.short}
              style={{
                background: "#ffffff0d",
                border: "1px solid #ffffff15",
                borderRadius: 8,
                padding: "8px 10px",
                marginBottom: 6,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.short}</div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{t.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowArch((v) => !v)}
          style={{
            background: showArch ? "#9F94E830" : "transparent",
            border: "1px solid #9F94E840",
            borderRadius: 8,
            color: "#9F94E8",
            fontSize: 12,
            padding: "8px 12px",
            cursor: "pointer",
            textAlign: "left",
            fontWeight: 600,
          }}
        >
          {showArch ? "▼" : "▶"} Architecture
        </button>

        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 10, color: "#555", textAlign: "center", lineHeight: 1.5 }}>
          Angular · Spring Boot<br />Projet IA Générative 2025
        </div>
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Header */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1px solid #e8e6f0",
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 0 3px #22c55e30",
            }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
            Assistant RAG — Angular & Spring Boot
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "#888",
              background: "#f3f4f6",
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            LLaMA-3.3-70b · Groq
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {showArch && <ArchitectureDiagram />}

          {messages.length === 0 && (
            <div style={{ textAlign: "center", paddingTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>
                RAG Agent prêt
              </div>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 32 }}>
                Posez une question technique ou demandez un quiz
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="suggest-btn"
                    onClick={() => sendMessage(s.text)}
                    style={{
                      background: "#fff",
                      border: "1px solid #e8e6f0",
                      borderRadius: 10,
                      padding: "10px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 13,
                      color: "#1a1a2e",
                      transition: "all 0.15s",
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ marginRight: 6 }}>{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ background: "#fff", borderTop: "1px solid #e8e6f0", padding: "16px 24px" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-end",
              background: "#f8f8fc",
              border: "1.5px solid #e8e6f0",
              borderRadius: 14,
              padding: "10px 10px 10px 16px",
            }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKey}
              placeholder="Posez votre question sur Angular ou Spring Boot…"
              style={{
                flex: 1,
                resize: "none",
                border: "none",
                background: "transparent",
                fontSize: 14,
                lineHeight: 1.5,
                color: "#1a1a2e",
                fontFamily: "inherit",
                overflow: "hidden",
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? "#ccc" : "#7C6FCD",
                border: "none",
                borderRadius: 10,
                width: 36,
                height: 36,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                color: "#fff",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
                flexShrink: 0,
              }}
            >
              {loading ? "⏳" : "↑"}
            </button>
          </div>
          <div style={{ fontSize: 11, color: "#bbb", marginTop: 6, textAlign: "center" }}>
            Enter pour envoyer · Shift+Enter pour sauter une ligne
          </div>
        </div>
      </div>
    </div>
  );
}