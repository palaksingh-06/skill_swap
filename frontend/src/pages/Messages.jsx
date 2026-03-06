import { useState } from "react";
import { useParams } from "react-router-dom";

const ChatPage = () => {

  const { id } = useParams(); // receiving user id

  const [messages, setMessages] = useState([
    { sender: "User", text: "Hello!" },
    { sender: "Me", text: "Hi, how can I help?" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const message = {
      sender: "Me",
      text: newMessage,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  return (
    <div className="h-[93vh] flex flex-col bg-base-200 p-4">

      {/* Chat Header */}
      <div className="mb-3 text-lg font-semibold">
        Chat with User ID: {id}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg p-4 shadow">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.sender === "Me" ? "text-right" : "text-left"
            }`}
          >
            <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input box */}
      <div className="flex mt-4 gap-2">
        <input
          type="text"
          placeholder="Type message..."
          className="input input-bordered w-full"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        <button onClick={sendMessage} className="btn btn-primary">
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatPage;