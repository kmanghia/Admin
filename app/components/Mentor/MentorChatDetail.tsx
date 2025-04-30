"use client";
import React, { FC, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatDetails, Message } from "@/types/chat";
import { useGetChatByIdQuery, useMarkMessageAsReadMutation, useUploadAttachmentsMutation } from "@/redux/features/chat/chatApi";
import Image from "next/image";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { format } from "timeago.js";
import { URL_SERVER, URL } from "@/app/utils/url";
import socketIO from "socket.io-client";
import { BsImage, BsPaperclip } from "react-icons/bs";
import { AiOutlineClose } from "react-icons/ai";
import { FiFile, FiFileText, FiVideo, FiMusic } from "react-icons/fi";
import Cookies from "js-cookie";

// Add attachment interface
interface Attachment {
  type: string;
  url: string;
  filename: string;
  mimeType: string;
  size?: number;
  thumbnailUrl?: string;
}

// Update Message interface to include attachments
interface MessageWithAttachments extends Message {
  attachments?: Attachment[];
}

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
  const [socketAuthenticated, setSocketAuthenticated] = useState(false);
  
  // Add attachments state
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const { data, isLoading, refetch } = useGetChatByIdQuery(chatId);
  const [markMessageAsRead] = useMarkMessageAsReadMutation();
  const [uploadAttachments, { isLoading: isUploadLoading }] = useUploadAttachmentsMutation();

  // Initial setup and getting user ID
  useEffect(() => {
    const mentorId = localStorage.getItem("mentor_id");
    if (mentorId) {
      setUserId(mentorId);
    }
    
    // Initialize socket
    if (mentorId) {
      authenticateSocket(mentorId);
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

  // Authenticate socket with user ID
  const authenticateSocket = (mentorId: string) => {
    console.log("Authenticating socket with mentor ID:", mentorId);
    
    // Authenticate with server using the same format as mobile app
    socketRef.current.emit("authenticate", {
      userId: mentorId,
      clientType: "web", 
      clientId: `web_${Date.now()}`,
      userRole: "mentor"
    });
    
    setSocketAuthenticated(true);
    
    // Now initialize the socket for chat
    initializeSocket(mentorId);
  };

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

  // Update isUploading state to use RTK Query's isLoading
  useEffect(() => {
    setIsUploading(isUploadLoading);
  }, [isUploadLoading]);

  // Socket initialization
  const initializeSocket = (user: string) => {
    // Join the chat room - use string format like mobile app
    socketRef.current.emit('joinChat', chatId);
    
    // Alternative format to ensure compatibility
    // socketRef.current.emit('joinChat', { chatId, userId: user });
    
    console.log(`Joining chat room: ${chatId} as user ${user}`);
    
    // Listen for new messages
    socketRef.current.on('newMessage', (data: any) => {
      if (data.chatId === chatId) {
        console.log("Received newMessage event:", data);
        
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

  // File upload handlers
  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Update file upload handler to use RTK Query mutation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if attachment limit (5) is reached
    if (attachments.length + files.length > 5) {
      alert("Bạn chỉ có thể đính kèm tối đa 5 tệp cho mỗi tin nhắn");
      return;
    }
    
    try {
      const fileArray = Array.from(files);
      
      // Prepare FormData
      const formData = new FormData();
      fileArray.forEach(file => {
        formData.append('files', file);
      });

      // Use RTK Query mutation instead of axios
      const response = await uploadAttachments(formData).unwrap();
      
      if (response.success && response.attachments) {
        setAttachments(prev => [...prev, ...response.attachments]);
      } else {
        alert("Không thể tải lên tệp đính kèm");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải lên tệp:", error);
      // Show error message
      if (error.status) {
        alert(`Lỗi (${error.status}): ${error.data?.message || "Có lỗi xảy ra khi tải lên tệp"}`);
      } else {
        alert(`Lỗi: ${error.message || "Có lỗi xảy ra khi tải lên tệp"}`);
      }
    } finally {
      // Clear the input value so the same file can be selected again
      if (type === 'image' && imageInputRef.current) {
        imageInputRef.current.value = '';
      } else if (type === 'document' && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Send message with attachments
  const sendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || !socketRef.current || !userId || !socketAuthenticated) {
      console.log("Cannot send message: ", {
        message: message.trim(),
        attachments: attachments.length,
        socket: !!socketRef.current,
        userId: !!userId,
        authenticated: socketAuthenticated
      });
      return;
    }
    
    try {
      const messageText = message.trim();
      
      // Create a temporary local message object for immediate display
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content: messageText,
        sender: { _id: userId, name: 'You' },
        readBy: [userId],
        createdAt: new Date().toISOString(),
        attachments: attachments.length > 0 ? [...attachments] : undefined
      };
      
      // Update local chat state immediately
      setChat(prevChat => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, tempMessage]
        };
      });
      
      console.log("Sending message via socket:", {
        chatId,
        message: messageText,
        senderId: userId,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      // Match mobile app format exactly (simpler format like mobile app)
      socketRef.current.emit('sendMessage', {
        chatId,
        message: messageText,
        senderId: userId,
        attachments: attachments.length > 0 ? attachments : undefined
      });
      
      setMessage('');
      setAttachments([]);
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
      return chat.courseId?.thumbnail?.url ||  (chat.courseId?.thumbnail as unknown as string) || 'default-course.png';
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

  // Handle image preview
  const openImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  // Render attachment thumbnails in message
  const renderAttachments = (attachments?: Attachment[]) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment, index) => (
          <div 
            key={index} 
            className="relative bg-white dark:bg-gray-700 rounded-md overflow-hidden"
            style={{ width: attachment.type === 'image' ? '150px' : '120px', height: attachment.type === 'image' ? '120px' : '80px' }}
          >
            {attachment.type === 'image' ? (
              <div 
                className="cursor-pointer w-full h-full" 
                onClick={() => openImagePreview(`${URL}/images/${attachment.url}`)}
              >
                <Image 
                  src={`${URL}/images/${attachment.url}`}
                  alt={attachment.filename}
                  fill
                  className="object-cover"
                  onError={(e: any) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
            ) : attachment.type === 'video' ? (
              <a 
                href={`${URL}/${attachment.type}s/${attachment.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FiVideo className="text-red-500" size={24} />
                <p className="text-xs mt-1 text-center truncate w-full">{attachment.filename}</p>
              </a>
            ) : attachment.type === 'audio' ? (
              <a 
                href={`${URL}/${attachment.type}s/${attachment.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FiMusic className="text-purple-500" size={24} />
                <p className="text-xs mt-1 text-center truncate w-full">{attachment.filename}</p>
              </a>
            ) : (
              <a 
                href={`${URL}/${attachment.type}s/${attachment.url}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center h-full p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <FiFileText className="text-blue-500" size={24} />
                <p className="text-xs mt-1 text-center truncate w-full">{attachment.filename}</p>
              </a>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render attachment previews in input area
  const renderAttachmentPreviews = () => {
    if (attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 p-2 border-t border-gray-200 dark:border-gray-700">
        {attachments.map((attachment, index) => (
          <div 
            key={index} 
            className="relative bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden"
            style={{ width: '80px', height: '80px' }}
          >
            {attachment.type === 'image' ? (
              <div className="w-full h-full">
                <Image 
                  src={`${URL}/images/${attachment.url}`}
                  alt={attachment.filename}
                  fill
                  className="object-cover"
                  onError={(e: any) => {
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-2">
                {attachment.type === 'video' ? (
                  <FiVideo size={20} className="text-red-500" />
                ) : attachment.type === 'audio' ? (
                  <FiMusic size={20} className="text-purple-500" />
                ) : (
                  <FiFile size={20} className="text-blue-500" />
                )}
                <p className="text-xs mt-1 text-center truncate w-full">{attachment.filename}</p>
              </div>
            )}

            <button 
              onClick={() => removeAttachment(index)}
              className="absolute top-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md"
            >
              <AiOutlineClose size={14} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>
    );
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
            src={`${URL}/images/${getChatAvatar()}`}
            alt={getChatTitle()}
            fill
            className="object-cover"
            onError={(e: any) => {
              e.target.src = chat.chatType === 'private' 
                ? '/default-avatar.png' 
                : '/default-course.png';
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
                          src={`${URL}/images/${getMessageSenderAvatar(msg)}`}
                          alt={getMessageSenderName(msg)}
                          fill
                          className="object-cover"
                          onError={(e: any) => {
                            e.target.src = '/default-avatar.png';
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
                      {msg.content && (
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                      )}
                      
                      {/* Render attachments if present */}
                      {renderAttachments((msg as MessageWithAttachments).attachments)}
                      
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
      
      {/* Attachment previews */}
      {renderAttachmentPreviews()}
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => handleFileUpload(e, 'image')}
            accept="image/*"
            className="hidden"
            multiple
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, 'document')}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,audio/*,video/*"
            className="hidden"
            multiple
          />
          
          {/* Attachment buttons */}
          <div className="flex mr-2">
            <button
              onClick={handleImageClick}
              disabled={isUploading}
              className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-1"
              title="Đính kèm hình ảnh"
            >
              <BsImage size={20} />
            </button>
            <button
              onClick={handleFileClick}
              disabled={isUploading}
              className="p-2 text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Đính kèm tệp"
            >
              <BsPaperclip size={20} />
            </button>
          </div>
          
          <input
            type="text"
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-3 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isUploading}
          />
          <button
            onClick={sendMessage}
            disabled={(!message.trim() && attachments.length === 0) || isUploading || !socketAuthenticated}
            className={`p-3 rounded-r-lg ${
              (!message.trim() && attachments.length === 0) || isUploading || !socketAuthenticated
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors flex items-center justify-center`}
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <IoSend size={20} />
            )}
          </button>
        </div>
      </div>
      
      {/* Image preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-screen p-2">
            <button 
              className="absolute top-3 right-3 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-colors"
              onClick={closeImagePreview}
            >
              <AiOutlineClose size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorChatDetail; 