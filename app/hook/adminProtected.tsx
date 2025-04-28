import React, { useEffect, useState, createContext, useContext } from "react";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";

// Tạo context để truyền role
export const UserRoleContext = createContext<string | null>(null);

export const useUserRole = () => useContext(UserRoleContext);

interface ProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: ProtectedProps) {
  const { user } = useSelector((state: any) => state.auth);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Đặt role hiện tại là admin khi vào route admin
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "admin");
    }

    if (user) {
      // Kiểm tra nếu user có role là admin hoặc mentor
      if (user?.role === "admin" || user?.role === "mentor") {
        // Lưu role vào localStorage theo tên role
        if (typeof window !== "undefined") {
          localStorage.setItem("current_role", user.role);
          setUserRole(user.role);
        }
      } else {
        redirect("/");
      }
    } else {
      // Kiểm tra xem có token admin hoặc mentor không
      if (typeof window !== "undefined") {
        const adminToken = localStorage.getItem("admin_accessToken");
        const mentorToken = localStorage.getItem("mentor_accessToken");
        const currentRole = localStorage.getItem("current_role");
        
        if (adminToken && currentRole === "admin") {
          setUserRole("admin");
        } else if (mentorToken && currentRole === "mentor") {
          setUserRole("mentor");
        } else {
          redirect("/");
        }
      } else {
        redirect("/");
      }
    }
  }, [user]);

  if (userRole === null) {
    return null;
  }

  // Sử dụng context để truyền role cho children
  return (
    <UserRoleContext.Provider value={userRole}>
      {children}
    </UserRoleContext.Provider>
  );
}
