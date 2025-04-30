import { apiSlice } from "../api/apiSlice";

export const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all chats for the current user (both private and course chats)
    getAllChats: builder.query({
      query: () => ({
        url: "chat/all",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: ["Chats"],
    }),

    // Get a specific chat by ID with all messages
    getChatById: builder.query({
      query: (chatId) => ({
        url: `chat/${chatId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result, error, id) => [{ type: "Chat", id }],
    }),

    // Create or get private chat with a student
    createOrGetPrivateChat: builder.mutation({
      query: (userId) => ({
        url: "chat/private",
        method: "POST",
        body: { userId },
        credentials: "include" as const,
      }),
      invalidatesTags: ["Chats"],
    }),

    // Mark a message as read
    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `chat/mark-read/${messageId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, messageId) => [
        { type: "Chat", id: result?.chatId },
      ],
    }),

    // Get unread message count
    getUnreadCount: builder.query({
      query: () => ({
        url: "chat/unread-count",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: ["UnreadCount"],
    }),

    // Upload attachments for chat
    uploadAttachments: builder.mutation({
      query: (formData) => ({
        url: "chat/upload-attachments",
        method: "POST",
        body: formData,
        credentials: "include" as const,
        // Don't set Content-Type header here - RTK Query will set it correctly with boundary for FormData
        formData: true,
      }),
    }),
  }),
});

export const {
  useGetAllChatsQuery,
  useGetChatByIdQuery,
  useCreateOrGetPrivateChatMutation,
  useMarkMessageAsReadMutation,
  useGetUnreadCountQuery,
  useUploadAttachmentsMutation,
} = chatApi; 