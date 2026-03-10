import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { socket } from "../socket";
import ChatList from "./ChatList";
import MessageBox from "./Messages";
import { AuthContext } from "../context/AuthContext";

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch all chats for this user
  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(res.data);
    } catch (error) {
      console.error("Failed to fetch chats", error);
    }
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatID) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/messages/${chatID}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    fetchChats();

    socket.on("new-message", (message) => {
      if (message.chatID === selectedChat?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("new-message");
    };
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
    socket.emit("join-room", chat._id);
  };

  return (
    <div className="flex h-screen">
      <ChatList chats={chats} onSelectChat={handleSelectChat} currentUser={user} />
      {selectedChat && <MessageBox messages={messages} chat={selectedChat} />}
    </div>
  );
};

export default ChatPage;