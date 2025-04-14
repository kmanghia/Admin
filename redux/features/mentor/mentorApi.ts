import { apiSlice } from "../api/apiSlice";

export const mentorApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMentors: builder.query({
      query: () => ({
        url: "all",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    getPendingMentors: builder.query({
      query: () => ({
        url: "pending",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    getMentorById: builder.query({
      query: (id) => ({
        url: `${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    getMentorInfo: builder.query({
      query: () => ({
        url: "me-mentor",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    getMentorCourses: builder.query({
      query: () => ({
        url: "courses",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    getMentorStudents: builder.query({
      query: () => ({
        url: "students",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    updateMentorStatus: builder.mutation({
      query: ({ mentorId, status }) => ({
        url: "update-status",
        method: "PUT",
        body: { mentorId, status },
        credentials: "include" as const,
      }),
    }),
    
    reviewMentor: builder.mutation({
      query: ({ mentorId, rating, comment }) => ({
        url: "review",
        method: "POST",
        body: { mentorId, rating, comment },
        credentials: "include" as const,
      }),
    }),
    
    registerAsMentor: builder.mutation({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useGetAllMentorsQuery,
  useGetPendingMentorsQuery,
  useGetMentorByIdQuery,
  useGetMentorInfoQuery,
  useGetMentorCoursesQuery,
  useGetMentorStudentsQuery,
  useUpdateMentorStatusMutation,
  useReviewMentorMutation,
  useRegisterAsMentorMutation,
} = mentorApi; 