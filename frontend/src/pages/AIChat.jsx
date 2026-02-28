import { useState } from "react";
import axios from "axios";

const AIChat = () => {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!msg.trim()) return;

    const userMsg = { role: "user", text: msg };
    setChat(prev => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ai/chat",
        { message: userMsg.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChat(prev => [
        ...prev,
        { role: "bot", text: res.data.reply }
      ]);
    } catch {
      setChat(prev => [
        ...prev,
        { role: "bot", text: "⚠️ AI error" }
      ]);
    }

    setLoading(false);
  };

  return (
     <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col border z-50">
      
      {/* HEADER */}
      <div className="p-3 border-b font-semibold text-gray-700">
        Skill Buddy
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chat.map((c, i) => (
          <div
            key={i}
            className={`flex ${
              c.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap ${
                c.role === "user"
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {c.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-xs text-gray-400">AI is typing...</div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2 bg-white">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about skills, DSA..."
          className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 text-sm"
        />

        <button
          onClick={sendMessage}
          className="bg-teal-500 text-white px-4 rounded-xl hover:bg-teal-600 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChat;