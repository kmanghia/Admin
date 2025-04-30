import { apiSlice } from "../api/apiSlice";

// Define tag types
export const NOTIFICATION_TAG_TYPES = ['Notifications'] as const;
type TagType = typeof NOTIFICATION_TAG_TYPES[number];

export const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query({
      query: () => ({
        url: "user-notifications",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => 
        result?.notifications
          ? [
              ...result.notifications.map(({ _id }: { _id: string }) => ({
                type: 'Notifications' as const,
                id: _id,
              })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),
    
    getMentorNotifications: builder.query({
      query: () => ({
        url: "mentor-notifications",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => 
        result?.notifications
          ? [
              ...result.notifications.map(({ _id }: { _id: string }) => ({
                type: 'Notifications' as const,
                id: _id,
              })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),
    
    getAdminNotifications: builder.query({
      query: () => ({
        url: "get-all-notifications",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => 
        result?.notifications
          ? [
              ...result.notifications.map(({ _id }: { _id: string }) => ({
                type: 'Notifications' as const,
                id: _id,
              })),
              { type: 'Notifications' as const, id: 'LIST' },
            ]
          : [{ type: 'Notifications' as const, id: 'LIST' }],
    }),
    
    updateNotification: builder.mutation({
      query: (id) => ({
        url: `update-notification/${id}`,
        method: "PUT",
        credentials: "include" as const,
      }),
      
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetMentorNotificationsQuery,
  useGetAdminNotificationsQuery,
  useUpdateNotificationMutation,
} = notificationsApi;
