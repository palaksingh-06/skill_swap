const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const { getStreamToken } = require("../controllers/messageController");

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);

module.exports = router;