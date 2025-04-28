export interface MessageSender {
  _id: string;
  name?: string;
  avatar?: {
    url: string;
  };
}

export interface Message {
  _id: string;
  sender: string | MessageSender;
  content: string;
  readBy: string[];
  createdAt: string;
}

export interface ChatParticipant {
  _id: string;
  name: string;
  avatar?: {
    url: string;
  };
}

export interface MentorInfo {
  _id: string;
  user?: {
    _id: string;
    name: string;
    avatar?: {
      url: string;
    };
  };
}

export interface CourseInfo {
  _id: string;
  name: string;
  thumbnail?: {
    url: string;
  };
}

export interface ChatPreview {
  _id: string;
  name?: string;
  chatType: 'private' | 'course';
  participants: ChatParticipant[];
  courseId?: CourseInfo;
  mentorId: {
    _id: string;
    user?: string;
  };
  messages: Message[];
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatDetails extends ChatPreview {
  mentorInfo?: MentorInfo;
} 