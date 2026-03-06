// import { useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";

// const socket = io("http://localhost:5000");

// const VideoCall = () => {
//   const { roomId } = useParams();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);

// useEffect(() => {
//   let stream;

//   const initCall = async () => {
//     stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true,
//     });

//     localVideoRef.current.srcObject = stream;

//     peerRef.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     // Add local tracks
//     stream.getTracks().forEach((track) => {
//       peerRef.current.addTrack(track, stream);
//     });

//     // When remote track received
//     peerRef.current.ontrack = (event) => {
//       remoteVideoRef.current.srcObject = event.streams[0];
//     };

//     // ICE candidate
//     peerRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit("ice-candidate", {
//           roomId,
//           candidate: event.candidate,
//         });
//       }
//     };

//     socket.emit("join-room", roomId);
//   };

//   initCall();

//   // 🔥 FIRST USER
//   socket.on("you-are-first", () => {
//     console.log("Waiting for second user...");
//   });

//   // 🔥 SECOND USER JOINED → FIRST USER CREATES OFFER
//   socket.on("second-user-joined", async () => {
//     const offer = await peerRef.current.createOffer();
//     await peerRef.current.setLocalDescription(offer);

//     socket.emit("offer", { roomId, offer });
//   });

//   // 🔥 RECEIVE OFFER (Second user)
//   socket.on("offer", async (offer) => {
//     await peerRef.current.setRemoteDescription(
//       new RTCSessionDescription(offer)
//     );

//     const answer = await peerRef.current.createAnswer();
//     await peerRef.current.setLocalDescription(answer);

//     socket.emit("answer", { roomId, answer });
//   });

//   // 🔥 RECEIVE ANSWER (First user)
//   socket.on("answer", async (answer) => {
//     await peerRef.current.setRemoteDescription(
//       new RTCSessionDescription(answer)
//     );
//   });

//   socket.on("ice-candidate", async (candidate) => {
//     if (candidate) {
//       await peerRef.current.addIceCandidate(
//         new RTCIceCandidate(candidate)
//       );
//     }
//   });

//   return () => {
//     socket.disconnect();
//   };
// }, [roomId]);


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

// import { useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import io from "socket.io-client";

// const VideoCall = () => {
//   const { roomId } = useParams();

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const peerRef = useRef(null);
//   const streamRef = useRef(null);
//   const candidatesQueue = useRef([]); // Queue for buffering candidates

//   useEffect(() => {
//     let isMounted = true; // Track if component is mounted

//     // Dynamic Socket URL
//     const SOCKET_URL =
//       window.location.hostname === "localhost"
//         ? "http://localhost:5000"
//         : `http://${window.location.hostname}:5000`;

//     const socket = io(SOCKET_URL);

//     const start = async () => {
//       // 1️⃣ Get media
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });

//         // 🛑 Strict Mode Fix: If component unmounted while waiting for camera
//         if (!isMounted) {
//           stream.getTracks().forEach((track) => track.stop());
//           return;
//         }

//         streamRef.current = stream;

//         if (localVideoRef.current) {
//           localVideoRef.current.srcObject = stream;
//         }

//         // 2️⃣ Create PeerConnection
//         peerRef.current = new RTCPeerConnection({
//           iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//         });

//         // 3️⃣ Add tracks
//         stream.getTracks().forEach((track) => {
//           if (peerRef.current) {
//             peerRef.current.addTrack(track, stream);
//           }
//         });

//         // 4️⃣ Receive remote stream
//         peerRef.current.ontrack = (event) => {
//           console.log("📺 Remote track received:", event.streams[0]);
//           if (remoteVideoRef.current) {
//             remoteVideoRef.current.srcObject = event.streams[0];
//             console.log("✅ Remote video element `srcObject` set.");
//           } else {
//             console.error("❌ Remote video ref is null!");
//           }
//         };

//         // 5️⃣ ICE candidates
//         peerRef.current.onicecandidate = (event) => {
//           if (event.candidate) {
//             console.log("🧊 Generated local ICE Candidate:", event.candidate);
//             socket.emit("ice-candidate", {
//               roomId,
//               candidate: event.candidate,
//             });
//           } else {
//             console.log("🧊 End of ICE candidates.");
//           }
//         };

//         socket.emit("join-room", roomId);
//       } catch (error) {
//         console.error("Error accessing media devices:", error);
//         if (error.name === "NotReadableError") {
//           alert("Camera is currently in use by another application. Please close other apps and try again.");
//         } else if (error.name === "NotAllowedError") {
//           alert("Permission denied. Please allow camera and microphone access in your browser settings.");
//         } else if (error.name === "NotFoundError") {
//           alert("No camera or microphone found. Please connect a device.");
//         } else {
//           alert(`Error accessing media devices: ${error.message}`);
//         }
//       }
//     };

