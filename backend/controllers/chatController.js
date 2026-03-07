// Chat functions
const Chat = require("../models/chat");

// Create or get a chat between two users
const createOrGetChat = async (req, res) => {
  try {
    const { senderID, receiverID } = req.body;

    if (!senderID || !receiverID) {
      return res.status(400).json({ message: "Both senderID and receiverID required" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      $or: [
        { senderID, receiverID },
        { senderID: receiverID, receiverID: senderID },
      ],
    });

    if (!chat) {
      chat = await Chat.create({ senderID, receiverID });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all chats of a user
const getUserChats = async (req, res) => {
  try {
    const userID = req.user._id;
    const chats = await Chat.find({
      $or: [{ senderID: userID }, { receiverID: userID }],
    }).populate("senderID", "name avatar").populate("receiverID", "name avatar");
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createOrGetChat,
  getUserChats,
};