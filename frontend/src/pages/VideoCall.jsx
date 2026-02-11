// import { useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const VideoCall = () => {
//   const { roomId } = useParams();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);

//   useEffect(() => {
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         localVideoRef.current.srcObject = stream;

//         peerRef.current = new RTCPeerConnection({
//           iceServers: [
//             { urls: "stun:stun.l.google.com:19302" }
//           ]
//         });

//         stream.getTracks().forEach((track) => {
//           peerRef.current.addTrack(track, stream);
//         });

//         peerRef.current.ontrack = (event) => {
//           remoteVideoRef.current.srcObject = event.streams[0];
//         };

//         peerRef.current.onicecandidate = (event) => {
//           if (event.candidate) {
//             socket.emit("ice-candidate", {
//               roomId,
//               candidate: event.candidate
//             });
//           }
//         };

//         socket.emit("join-room", roomId);
//       });

//     socket.on("user-joined", async () => {
//       const offer = await peerRef.current.createOffer();
//       await peerRef.current.setLocalDescription(offer);

//       socket.emit("offer", { roomId, offer });
//     });

//     socket.on("offer", async (offer) => {
//       await peerRef.current.setRemoteDescription(offer);
//       const answer = await peerRef.current.createAnswer();
//       await peerRef.current.setLocalDescription(answer);

//       socket.emit("answer", { roomId, answer });
//     });

//     socket.on("answer", async (answer) => {
//       await peerRef.current.setRemoteDescription(answer);
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       await peerRef.current.addIceCandidate(candidate);
//     });

//   }, [roomId]);

//   return (
//     <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
//       <h2 className="text-white">Room: {roomId}</h2>

//       <div className="flex gap-4">
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           playsInline
//           className="w-72 rounded-lg border"
//         />

//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="w-72 rounded-lg border"
//         />
//       </div>
//     </div>
//   );
// };

// export default VideoCall;

import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const VideoCall = () => {
  const { roomId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const start = async () => {
      // 1️⃣ Get media
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideoRef.current.srcObject = streamRef.current;

      // 2️⃣ Create PeerConnection
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // 3️⃣ Add tracks
      streamRef.current.getTracks().forEach((track) => {
        peerRef.current.addTrack(track, streamRef.current);
      });

      // 4️⃣ Receive remote stream
      peerRef.current.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      // 5️⃣ ICE candidates
      peerRef.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            roomId,
            candidate: event.candidate,
          });
        }
      };

      socket.emit("join-room", roomId);
    };

    start();

    // 🔹 SOCKET EVENTS
  socket.on("you-are-first", () => {
  console.log("I am first user");
});

socket.on("you-are-second", async () => {
  console.log("I am second user");

  const offer = await peerRef.current.createOffer();
  await peerRef.current.setLocalDescription(offer);

  socket.emit("offer", { roomId, offer });
});


    socket.on("offer", async (offer) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerRef.current.createAnswer();
      await peerRef.current.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer) => {
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async (candidate) => {
      if (candidate) {
        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    // 🧹 CLEANUP
    return () => {
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      peerRef.current?.close();
    };
  }, [roomId]);

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <h2 className="text-white">Room: {roomId}</h2>

      <div className="flex gap-4">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-72 rounded-lg border"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-72 rounded-lg border"
        />
      </div>
    </div>
  );
};

export default VideoCall;

