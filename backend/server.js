const express = require("express");
const cors = require("cors");
require("dotenv").config({ override: true });

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const passport = require("./config/passport");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const skillRoutes = require("./routes/skillRoutes");
const publicRoutes = require("./routes/publicRoutes");
const skillSwapRoutes = require("./routes/skillSwapRoutes");
const matchRoutes = require("./routes/match");
const videoRoutes = require("./routes/videoRoutes");
const chatRoutes = require("./routes/chatRoutes");
const aiRoutes = require("./routes/ai");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

/* ------------------ DATABASE ------------------ */
connectDB();

/* ------------------ TEST ROUTE ------------------ */
app.get("/", (req, res) => {
  res.send("SkillSwap Backend Running");
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/swaps", skillSwapRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

/* ------------------ SOCKET SERVER ------------------ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

global.io = io;

/* ------------------ SOCKET.IO ------------------ */
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user room (for notifications)
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  // Video call room join
  socket.on("join-room", (roomId) => {
    const clients = io.sockets.adapter.rooms.get(roomId);
    const numClients = clients ? clients.size : 0;

    socket.join(roomId);

    if (numClients === 0) {
      socket.emit("you-are-first");
    } else {
      socket.emit("you-are-second");
      socket.to(roomId).emit("second-user-joined");
    }
  });

  // WebRTC signaling
  socket.on("offer", (data) => {
    socket.to(data.roomId).emit("offer", data.offer);
  });

  socket.on("answer", (data) => {
    socket.to(data.roomId).emit("answer", data.answer);
  });

  socket.on("ice-candidate", (data) => {
    socket.to(data.roomId).emit("ice-candidate", data.candidate);
  });

  // In-call chat
  socket.on("call-message", (data) => {
    socket.to(data.roomId).emit("call-message", data);
  });

  // Emoji reactions
  socket.on("call-emoji", (data) => {
    socket.to(data.roomId).emit("call-emoji", data);
  });

  // Call ended
  socket.on("call-ended", ({ roomId }) => {
    console.log(`Call ended in room: ${roomId}`);
    socket.to(roomId).emit("call-ended");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ------------------ SERVER ------------------ */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});