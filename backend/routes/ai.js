const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("aiController:", aiController);
console.log("authMiddleware:", authMiddleware);

router.post("/chat", authMiddleware, aiController.chatbotReply);
router.get("/history", authMiddleware, aiController.getChatHistory);

module.exports = router;