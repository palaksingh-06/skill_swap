// const { generateStreamToken } = require("../utils/stream");

// async function getStreamToken(req, res) {
//   try {
//     const token = generateStreamToken(req.user.id);
//     res.status(200).json({ token });
//   } catch (error) {
//     console.log("Error in getStreamToken controller:", error.message);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// module.exports = { getStreamToken };


const ChatMessage = require("../models/Message.js");

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { chatID, message } = req.body;

    if (!chatID || !message) {
      return res.status(400).json({ message: "chatID and message are required" });
    }

    const Chat = require("../models/chat.js");
    const chat = await Chat.findById(chatID);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Determine receiverID based on chat participants
    const receiverID = chat.senderID.toString() === req.user._id.toString()
      ? chat.receiverID
      : chat.senderID;

    const newMessage = await ChatMessage.create({
      chatID,
      message,
      senderID: req.user._id, // must come from auth middleware
      receiverID
    });

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  try {
    const { chatID } = req.params;
    const messages = await ChatMessage.find({ chatID });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Dummy Stream token function
const getStreamToken = (req, res) => {
  res.json({ token: "example_stream_token" });
};

module.exports = {
  sendMessage,
  getMessages,
  getStreamToken,
};