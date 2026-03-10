// import { useState } from "react";
// import { useParams } from "react-router-dom";

// const ChatPage = () => {

//   const { id } = useParams(); // receiving user id

//   const [messages, setMessages] = useState([
//     { sender: "User", text: "Hello!" },
//     { sender: "Me", text: "Hi, how can I help?" },
//   ]);

//   const [newMessage, setNewMessage] = useState("");

//   const sendMessage = () => {
//     if (newMessage.trim() === "") return;

//     const message = {
//       sender: "Me",
//       text: newMessage,
//     };

//     setMessages([...messages, message]);
//     setNewMessage("");
//   };

//   return (
//     <div className="h-[93vh] flex flex-col bg-base-200 p-4">

//       {/* Chat Header */}
//       <div className="mb-3 text-lg font-semibold">
//         Chat with User ID: {id}
//       </div>

//       {/* Chat messages */}
//       <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 shadow">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`mb-2 ${
//               msg.sender === "Me" ? "text-right" : "text-left"
//             }`}
//           >
//             <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input box */}
//       <div className="flex mt-4 gap-2">
//         <input
//           type="text"
//           placeholder="Type message..."
//           className="input input-bordered w-full"
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//         />

//         <button onClick={sendMessage} className="btn btn-primary">
//           Send
//         </button>
//       </div>

//     </div>
//   );
// };

// export default ChatPage;

// src/pages/MessageBox.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../socket";
import axios from "axios";

const MessageBox = ({ messages = [], chat }) => {
  const { user } = useContext(AuthContext);
  const [newMessage, setNewMessage] = useState("");

  if (!user || !chat) return <div>Loading chat...</div>;

  const sendMessage = async () => {
    if (!newMessage) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/messages", {
        chatID: chat._id,
        message: newMessage,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      socket.emit("new-message", res.data); // emit to socket
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`my-1 p-2 rounded ${msg.senderID === user._id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"
              }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex mt-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageBox;