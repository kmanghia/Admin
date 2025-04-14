import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userLoggedOut} from "./authSlice";
import Cookies from "js-cookie";

//thêm mới các endpoint vào apislice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //thay đổi dữ liệu(t,s,x)
    login: builder.mutation({
      query: ({ email, password }) => ({
        url: "login",
        method: "POST",
        body: {
          email,
          password,
        },
        //các cookie (chứa token) sẽ tự động được trình duyệt gửi trong mỗi yêu cầu
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          const user = result.data.user;
          const accessToken = result.data.accessToken;
          const refreshToken = result.data.refreshToken;

          // Hỗ trợ tương thích ngược với cookie
          Cookies.set("accessToken", accessToken);
          Cookies.set("refreshToken", refreshToken);
          
          // Lưu token theo role trong localStorage
          if (user && (user.role === "admin" || user.role === "mentor")) {
            localStorage.setItem(`${user.role}_accessToken`, accessToken);
            localStorage.setItem(`${user.role}_refreshToken`, refreshToken);
            localStorage.setItem("current_role", user.role);
          }
          
          dispatch(
            userLoggedIn({
              accessToken,
              refreshToken,
              user,
            })
          );
        } catch (error: any) {
          console.log(error);
        }
      },
    }),
    logOut: builder.query({
      query: () => ({
        url: "logout",
        method: "GET",
        credentials: "include" as const,
      }),
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          // Xác định role hiện tại để xóa đúng token
          const currentRole = localStorage.getItem("current_role");
          if (currentRole) {
            localStorage.removeItem(`${currentRole}_accessToken`);
            localStorage.removeItem(`${currentRole}_refreshToken`);
            localStorage.removeItem("current_role");
          }
          
          // Xóa cookies cho tương thích ngược
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          
          dispatch(userLoggedOut());
        } catch (error: any) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogOutQuery,
} = authApi;
