import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { socket } from "../socket";
import ChatList from "./ChatList";
import MessageBox from "./MessageBox";
import { AuthContext } from "../context/AuthContext";

const ChatPage = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  // Fetch all chats for this user
  const fetchChats = async () => {
    const res = await axios.get(`/api/messages/chats/${user._id}`);
    setChats(res.data);
  };

  // Fetch messages for selected chat
  const fetchMessages = async (chatID) => {
    const res = await axios.get(`/api/messages/${chatID}`);
    setMessages(res.data);
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
      <ChatList chats={chats} onSelectChat={handleSelectChat} />
      {selectedChat && <MessageBox messages={messages} chat={selectedChat} />}
    </div>
  );
};

export default ChatPage;