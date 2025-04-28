import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
import Cookies from "js-cookie";

//Thực hiện yêu cầu api và quản lý trạng thái đến dữ liệu
//Tạo ra slide cho api
//định nghĩa các endpoint cho api
export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
      baseUrl: process.env.NEXT_PUBLIC_SERVER_URI,
      prepareHeaders: (headers) => {
        // Lấy role hiện tại từ localStorage
        const currentRole = localStorage.getItem("current_role") || "";
        
        // Nếu có role cụ thể, sử dụng token tương ứng với role đó
        let accessToken, refreshToken;
        
        if (currentRole === "admin" || currentRole === "mentor") {
          accessToken = localStorage.getItem(`${currentRole}_accessToken`);
          refreshToken = localStorage.getItem(`${currentRole}_refreshToken`);
        } else {
          // Fallback vào cookies cũ nếu không có role cụ thể
          accessToken = Cookies.get("accessToken");
          refreshToken = Cookies.get("refreshToken");
        }
        
        console.log("Current role:", currentRole);
        console.log("Using token:", accessToken);
  
        if (accessToken) {
          headers.set("access-token", accessToken);
        }
        if (refreshToken) {
          headers.set("refresh-token", refreshToken);
        }
        return headers;
      },
    }),
    //url hoặc đường dẫn cụ thể
    endpoints: (builder) => ({
        refreshToken: builder.query({
          query: (data) => ({
            url: "refresh",
            method: "GET",
            credentials: "include" as const,
          }),
        }),
        loadUser: builder.query({
          query: () => ({
            url: "me",
            method: "GET",
            //thông tin xác thực sẽ được gửi đi
            credentials: "include" as const,
          }),
          //hàm này được gọi khi truy vấn bắt đầu
          //sau khi truy vấn thành công thì dispatch action userLoggedIn để lưu thng tin người dùng vào redux store
          async onQueryStarted(arg, { queryFulfilled, dispatch }) {
            try {
              const result = await queryFulfilled;
              const user = result.data.user;
              const accessToken = result.data.accessToken;
              const refreshToken = result.data.refreshToken;
              
              // Kiểm tra xem result có trả về đúng dữ liệu không
              console.log("LoadUser result:", result.data);
              
              if (!user || !accessToken || !refreshToken) {
                console.error("LoadUser missing data:", { user, accessToken, refreshToken });
                return;
              }
              
              // Nếu là admin hoặc mentor, lưu token theo role
              if (user && (user.role === "admin" || user.role === "mentor")) {
                localStorage.setItem(`${user.role}_accessToken`, accessToken);
                localStorage.setItem(`${user.role}_refreshToken`, refreshToken);
                localStorage.setItem("current_role", user.role);
                
                console.log(`Stored ${user.role} tokens in localStorage`);
              }
              
              dispatch(
                userLoggedIn({
                  accessToken,
                  refreshToken,
                  user,
                })
              );
            } catch (error: any) {
              console.log("LoadUser error:", error);
            }
          },
        })
    })
})

export const { useRefreshTokenQuery, useLoadUserQuery } = apiSlice;
