import React from "react";

const ChatList = ({ chats, onSelectChat, currentUser }) => {
  return (
    <div className="w-1/4 border-r p-4 bg-white overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      {chats.length === 0 ? (
        <p className="text-gray-500 italic">No chats available. Visit a user's profile to send them a message.</p>
      ) : (
        chats.map((chat) => {
          // Identify the other participant
          const isSender = chat.senderID._id === currentUser._id;
          const otherUser = isSender ? chat.receiverID : chat.senderID;

          return (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className="cursor-pointer p-4 mb-2 border rounded hover:bg-teal-50 shadow-sm transition-colors flex items-center gap-3"
            >
              {otherUser?.avatar ? (
                <img src={otherUser.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                  {otherUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <p className="text-sm font-semibold truncate">
                {otherUser?.name || "Unknown User"}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatList;