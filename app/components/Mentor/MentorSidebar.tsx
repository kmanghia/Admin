"use client";
import React, { FC, useEffect, useState } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { RiVideoUploadLine } from "react-icons/ri";
import { SiCoursera } from "react-icons/si";
import { MdOutlineRateReview } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { IoHomeOutline } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { FaRegComments } from "react-icons/fa";
import { BiConversation } from "react-icons/bi";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import { useGetUnreadCountQuery } from "@/redux/features/chat/chatApi";

type Props = {
  active: number;
  setActive: (active: number) => void;
};

const MentorSidebar: FC<Props> = ({ active, setActive }) => {
  const { user } = useSelector((state: any) => state.auth);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { data: unreadData } = useGetUnreadCountQuery({}, {
    pollingInterval: 30000, // Poll every 30 seconds
  });

  useEffect(() => {
    setMounted(true);
    
    // Khi truy cập trang mentor, đặt current_role là mentor
    if (typeof window !== "undefined") {
      localStorage.setItem("current_role", "mentor");
    }
  }, []);

  if (!mounted) {
    return null;
  }

  const logoutHandler = () => {
    // Xóa cookies cũ (để tương thích ngược)
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    
    // Xóa token trong localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("mentor_accessToken");
      localStorage.removeItem("mentor_refreshToken");
      localStorage.removeItem("current_role");
      
      // Xóa cả sessionStorage cho an toàn
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("tabSessionId");
    }
    
    // Chuyển hướng đến trang chính
    window.location.href = "/";
  };

  const sidebarItems = [
    {
      icon: <IoHomeOutline className="text-xl" />,
      title: "Tổng quan",
      path: "/mentor/dashboard",
      id: 1,
    },
    {
      icon: <SiCoursera className="text-xl" />,
      title: "Khóa học",
      path: "/mentor/courses",
      id: 2,
    },
    {
      icon: <MdOutlineRateReview className="text-xl" />,
      title: "Đánh giá",
      path: "/mentor/reviews",
      id: 3,
    },
    {
      icon: <HiOutlineUserGroup className="text-xl" />,
      title: "Học viên",
      path: "/mentor/students",
      id: 4,
    },
    {
      icon: <TbReportAnalytics className="text-xl" />,
      title: "Thống kê",
      path: "/mentor/analytics",
      id: 5,
    },
    {
      icon: <RiVideoUploadLine className="text-xl" />,
      title: "Tạo khóa học",
      path: "/mentor/create-course",
      id: 6,
    },
    {
      icon: <FaRegComments className="text-xl" />,
      title: "Tin nhắn",
      path: "/mentor/chats",
      id: 7,
      badge: unreadData?.unreadCount || 0,
    },
    {
      icon: <BiConversation className="text-xl" />,
      title: "Thảo luận bài học",
      path: "/mentor/discussions",
      id: 8,
    },
  ];

  return (
    <div className="w-[250px] h-[100vh] bg-white dark:bg-gray-900 dark:border-[#ffffff1d] border-r border-[#00000014] fixed top-0 left-0 overflow-y-auto" style={{ zIndex: 100 }}>
      <div className="w-full flex items-center justify-center py-8">
        <Link href="/">
          {theme === "dark" ? (
            <Image
              src="/avatar.png"
              alt="logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          ) : (
            <Image
              src="/avatar.png"
              alt="logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          )}
        </Link>
      </div>
      <div className="w-full p-4">
        <div className="w-full mt-4">
          {sidebarItems.map((item) => (
            <Link href={item.path} key={item.id}>
              <div
                className={`w-full flex items-center px-5 py-3 ${
                  active === item.id
                    ? "dark:bg-[#22c48d19] bg-[#1565c00d] dark:border-[#22c58d] border-[#1565c0] border-l-4"
                    : "dark:border-[#ffffff00] border-[#00000000]"
                } cursor-pointer`}
                onClick={() => setActive(item.id)}
              >
                <div
                  className={`${
                    active === item.id
                      ? "dark:text-[#22c58d] text-[#1565c0]"
                      : "dark:text-white text-black"
                  }`}
                >
                  {item.icon}
                </div>
                <h5
                  className={`pl-3 ${
                    active === item.id
                      ? "dark:text-[#22c58d] text-[#1565c0]"
                      : "dark:text-white text-black"
                  } text-[18px] font-[400]`}
                >
                  {item.title}
                </h5>
                {item.badge && item.badge > 0 && (
                  <div className="ml-auto">
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
          
          <div
            className="w-full flex items-center px-5 py-3 cursor-pointer mt-8 border-t dark:border-[#ffffff1d] border-[#00000014] pt-4"
            onClick={logoutHandler}
          >
            <div className="dark:text-white text-black">
              <IoMdLogOut className="text-xl" />
            </div>
            <h5 className="pl-3 dark:text-white text-black text-[18px] font-[400]">
              Đăng xuất
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorSidebar; 