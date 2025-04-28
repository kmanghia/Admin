import { apiSlice } from "../api/apiSlice";

export const courseApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPendingCourses: builder.query({
      query: () => ({
        url: "pending",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    updateCourseStatus: builder.mutation({
      query: ({ courseId, status, reason }) => ({
        url: "update-status",
        method: "PUT",
        body: { courseId, status, reason },
        credentials: "include" as const,
      }),
    }),
    
    createCourseDraft: builder.mutation({
      query: (data) => ({
        url: "create-draft",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),
    
    submitCourseForApproval: builder.mutation({
      query: (courseId) => ({
        url: `submit-for-approval/${courseId}`,
        method: "PUT",
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useGetPendingCoursesQuery,
  useUpdateCourseStatusMutation,
  useCreateCourseDraftMutation,
  useSubmitCourseForApprovalMutation,
} = courseApi; 