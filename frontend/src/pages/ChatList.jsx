import React from "react";

const ChatList = ({ chats, onSelectChat }) => {
  return (
    <div className="w-1/4 border-r p-4">
      {chats.map((chat) => (
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat)}
          className="cursor-pointer p-2 border-b hover:bg-gray-200"
        >
          {chat.senderID === chat.receiverID ? chat.senderID : chat.receiverID}
        </div>
      ))}
    </div>
  );
};

export default ChatList;