//     start();

//     // Helper to process queued candidates
//     const processCandidates = async () => {
//       if (peerRef.current && candidatesQueue.current.length > 0) {
//         for (const candidate of candidatesQueue.current) {
//           try {
//             await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//           } catch (e) {
//             console.error("Error adding queued ice candidate", e);
//           }
//         }
//         candidatesQueue.current = [];
//       }
//     };

//     // 🔹 SOCKET EVENTS
//     socket.on("connect", () => {
//       console.log("✅ Custom Socket Connected:", socket.id);
//     });

//     socket.on("you-are-first", () => {
//       console.log("👤 You are the FIRST user in the room.");
//     });

//     socket.on("you-are-second", async () => {
//       console.log("👤 You are the SECOND user. Initiating offer...");
//       if (!peerRef.current) {
//         console.error("❌ Peer connection not initialized!");
//         return;
//       }

//       try {
//         const offer = await peerRef.current.createOffer();
//         await peerRef.current.setLocalDescription(offer);
//         console.log("📡 Offer created and set as local description:", offer);
//         socket.emit("offer", { roomId, offer });
//       } catch (err) {
//         console.error("❌ Error creating/sending offer:", err);
//       }
//     });

//     socket.on("offer", async (offer) => {
//       console.log("📩 Received OFFER from remote:", offer);
//       if (!peerRef.current) {
//         console.error("❌ Peer connection not initialized when receiving offer!");
//         return;
//       }

//       try {
//         await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
//         console.log("✅ Remote description (OFFER) set.");

//         // Process any queued candidates now that remote description is set
//         await processCandidates();

//         const answer = await peerRef.current.createAnswer();
//         await peerRef.current.setLocalDescription(answer);
//         console.log("📡 Answer created and set as local description:", answer);

//         socket.emit("answer", { roomId, answer });
//       } catch (err) {
//         console.error("❌ Error handling offer:", err);
//       }
//     });

//     socket.on("answer", async (answer) => {
//       console.log("📩 Received ANSWER from remote:", answer);
//       if (!peerRef.current) {
//         console.error("❌ Peer connection not initialized when receiving answer!");
//         return;
//       }

//       try {
//         await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
//         console.log("✅ Remote description (ANSWER) set. Connection should be established.");
//         // Process any queued candidates now that remote description is set
//         await processCandidates();
//       } catch (err) {
//         console.error("❌ Error handling answer:", err);
//       }
//     });

//     socket.on("ice-candidate", async (candidate) => {
//       console.log("🧊 Received ICE CANDIDATE:", candidate);
//       if (candidate && peerRef.current) {
//         // Only add candidate if remote description is set, otherwise queue it
//         if (peerRef.current.remoteDescription) {
//           try {
//             await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//             console.log("✅ ICE Candidate added successfully.");
//           } catch (e) {
//             console.error("❌ Error adding ice candidate", e);
//           }
//         } else {
//           console.log("⏳ Queueing ICE candidate (Remote description not set yet).");
//           candidatesQueue.current.push(candidate);
//         }
//       }
//     });

//     // 🧹 CLEANUP
//     return () => {
//       isMounted = false; // Mark as unmounted
//       console.log("🛑 Cleanup: Disconnecting socket and closing peer connection.");

//       socket.disconnect(); // Disconnect socket

//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((track) => track.stop());
//       }
//       if (peerRef.current) {
//         peerRef.current.close();
//       }
//     };
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
//           className="w-72 rounded-lg border bg-gray-800"
//         />

//         <video
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="w-72 rounded-lg border bg-gray-800"
//         />
//       </div>
//     </div>
//   );
// };

// export default VideoCall;


import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const VideoCall = () => {
  const { roomId } = useParams();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const candidatesQueue = useRef([]); // Queue for buffering candidates

  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    // Dynamic Socket URL
    const SOCKET_URL =
      window.location.hostname === "localhost"
        ? "http://localhost:5000"
        : `http://${window.location.hostname}:5000`;

    const socket = io(SOCKET_URL);

    const start = async () => {
      // 1️⃣ Get media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 🛑 Strict Mode Fix: If component unmounted while waiting for camera
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2️⃣ Create PeerConnection
        peerRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Monitor connection state changes
        peerRef.current.onconnectionstatechange = () => {
          console.log("🔗 Connection state:", peerRef.current?.connectionState);
          if (peerRef.current?.connectionState === "connected") {
            console.log("✅ Peer connection established!");
          } else if (peerRef.current?.connectionState === "failed") {
            console.error("❌ Peer connection failed!");
          }
        };

        peerRef.current.oniceconnectionstatechange = () => {
          console.log("🧊 ICE connection state:", peerRef.current?.iceConnectionState);
        };


        // 3️⃣ Add tracks
        stream.getTracks().forEach((track) => {
          if (peerRef.current) {
            peerRef.current.addTrack(track, stream);
          }
        });

        // 4️⃣ Receive remote stream
        peerRef.current.ontrack = (event) => {
          console.log("📺 Remote track received:", event.streams[0]);
          if (remoteVideoRef.current && event.streams && event.streams[0]) {
            const remoteStream = event.streams[0];
            remoteVideoRef.current.srcObject = remoteStream;
            console.log("✅ Remote video element `srcObject` set.");
            
            // Explicitly play the video to ensure it displays
            remoteVideoRef.current.play().catch((err) => {
              console.error("❌ Error playing remote video:", err);
            });
            
            // Log stream details for debugging
            console.log("📹 Remote stream tracks:", remoteStream.getTracks());
            remoteStream.getTracks().forEach((track) => {
              console.log(`  - Track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
            });
          } else {
            console.error("❌ Remote video ref is null or no streams in event!");
          }
        };

        // 5️⃣ ICE candidates
        peerRef.current.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("🧊 Generated local ICE Candidate:", event.candidate);
            socket.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          } else {
            console.log("🧊 End of ICE candidates.");
          }
        };

        socket.emit("join-room", roomId);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        if (error.name === "NotReadableError") {
          alert("Camera is currently in use by another application. Please close other apps and try again.");
        } else if (error.name === "NotAllowedError") {
          alert("Permission denied. Please allow camera and microphone access in your browser settings.");
        } else if (error.name === "NotFoundError") {
          alert("No camera or microphone found. Please connect a device.");
        } else {
          alert(`Error accessing media devices: ${error.message}`);
        }
      }
    };

    start();

    // Helper to process queued candidates
    const processCandidates = async () => {
      if (peerRef.current && candidatesQueue.current.length > 0) {
        for (const candidate of candidatesQueue.current) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error("Error adding queued ice candidate", e);
          }
        }
        candidatesQueue.current = [];
      }
    };

    // 🔹 SOCKET EVENTS
    socket.on("connect", () => {
      console.log("✅ Custom Socket Connected:", socket.id);
    });

    socket.on("you-are-first", () => {
      console.log("👤 You are the FIRST user in the room. Waiting for second user...");
    });

    socket.on("you-are-second", async () => {
      console.log("👤 You are the SECOND user. Initiating offer...");
      if (!peerRef.current) {
        console.error("❌ Peer connection not initialized!");
        return;
      }

      try {
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        console.log("📡 Offer created and set as local description:", offer);
        socket.emit("offer", { roomId, offer });
      } catch (err) {
        console.error("❌ Error creating/sending offer:", err);
      }
    });

    socket.on("offer", async (offer) => {
      console.log("📩 Received OFFER from remote:", offer);
      if (!peerRef.current) {
        console.error("❌ Peer connection not initialized when receiving offer!");
        return;
      }

      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("✅ Remote description (OFFER) set.");

        // Process any queued candidates now that remote description is set
        await processCandidates();

        const answer = await peerRef.current.createAnswer();
        await peerRef.current.setLocalDescription(answer);
        console.log("📡 Answer created and set as local description:", answer);

        socket.emit("answer", { roomId, answer });
      } catch (err) {
        console.error("❌ Error handling offer:", err);
      }
    });

    socket.on("answer", async (answer) => {
      console.log("📩 Received ANSWER from remote:", answer);
      if (!peerRef.current) {
        console.error("❌ Peer connection not initialized when receiving answer!");
        return;
      }

      try {
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("✅ Remote description (ANSWER) set. Connection should be established.");
        // Process any queued candidates now that remote description is set
        await processCandidates();
      } catch (err) {
        console.error("❌ Error handling answer:", err);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      console.log("🧊 Received ICE CANDIDATE:", candidate);
      if (candidate && peerRef.current) {
        // Only add candidate if remote description is set, otherwise queue it
        if (peerRef.current.remoteDescription) {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ ICE Candidate added successfully.");
          } catch (e) {
            console.error("❌ Error adding ice candidate", e);
          }
        } else {
          console.log("⏳ Queueing ICE candidate (Remote description not set yet).");
          candidatesQueue.current.push(candidate);
        }
      }
    });

    // 🧹 CLEANUP
    return () => {
      isMounted = false; // Mark as unmounted
      console.log("🛑 Cleanup: Disconnecting socket and closing peer connection.");

      socket.disconnect(); // Disconnect socket

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.close();
      }
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
          className="w-72 rounded-lg border bg-gray-800"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted={false}
          className="w-72 rounded-lg border bg-gray-800"
          onLoadedMetadata={() => {
            if (remoteVideoRef.current) {
              console.log("✅ Remote video metadata loaded");
              remoteVideoRef.current.play().catch((err) => {
                console.error("❌ Error playing remote video after metadata load:", err);
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default VideoCall;