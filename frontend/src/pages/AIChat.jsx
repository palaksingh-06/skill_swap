import { useState, useRef, useEffect } from "react";
import axios from "axios";

const WELCOME = {
  id: "welcome",
  role: "bot",
  text: `👋 Hi! I'm Skill Buddy, your learning assistant.\n\nI can help you with:\n• 🔍 Finding the right skills to learn\n• 💡 DSA & programming doubts\n• 📅 Session tips & preparation\n• 🗺️ Learning roadmaps\n\nWhat would you like to explore today?`,
};

const AIChat = ({ onClose }) => {
  const [msg, setMsg]                   = useState("");
  const [chat, setChat]                 = useState([WELCOME]);
  const [loading, setLoading]           = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [hiddenHistory, setHiddenHistory]   = useState([]); // ✅ for AI context only, not shown
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ✅ Load history silently — only for AI memory, not shown to user
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/ai/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.length > 0) {
          const loaded = res.data.map((m) => ({
            id: m._id,
            role: m.role,
            text: m.text,
          }));
          setHiddenHistory(loaded); // ✅ store silently, don't touch chat state
        }
        // chat stays as [WELCOME] — clean fresh UI every time
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, []);

  // ✅ Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // ✅ Focus input on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!msg.trim() || loading) return;

    const userMsg = { id: Date.now(), role: "user", text: msg.trim() };
    setChat((prev) => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // ✅ Combine hidden history + current visible chat for AI context
      const history = [...hiddenHistory, ...chat]
        .filter((c) => c.id !== "welcome")
        .slice(-10) // last 10 messages only — avoid token overflow
        .map((c) => ({ role: c.role, text: c.text }));

      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        { message: userMsg.text, history },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botReply = res.data.reply;

      setChat((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: botReply },
      ]);

      // ✅ Keep hiddenHistory growing so context stays across messages
      setHiddenHistory((prev) => [
        ...prev,
        { role: "user", text: userMsg.text },
        { role: "bot",  text: botReply },
      ]);

    } catch {
      setChat((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "⚠️ Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    }

    setLoading(false);
  };

  const suggestions = [
    "How do I learn React?",
    "DSA roadmap for beginners",
    "How to prepare for sessions?",
  ];

  const showSuggestions = chat.length === 1 && chat[0].id === "welcome";

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col border z-50 overflow-hidden">

      {/* HEADER */}
      <div className="p-3 border-b flex justify-between items-center bg-teal-500 text-white rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-teal-500 font-bold text-sm">
            AI
          </div>
          <div>
            <p className="font-semibold text-sm">Skill Buddy</p>
            <p className="text-xs opacity-80">Always here to help</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 text-lg"
          >
            ✕
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">

        {historyLoading ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        ) : (
          <>
            {chat.map((c) => (
              <div
                key={c.id}
                className={`flex ${c.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {c.role === "bot" && (
                  <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed
                    ${c.role === "user"
                      ? "bg-teal-500 text-white rounded-br-sm"
                      : c.isError
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-white text-gray-800 shadow-sm border rounded-bl-sm"
                    }`}
                >
                  {c.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0">
                  AI
                </div>
                <div className="bg-white border shadow-sm px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {showSuggestions && !loading && (
              <div className="flex flex-col gap-2 mt-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setMsg(s); inputRef.current?.focus(); }}
                    className="text-left text-xs text-teal-600 border border-teal-200 bg-teal-50 rounded-xl px-3 py-2 hover:bg-teal-100 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          ref={inputRef}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask about skills, DSA..."
          className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 text-sm"
          disabled={loading || historyLoading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !msg.trim() || historyLoading}
          className="bg-teal-500 text-white px-4 rounded-xl hover:bg-teal-600 text-sm disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;