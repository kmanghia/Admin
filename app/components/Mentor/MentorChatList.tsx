"use client";
import React, { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatPreview } from "@/types/chat";
import { FaSearch } from "react-icons/fa";
import { useGetAllChatsQuery } from "@/redux/features/chat/chatApi";
import Link from "next/link";
import Image from "next/image";
import { format } from "timeago.js";
import { URL_SERVER } from "@/app/utils/url";

const MentorChatList: FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
  const { data, isLoading, refetch } = useGetAllChatsQuery({}, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnFocus: true,
  });

  useEffect(() => {
    // Set up interval to refresh chats periodically
    const intervalId = setInterval(() => {
      refetch();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [refetch]);

  useEffect(() => {
    if (data) {
      const allChats = [...(data.privateChats || []), ...(data.courseChats || [])];
      
      // Sort chats by latest message
      const sortedChats = [...allChats].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      
      // Filter chats based on search term
      const filtered = searchTerm 
        ? sortedChats.filter(chat => 
            (getChatName(chat) || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (getLastMessage(chat) || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
        : sortedChats;
        
      setFilteredChats(filtered);
    }
  }, [data, searchTerm]);

  const getChatName = (chat: ChatPreview): string => {
    if (chat.chatType === 'private') {
      // Find the other participant (not the mentor)
      const mentorId = localStorage.getItem('mentor_id');
      const otherParticipant = chat.participants.find(p => p._id !== mentorId);
      return otherParticipant?.name || 'Unknown User';
    } else {
      // For course chats
      return chat.name || chat.courseId?.name || 'Course Chat';
    }
  };

  const getChatAvatar = (chat: ChatPreview): string => {
    if (chat.chatType === 'private') {
      const mentorId = localStorage.getItem('mentor_id');
      const otherParticipant = chat.participants.find(p => p._id !== mentorId);
      return otherParticipant?.avatar?.url || 'default-avatar.png';
    } else {
      return chat.courseId?.thumbnail?.url || (chat.courseId?.thumbnail as unknown as string) || 'default-course.png';
    }
  };

  const getLastMessage = (chat: ChatPreview): string => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return lastMessage.content;
    }
    return 'No messages yet';
  };

  const getLastMessageTime = (chat: ChatPreview): string => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return format(new Date(lastMessage.createdAt));
    }
    return '';
  };

  const getUnreadCount = (chat: ChatPreview): number => {
    const mentorId = localStorage.getItem('mentor_id');
    if (!mentorId || !chat.messages) return 0;
    
    return chat.messages.filter(msg => 
      !msg.readBy.includes(mentorId)
    ).length;
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/mentor/chats/${chatId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-5 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold mb-6 dark:text-white">Tin nhắn</h1>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm tin nhắn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 pl-10 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Chat list */}
        <div className="space-y-3">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No chats match your search' : 'No chats available'}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const unreadCount = getUnreadCount(chat);
              
              return (
                <div 
                  key={chat._id}
                  onClick={() => handleChatClick(chat._id)}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 
                    ${unreadCount > 0 
                      ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500' 
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {/* Avatar */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                    <Image 
                      src={`http://localhost:8000/images/${getChatAvatar(chat)}`}
                      alt={getChatName(chat)}
                      fill
                      className="object-cover"
                      onError={(e: any) => {
                        e.target.src = chat.chatType === 'private' 
                          ? 'default-avatar.png' 
                          : 'default-course.png';
                      }}
                    />
                  </div>
                  
                  {/* Chat details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className={`text-md ${unreadCount > 0 ? 'font-bold' : 'font-medium'} truncate dark:text-white`}>
                        {getChatName(chat)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {getLastMessageTime(chat)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {getLastMessage(chat)}
                      </p>
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Chat type badge */}
                    <div className="mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chat.chatType === 'private' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                      }`}>
                        {chat.chatType === 'private' ? 'Cá nhân' : 'Nhóm khóa học'}
                      </span>
                      
                      {chat.chatType === 'course' && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {chat.participants.length} thành viên
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorChatList; 