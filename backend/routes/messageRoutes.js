// const express = require("express");
// const protectRoute = require("../middleware/authMiddleware");
// const { getStreamToken } = require("../controllers/messageController");

// const router = express.Router();

// router.get("/token", protectRoute, getStreamToken);

// module.exports = router;


const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const {
  sendMessage,
  getMessages,
  getStreamToken,
} = require("../controllers/messageController");

const router = express.Router();

// Get Stream.io token
router.get("/token", protectRoute, getStreamToken);

// Send a new message in a chat
router.post("/", protectRoute, sendMessage);

// Get all messages of a chat
router.get("/:chatID", protectRoute, getMessages);

module.exports = router;