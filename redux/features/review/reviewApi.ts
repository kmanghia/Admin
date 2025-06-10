import { apiSlice } from "../api/apiSlice";

export const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get mentor reviews
    getMentorReviews: builder.query({
      query: (id) => ({
        url: `mentor/${id}`,
        method: "GET",
        credentials: "include" as const
      }),
    }),
    
    // Get course reviews
    getCourseReviews: builder.query({
      query: (courseId) => ({
        url: `course/${courseId}`,
        method: "GET",
        credentials: "include" as const
      }),
    }),
    
    // Get all course reviews owned by a mentor
    getMentorCourseReviews: builder.query({
      query: (mentorId) => ({
        url: `mentor/courses/${mentorId}`,
        method: "GET",
        credentials: "include" as const
      }),
    }),
    
    // Add review for mentor
    addMentorReview: builder.mutation({
      query: (data) => ({
        url: `mentor/create`,
        method: "POST",
        body: data,
        credentials: "include" as const
      }),
    }),
    
    // Add review for course
    addCourseReview: builder.mutation({
      query: (data) => ({
        url: `course/create`,
        method: "POST",
        body: data,
        credentials: "include" as const
      }),
    }),
    
    // Add reply to mentor review
    addReplyToMentorReview: builder.mutation({
      query: (data) => ({
        url: `mentor/reply/${data.reviewId}`,
        method: "POST",
        body: { content: data.comment },
        credentials: "include" as const
      }),
    }),
    
    // Add reply to course review
    addReplyToCourseReview: builder.mutation({
      query: (data) => ({
        url: `course/reply/${data.reviewId}`,
        method: "POST",
        body: { content: data.comment },
        credentials: "include" as const
      }),
    }),
  }),
});

export const {
  useGetMentorReviewsQuery,
  useGetCourseReviewsQuery,
  useGetMentorCourseReviewsQuery,
  useAddMentorReviewMutation,
  useAddCourseReviewMutation,
  useAddReplyToMentorReviewMutation,
  useAddReplyToCourseReviewMutation,
} = reviewApi; 