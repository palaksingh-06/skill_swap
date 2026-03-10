const express = require("express");
const cors = require("cors");
require("dotenv").config({ override: true });

const messageRoutes = require("./routes/messageRoutes");
const connectDB = require("./config/db");
const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const skillRoutes = require("./routes/skillRoutes");
const publicRoutes = require("./routes/publicRoutes");
const skillSwapRoutes = require("./routes/skillSwapRoutes");
const matchRoute = require("./routes/match");
const aiRoutes = require("./routes/ai");
const notificationRoutes = require("./routes/notificationRoutes");

/* -------- SOCKET.IO SETUP -------- */
const http = require("http");
const { Server } = require("socket.io");
/* -------------------------------- */

const app = express();

/* ------------------ MIDDLEWARE ------------------ */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

/* ------------------ DATABASE ------------------ */
connectDB();

/* ------------------ TEST ------------------ */
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
app.use("/api/messages", messageRoutes);
app.use("/api/match", matchRoute);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);

/* -------- SOCKET SERVER -------- */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ------------------ SERVER ------------------ */
const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
