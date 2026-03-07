import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout
} from "@stream-io/video-react-sdk";

import { StreamVideoClient } from "@stream-io/video-client";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function VideoCall() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!user) return;

    const initVideo = async () => {
      const res = await fetch("http://localhost:5000/api/video/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id })
      });

      const data = await res.json();

      const videoClient = new StreamVideoClient({
        apiKey: import.meta.env.VITE_STREAM_API_KEY,
        user: {
          id: user._id,
          name: user.name || "User"
        },
        token: data.token
      });

      const videoCall = videoClient.call("default", roomId);
      await videoCall.join({ create: true });

      // ✅ Enable camera and mic on join
      await videoCall.camera.enable();
      await videoCall.microphone.enable();

      setClient(videoClient);
      setCall(videoCall);
    };

    initVideo();

    // ✅ Cleanup on unmount
    return () => {
      call?.leave();
    };
  }, [roomId, user]);

  const leaveCall = async () => {
    if (call) await call.leave();
    navigate("/sessions");
  };

  if (!client || !call) return (
    <div className="h-screen flex items-center justify-center text-xl">
      Joining call...
    </div>
  );

  return (
    <div style={{ position: "relative", height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Leave Call button */}
      <button
        onClick={leaveCall}
        className="absolute top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
      >
        Leave Call
      </button>

      <StreamVideo client={client}>
        <StreamCall call={call}>

          {/* ✅ Video area */}
          <div style={{ flex: 1, position: "relative" }}>
            <SpeakerLayout />
          </div>

          {/* ✅ Controls bar at bottom */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px", background: "#1a1a1a" }}>
            <CallControls />
          </div>

        </StreamCall>
      </StreamVideo>

    </div>
  );
}

export default VideoCall;