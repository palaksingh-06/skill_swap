// import {
//   StreamVideo,
//   StreamCall,
//   CallControls,
//   SpeakerLayout
// } from "@stream-io/video-react-sdk";

// import { StreamVideoClient } from "@stream-io/video-client";
// import { useEffect, useState, useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// function VideoCall() {
//   const { roomId } = useParams();
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const [client, setClient] = useState(null);
//   const [call, setCall] = useState(null);

//   useEffect(() => {
//     if (!user) return;

//     const initVideo = async () => {
//       const res = await fetch("http://localhost:5000/api/video/token", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userId: user._id })
//       });

//       const data = await res.json();

//       const videoClient = new StreamVideoClient({
//         apiKey: import.meta.env.VITE_STREAM_API_KEY,
//         user: {
//           id: user._id,
//           name: user.name || "User"
//         },
//         token: data.token
//       });

//       const videoCall = videoClient.call("default", roomId);
//       await videoCall.join({ create: true });

//       // ✅ Enable camera and mic on join
//       await videoCall.camera.enable();
//       await videoCall.microphone.enable();

//       setClient(videoClient);
//       setCall(videoCall);
//     };

//     initVideo();

//     // ✅ Cleanup on unmount
//     return () => {
//       call?.leave();
//     };
//   }, [roomId, user]);

//   const leaveCall = async () => {
//     if (call) await call.leave();
//     navigate("/sessions");
//   };

//   if (!client || !call) return (
//     <div className="h-screen flex items-center justify-center text-xl">
//       Joining call...
//     </div>
//   );

//   return (
//     <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>

//       {/* Leave Call button */}
//       <button
//         onClick={leaveCall}
//         className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//       >
//         Leave Call
//       </button>

//       <StreamVideo client={client}>
//         <StreamCall call={call}>

//           {/* ✅ Video area */}
//           <div style={{ flex: 1, position: "relative" }}>
//             <SpeakerLayout />
//           </div>

//           {/* ✅ Controls bar at bottom */}
//           <div style={{ display: "flex", justifyContent: "center", padding: "12px", background: "#1a1a1a" }}>
//             <CallControls />
//           </div>

//         </StreamCall>
//       </StreamVideo>

//     </div>
//   );
// }

// export default VideoCall;



import {
  StreamVideo,
  StreamCall,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { StreamVideoClient } from "@stream-io/video-client";
import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { AuthContext } from "../context/AuthContext";

// ─── Emoji list ───────────────────────────────────────────
const EMOJIS = ["👍", "❤️", "😂", "😮", "👏", "🎉", "🔥", "😢"];

// ─── Floating Emoji ───────────────────────────────────────
function FloatingEmoji({ emoji, id, sender, onDone }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-50 flex flex-col items-center select-none"
      style={{
        left: `${30 + Math.random() * 40}%`,
        bottom: "120px",
        animation: "floatUp 2.8s ease-out forwards",
      }}
    >
      <span className="text-4xl">{emoji}</span>
      <span className="text-xs text-white/70 bg-black/40 px-2 py-0.5 rounded-full mt-1">
        {sender}
      </span>
    </div>
  );
}

