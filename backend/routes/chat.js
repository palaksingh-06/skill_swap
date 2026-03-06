const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const {
  createChat,
  getUserChats,
} = require("../controllers/chatController");

const router = express.Router();

// Create a new chat between two users
router.post("/", protectRoute, createChat);

// Get all chats for logged-in user
router.get("/", protectRoute, getUserChats);

module.exports = router;