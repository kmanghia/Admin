import { apiSlice } from "../api/apiSlice";

export const mentorCoursesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMentorCourses: builder.query({
      query: () => ({
        url: "courses",
        method: "GET",
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
    
    updateCourse: builder.mutation({
      query: ({ courseId, data }) => ({
        url: `update/${courseId}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
    }),
    
    getCourseForEdit: builder.query({
      query: (courseId) => ({
        url: `edit/${courseId}`,
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    
    deleteCourse: builder.mutation({
      query: (courseId) => ({
        url: `delete-course/${courseId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useGetMentorCoursesQuery,
  useCreateCourseDraftMutation,
  useUpdateCourseMutation,
  useGetCourseForEditQuery,
  useDeleteCourseMutation,
} = mentorCoursesApi; 