// ─── Control Button ───────────────────────────────────────
function CtrlBtn({ onClick, active, danger, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex items-center justify-center w-12 h-12 rounded-2xl
        transition-all duration-200 hover:scale-110 active:scale-95
        ${danger
          ? "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/40"
          : active
            ? "bg-teal-500/80 text-white hover:bg-teal-500"
            : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

// ─── Custom Controls ──────────────────────────────────────
function CustomControls({ onLeave, chatOpen, onToggleChat, onSendEmoji }) {
  const call = useCall();
  const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks();
  const { isMute: micMuted }     = useMicrophoneState();
  const { isMute: camOff }       = useCameraState();
  const { status: screenStatus } = useScreenShareState();
  const isSharing = screenStatus === "enabled";

  const [showEmojis,  setShowEmojis]  = useState(false);
  const [screenError, setScreenError] = useState(null);

  const toggleMic = async () => {
    try {
      if (micMuted) await call.microphone.enable();
      else await call.microphone.disable();
    } catch (e) { console.error("Mic error:", e); }
  };

  const toggleCam = async () => {
    try {
      if (camOff) await call.camera.enable();
      else await call.camera.disable();
    } catch (e) { console.error("Cam error:", e); }
  };

  // ✅ Fixed screen share
  const toggleScreen = async () => {
    setScreenError(null);
    try {
      if (isSharing) {
        await call.screenShare.disable();
      } else {
        await call.screenShare.enable();
      }
    } catch (e) {
      if (e.name !== "NotAllowedError") {
        setScreenError("Screen share failed. Please try again.");
      }
      console.error("Screen share error:", e);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-950/95
      backdrop-blur-xl border-t border-white/5">

      {/* Screen sharing indicator */}
      {isSharing && (
        <div className="flex items-center gap-2 py-1.5 px-4 w-full
          justify-center bg-teal-500/10 border-b border-teal-500/20">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-teal-400 text-xs font-medium">
            You are sharing your screen
          </span>
        </div>
      )}

      {/* Screen share error */}
      {screenError && (
        <p className="text-xs text-red-400 py-1 animate-pulse">{screenError}</p>
      )}

      <div className="flex items-center justify-center gap-3 px-6 py-4">

        {/* Mic */}
        <CtrlBtn onClick={toggleMic} active={!micMuted}
          title={micMuted ? "Unmute" : "Mute"}>
          {micMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923
                3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3
                3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </CtrlBtn>

        {/* Camera */}
        <CtrlBtn onClick={toggleCam} active={!camOff}
          title={camOff ? "Start Camera" : "Stop Camera"}>
          {camOff ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15
                14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3l18 18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15
                14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </CtrlBtn>

        {/* Screen Share */}
        <CtrlBtn onClick={toggleScreen} active={isSharing}
          title={isSharing ? "Stop Sharing" : "Share Screen"}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0
              002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </CtrlBtn>

        {/* Emoji Picker */}
        <div className="relative">
          <CtrlBtn onClick={() => setShowEmojis(v => !v)}
            active={showEmojis} title="Reactions">
            <span className="text-xl">😊</span>
          </CtrlBtn>
          {showEmojis && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2
              bg-gray-900 border border-white/10 rounded-2xl p-3
              grid grid-cols-4 gap-2 shadow-2xl z-50 min-w-max">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => { onSendEmoji(e); setShowEmojis(false); }}
                  className="text-2xl w-10 h-10 flex items-center justify-center
                    rounded-xl hover:bg-white/10 hover:scale-125 transition-all"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat */}
        <CtrlBtn onClick={onToggleChat} active={chatOpen} title="Chat">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863
              9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3
              12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </CtrlBtn>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Leave */}
        <CtrlBtn onClick={onLeave} danger title="Leave Call">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0
              01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </CtrlBtn>
      </div>
    </div>
  );
}

// ─── In-Call Chat ─────────────────────────────────────────
function InCallChat({ messages, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex flex-col w-72 h-full bg-gray-950/98
      border-l border-white/5 shrink-0">

      <div className="px-4 py-3 border-b border-white/5">
        <h3 className="text-white font-semibold text-sm">In-Call Chat</h3>
        <p className="text-white/40 text-xs">{messages.length} messages</p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full
            text-white/30 text-center gap-2 mt-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863
                9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3
                12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Say something!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i}
            className={`flex flex-col ${msg.self ? "items-end" : "items-start"}`}>
            <span className="text-white/40 text-xs mb-1">{msg.sender}</span>
            <div className={`px-3 py-2 rounded-2xl text-sm max-w-[85%]
              break-words leading-relaxed
              ${msg.self
                ? "bg-teal-500 text-white rounded-br-sm"
                : "bg-white/10 text-white rounded-bl-sm"
              }`}>
              {msg.text}
            </div>
            <span className="text-white/25 text-xs mt-1">{msg.time}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-4 pt-2 border-t border-white/5">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 text-white text-sm rounded-xl px-3 py-2
              placeholder-white/30 outline-none focus:bg-white/15 transition
              border border-white/5 focus:border-teal-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-9 h-9 bg-teal-500 hover:bg-teal-400 disabled:opacity-40
              disabled:cursor-not-allowed rounded-xl flex items-center
              justify-center text-white transition hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inner (must be inside StreamCall) ───────────────────
function VideoCallInner({ onLeave, userName, roomId, socket }) {
  const [chatOpen,       setChatOpen]       = useState(false);
  const [messages,       setMessages]       = useState([]);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call-message", (data) => {
      setMessages(prev => [...prev, { ...data, self: false }]);
    });

    socket.on("call-emoji", (data) => {
      setFloatingEmojis(prev => [
        ...prev,
        { emoji: data.emoji, sender: data.sender, id: Date.now() + Math.random() },
      ]);
    });

    return () => {
      socket.off("call-message");
      socket.off("call-emoji");
    };
  }, [socket]);

  const sendMessage = (text) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit",
    });
    setMessages(prev => [...prev, { text, sender: userName, time, self: true }]);
    socket?.emit("call-message", { roomId, text, sender: userName, time });
  };

  const sendEmoji = (emoji) => {
    setFloatingEmojis(prev => [
      ...prev,
      { emoji, sender: "You", id: Date.now() + Math.random() },
    ]);
    socket?.emit("call-emoji", { roomId, emoji, sender: userName });
  };

  const removeEmoji = (id) => {
    setFloatingEmojis(prev => prev.filter(e => e.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">

      {floatingEmojis.map(({ emoji, id, sender }) => (
        <FloatingEmoji key={id} emoji={emoji} id={id}
          sender={sender} onDone={removeEmoji} />
      ))}

      <div className="flex flex-1 overflow-hidden">

        {/* ✅ Video area — crisp rendering fix */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ imageRendering: "crisp-edges" }}
        >
          <SpeakerLayout screenshareLayout="spotlight" />
        </div>

        {chatOpen && (
          <InCallChat messages={messages} onSend={sendMessage} />
        )}
      </div>

      <CustomControls
        onLeave={onLeave}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen(v => !v)}
        onSendEmoji={sendEmoji}
      />

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)      scale(1);   opacity: 1; }
          70%  { transform: translateY(-180px) scale(1.4); opacity: 0.9; }
          100% { transform: translateY(-260px) scale(0.8); opacity: 0; }
        }

        /* ✅ Remove all blur from video elements */
        .str-video__screen-share-track video,
        .str-video__participant-view video,
        .str-video__video-placeholder video,
        video {
          filter: none !important;
          backdrop-filter: none !important;
          -webkit-filter: none !important;
          image-rendering: crisp-edges !important;
          image-rendering: -webkit-optimize-contrast !important;
          object-fit: contain !important;
        }

        /* ✅ Remove blur from screen share containers */
        .str-video__screen-share-track,
        .str-video__screen-share-overlay {
          filter: none !important;
          backdrop-filter: none !important;
          background: #000 !important;
        }

        /* ✅ Remove blur from participant tiles */
        .str-video__participant-view,
        .str-video__speaker-layout__spotlight,
        .str-video__speaker-layout {
          filter: none !important;
          backdrop-filter: none !important;
        }

        /* ✅ Make screen share fill the spotlight area fully */
        .str-video__speaker-layout__spotlight video {
          object-fit: contain !important;
          width: 100% !important;
          height: 100% !important;
          filter: none !important;
          image-rendering: crisp-edges !important;
        }
      `}</style>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────
function VideoCall() {
  const { roomId }  = useParams();
  const navigate    = useNavigate();
  const { user }    = useContext(AuthContext);

  const [client, setClient] = useState(null);
  const [call,   setCall]   = useState(null);
  const [socket, setSocket] = useState(null);
  const callRef   = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // ── Connect socket ────────────────────────────────
    const sock = io("http://localhost:5000");
    sock.emit("join-room", roomId);
    socketRef.current = sock;
    setSocket(sock);

    // ── Init Stream Video ─────────────────────────────
    const initVideo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/video/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user._id }),
        });

        const data = await res.json();

        const videoClient = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_API_KEY,
          user: { id: user._id, name: user.name || "User" },
          token: data.token,
        });

        const videoCall = videoClient.call("default", roomId);
        await videoCall.join({ create: true });
        await videoCall.camera.enable();
        await videoCall.microphone.enable();

        callRef.current = videoCall;
        setClient(videoClient);
        setCall(videoCall);
      } catch (err) {
        console.error("Video init error:", err);
      }
    };

    initVideo();

    return () => {
      callRef.current?.leave();
      socketRef.current?.disconnect();
    };
  }, [roomId, user]);

  const leaveCall = async () => {
    await callRef.current?.leave();
    socketRef.current?.disconnect();
    navigate("/sessions");
  };

  if (!client || !call) {
    return (
      <div className="h-screen flex flex-col items-center justify-center
        bg-gray-950 gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent
          rounded-full animate-spin" />
        <p className="text-white/50 text-sm tracking-wide">Joining call...</p>
      </div>
    );
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <VideoCallInner
          onLeave={leaveCall}
          userName={user?.name || "You"}
          roomId={roomId}
          socket={socket}
        />
      </StreamCall>
    </StreamVideo>
  );
}

export default VideoCall;
