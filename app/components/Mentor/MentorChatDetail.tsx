"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatDetails, Message } from "@/types/chat";
import { useGetChatByIdQuery, useMarkMessageAsReadMutation } from "@/redux/features/chat/chatApi";
import Image from "next/image";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { format } from "timeago.js";
import { URL_SERVER } from "@/app/utils/url";
import socketIO from "socket.io-client";

// Socket connection setup
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

interface MentorChatDetailProps {
  chatId: string;
}

const MentorChatDetail: FC<MentorChatDetailProps> = ({ chatId }) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatDetails | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(socketId);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data, isLoading, refetch } = useGetChatByIdQuery(chatId);
  const [markMessageAsRead] = useMarkMessageAsReadMutation();

  // Initial setup and getting user ID
  useEffect(() => {
    const mentorId = localStorage.getItem("mentor_id");
    if (mentorId) {
      setUserId(mentorId);
    }
    
    // Initialize socket
    if (mentorId) {
      initializeSocket(mentorId);
    }
    
    return () => {
      // Clean up socket event listeners
      if (socketRef.current) {
        socketRef.current.off('newMessage');
        socketRef.current.off('userTyping');
        
        // Emit typing stopped when leaving the chat
        if (userId && isTyping) {
          socketRef.current.emit('typing', { 
            chatId, 
            userId, 
            isTyping: false 
          });
        }
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  // Update local chat state when data changes
  useEffect(() => {
    if (data?.chat) {
      setChat(data.chat);
      
      // Mark unread messages as read
      if (userId) {
        data.chat.messages.forEach((msg: Message) => {
          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
          if (senderId !== userId && !msg.readBy.includes(userId)) {
            markMessageAsRead(msg._id);
          }
        });
      }
    }
  }, [data, userId, markMessageAsRead]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  // Socket initialization
  const initializeSocket = (user: string) => {
    // Join the chat room
    socketRef.current.emit('joinChat', { chatId, userId: user });
    
    // Listen for new messages
    socketRef.current.on('newMessage', (data: any) => {
      console.log('New message received:', data);
      
      if (data.chatId === chatId) {
        // Update chat with new message
        setChat(prevChat => {
          if (!prevChat) return null;
          
          // Ensure message has all required fields
          const messageToAdd = {
            ...data.message,
            sender: {
              _id: typeof data.message.sender === 'string' ? data.message.sender : data.message.sender._id,
              name: typeof data.message.sender === 'string' ? 'User' : (data.message.sender.name || 'User')
            },
            readBy: Array.isArray(data.message.readBy) ? data.message.readBy : []
          };
          
          // Add the new message to the chat
          const updatedMessages = [...prevChat.messages, messageToAdd];
          return { ...prevChat, messages: updatedMessages };
        });

        // Mark message as read if we're not the sender
        const messageId = data.message._id;
        const senderId = typeof data.message.sender === 'string' ? 
          data.message.sender : 
          data.message.sender._id;
          
        if (senderId !== user && messageId) {
          markMessageAsRead(messageId);
        }
      }
    });

    // Listen for typing indicators
    socketRef.current.on('userTyping', (data: any) => {
      if (data.chatId === chatId && data.userId !== user) {
        if (data.isTyping) {
          setTypingUsers(prev => new Set(prev).add(data.userId));
        } else {
          setTypingUsers(prev => {
            const updated = new Set(prev);
            updated.delete(data.userId);
            return updated;
          });
        }
      }
    });
  };

  // Handle message input change
  const handleMessageChange = (text: string) => {
    setMessage(text);
    
    // Handle typing indicator
    if (userId && socketRef.current) {
      if (!isTyping && text.length > 0) {
        setIsTyping(true);
        socketRef.current.emit('typing', { 
          chatId, 
          userId, 
          isTyping: true 
        });
      }
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          socketRef.current.emit('typing', { 
            chatId, 
            userId, 
            isTyping: false 
          });
        }
      }, 3000);
    }
  };

  // Send message
  const sendMessage = () => {
    if (!message.trim() || !socketRef.current || !userId) return;
    
    try {
      const messageText = message.trim();
      
      // Create a temporary local message object for immediate display
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content: messageText,
        sender: { _id: userId, name: 'You' },
        readBy: [userId],
        createdAt: new Date().toISOString()
      };
      
      // Update local chat state immediately
      setChat(prevChat => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, tempMessage]
        };
      });
      
      // Then send to server
      socketRef.current.emit('sendMessage', {
        chatId,
        message: messageText,
        senderId: userId
      });
      
      setMessage('');
      setIsTyping(false);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      socketRef.current.emit('typing', { 
        chatId, 
        userId, 
        isTyping: false 
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Get chat title
  const getChatTitle = (): string => {
    if (!chat) return '';
    
    if (chat.chatType === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== userId);
      return otherParticipant?.name || 'Unknown User';
    } else {
      return chat.name || chat.courseId?.name || 'Course Chat';
    }
  };

  // Get chat avatar
  const getChatAvatar = (): string => {
    if (!chat) return 'default-avatar.png';
    
    if (chat.chatType === 'private') {
      const otherParticipant = chat.participants.find(p => p._id !== userId);
      return otherParticipant?.avatar?.url || 'default-avatar.png';
    } else {
      return chat.courseId?.thumbnail?.url || 'default-course.png';
    }
  };

  // Get message sender name
  const getMessageSenderName = (msg: Message): string => {
    if (typeof msg.sender === 'string') {
      // If sender is just an ID, check if it's the current user
      if (msg.sender === userId) return 'You';
      
      // Try to find the sender in participants
      const participant = chat?.participants.find(p => p._id === msg.sender);
      if (participant?.name) return participant.name;
      
      return 'User';
    } else {
      // If sender is an object
      if (msg.sender._id === userId) return 'You';
      return `${msg.sender.name} giảng viên` || 'User';
    }
  };

  // Get message sender avatar
  const getMessageSenderAvatar = (msg: Message): string => {
    if (typeof msg.sender === 'string') {
      // If sender is just an ID, use default avatar
      // Try to find the sender in participants
      const participant = chat?.participants.find(p => p._id === msg.sender);
      if (participant?.avatar?.url) return participant.avatar.url;
      
      return 'default-avatar.png';
    } else {
      // If sender is an object with avatar
      return msg.sender.avatar?.url || 'default-avatar.png';
    }
  };

  // Format message time
  const formatMessageTime = (time: string): string => {
    const msgDate = new Date(time);
    const today = new Date();
    
    // If same day, show time
    if (msgDate.toDateString() === today.toDateString()) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If within last week, show day name
    const diffDays = Math.round((today.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[msgDate.getDay()];
    }
    
    // Otherwise show date
    return msgDate.toLocaleDateString();
  };

  // Handle keypress for sending message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">Không tìm thấy tin nhắn</p>
        <button
          onClick={() => router.push('/mentor/chats')}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <IoArrowBackOutline className="mr-2" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  // Check if anyone is typing
  const typingIndicator = typingUsers.size > 0 ? (
    <div className="px-4 py-2 text-sm text-gray-500 italic">
      {typingUsers.size === 1 ? 'Someone is typing...' : 'Several people are typing...'}
    </div>
  ) : null;

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <button 
          onClick={() => router.push('/mentor/chats')}
          className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <IoArrowBackOutline className="text-gray-600 dark:text-gray-300" size={20} />
        </button>
        
        <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
          <Image 
            src={`http://localhost:8000/images/${getChatAvatar()}`}
            alt={getChatTitle()}
            fill
            className="object-cover"
            onError={(e: any) => {
              e.target.src = chat.chatType === 'private' 
                ? 'default-avatar.png' 
                : 'default-course.png';
            }}
          />
        </div>
        
        <div>
          <h2 className="font-semibold text-lg dark:text-white">{getChatTitle()}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {chat.chatType === 'private' ? 'Tin nhắn riêng tư' : `${chat.participants.length} thành viên`}
          </p>
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
      >
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 mb-2">Chưa có tin nhắn nào</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Bắt đầu cuộc trò chuyện ngay!</p>
          </div>
        ) : (
          chat.messages.map((msg, index) => {
            const isCurrentUser = (typeof msg.sender === 'string' && msg.sender === userId) || 
                                  (typeof msg.sender !== 'string' && msg.sender._id === userId);
            
            // Check if we need to show date separator
            const showDateSeparator = index === 0 || 
              new Date(msg.createdAt).toDateString() !== new Date(chat.messages[index - 1].createdAt).toDateString();
            
            return (
              <React.Fragment key={msg._id}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  {!isCurrentUser && (
                    <div className="flex-shrink-0 mr-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={`http://localhost:8000/images/${getMessageSenderAvatar(msg)}`}
                          alt={getMessageSenderName(msg)}
                          fill
                          className="object-cover"
                          onError={(e: any) => {
                            e.target.src = 'default-avatar.png';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[75%]`}>
                    {!isCurrentUser && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-1">
                        {getMessageSenderName(msg)}
                      </div>
                    )}
                    
                    <div className={`relative px-4 py-2 rounded-lg ${
                      isCurrentUser 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      <div className={`text-xs mt-1 ${
                        isCurrentUser 
                          ? 'text-blue-100' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                    
                    {isCurrentUser && msg.readBy.length > 1 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 text-right mr-1 mt-1">
                        Đã xem
                      </div>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        
        {/* Typing indicator */}
        {typingIndicator}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className={`p-3 rounded-r-lg ${
              message.trim()
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
            } text-white transition-colors`}
          >
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorChatDetail; 