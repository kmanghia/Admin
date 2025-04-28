"use client";
import { FC, useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Box, Typography, Avatar } from "@mui/material";
import {
  HomeOutlinedIcon,
  ArrowForwardIosIcon,
  ArrowBackIosIcon,
  PeopleOutlinedIcon,
  ReceiptOutlinedIcon,
  BarChartOutlinedIcon,
  MapOutlinedIcon,
  GroupsIcon,
  OndemandVideoIcon,
  VideoCallIcon,
  WebIcon,
  QuizIcon,
  WysiwygIcon,
  ManageHistoryIcon,
  SettingsIcon,
  ExitToAppIcon,
} from "./Icon";
import { useSelector } from "react-redux";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";

interface itemProps {
  title: string;
  to: string;
  icon: JSX.Element;
  selected: string;
  setSelected: any;
}

// CSS cho sidebar animations và effects
const sidebarStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-10px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .menu-item {
    animation: slideIn 0.3s ease-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  .sidebar-shadow {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  }
  
  .user-profile-gradient {
    background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05));
  }
  
  .logo-shine {
    position: relative;
    overflow: hidden;
  }
  
  .logo-shine::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to right,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transform: rotate(30deg);
    animation: shine 4s infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%) rotate(30deg); }
    20%, 100% { transform: translateX(100%) rotate(30deg); }
  }
  
  .pulse-dot {
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(59, 130, 246, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  
  .menu-category-line {
    position: relative;
  }
  
  .menu-category-line::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    height: 1px;
    width: 8px;
    background: currentColor;
    margin-left: -16px;
  }
`;

const Item: FC<itemProps> = ({ title, to, icon, selected, setSelected }) => {
  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
      className={`menu-item hover:!bg-gray-100 dark:hover:!bg-gray-800 py-3 my-1 rounded-xl transition-all duration-300 ${
        selected === title 
          ? "!bg-gradient-to-r !from-blue-50 !to-indigo-50 dark:!from-blue-900/20 dark:!to-indigo-900/20 !border-l-4 !border-blue-500" 
          : ""
      }`}
      style={{
        color: selected === title ? "#3b82f6" : undefined,
      }}
    >
      <Link href={to}>
        <Typography className="!text-[15px] !font-medium font-sans transition-all duration-300 transform group-hover:translate-x-1">
          {title}
        </Typography>
      </Link>
    </MenuItem>
  );
};

const CategoryLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography
    variant="caption"
    className="menu-category-line text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 px-4 py-2 tracking-wider flex items-center"
  >
    <span className="h-1 w-1 rounded-full bg-blue-500 mr-2 pulse-dot"></span>
    {children}
  </Typography>
);

const AdminSidebar = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // Danh sách các trang và tiêu đề tương ứng
  const pageMap: Record<string, string> = {
    "/admin": "Dashboard",
    "/admin/users": "Người dùng",
    "/admin/invoices": "Hóa đơn",
    "/admin/create-course": "Tạo khóa học",
    "/admin/courses": "Khóa học",
    "/admin/faq": "FAQ",
    "/admin/categories": "Danh mục",
    "/admin/team": "Thành viên",
    "/admin/pending-courses": "Khóa học chờ duyệt",
    "/admin/courses-analytics": "Khóa học",
    "/admin/orders-analytics": "Đơn hàng",
    "/admin/users-analytics": "Người dùng"
  };

  // Cập nhật selected dựa trên URL khi component mount và khi route thay đổi
  useEffect(() => {
    if (pathname) {
      // Tìm exact match trước
      if (pageMap[pathname]) {
        setSelected(pageMap[pathname]);
      } else {
        // Nếu không có exact match, tìm partial match
        const matchingPath = Object.keys(pageMap).find(path => 
          pathname.startsWith(path) && path !== "/admin"
        );
        
        if (matchingPath) {
          setSelected(pageMap[matchingPath]);
        } else if (pathname.startsWith("/admin")) {
          // Fallback nếu là trang admin khác
          setSelected("Dashboard");
        }
      }
    }
  }, [pathname]);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  const logoutHandler = async () => {
    // Xóa cookies cũ (để tương thích ngược)
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    
    // Xóa token trong localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_accessToken");
      localStorage.removeItem("admin_refreshToken");
      localStorage.removeItem("current_role");
      
      // Xóa cả sessionStorage cho an toàn
      sessionStorage.removeItem("userRole");
      sessionStorage.removeItem("tabSessionId");
    }
    
    // Chuyển hướng đến trang chính
    window.location.href = "/";
  };

  const avatarUrl = user?.avatar?.url || "/avatar.png";

  return (
    <>
      <style jsx global>{sidebarStyles}</style>
      <Box
        className="h-screen fixed top-0 left-0 z-[9999] sidebar-shadow transition-all duration-300"
        sx={{
          "& .ps-sidebar-root": {
            border: "none !important",
          },
          "& .ps-sidebar-container": {
            background: theme === "dark" 
              ? "linear-gradient(180deg, #111827 0%, #1E293B 100%)" 
              : "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
          },
          "& .ps-menu-button:hover": {
            backgroundColor: "transparent !important",
          },
          "& .ps-menu-button": {
            padding: "8px 16px !important",
          },
          "& .ps-menu-icon": {
            marginRight: "12px !important",
          }
        }}
      >
        <Sidebar
          collapsed={isCollapsed}
          width={isCollapsed ? "80px" : "270px"}
          className={`h-full border-r border-gray-200 dark:border-gray-800 overflow-y-auto overflow-x-hidden no-scrollbar animate-fadeIn`}
        >
          <Menu
            closeOnClick
            menuItemStyles={{
              button: {
                [`&.active`]: {
                  backgroundColor: theme === "dark" ? "#1E3A8A" : "#EFF6FF",
                  color: theme === "dark" ? "#FFFFFF" : "#3B82F6",
                },
              },
            }}
          >
            {/* LOGO AND MENU ICON */}
            <Box className={`flex items-center justify-between py-3 px-4 mb-6 mt-2 border-b border-gray-200 dark:border-gray-800`}>
              {!isCollapsed ? (
                <Link href="/" className="flex items-center group">
                  <div className="logo-shine bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300">
                    LS
                  </div>
                  <div className="ml-2">
                    <Typography variant="h6" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                      LMS Admin
                    </Typography>
                    <Typography variant="caption" className="text-gray-500 dark:text-gray-400 text-xs">
                      Quản lý hệ thống
                    </Typography>
                  </div>
                </Link>
              ) : (
                <div className="logo-shine bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-lg shadow-md mx-auto hover:shadow-lg transition-all duration-300">
                  LS
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <ArrowBackIosIcon className="text-gray-600 dark:text-gray-300" fontSize="small" />
                </button>
              )}
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1.5 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all absolute -right-3 top-3"
                >
                  <ArrowForwardIosIcon className="text-gray-600 dark:text-gray-300" fontSize="small" />
                </button>
              )}
            </Box>

            {/* USER PROFILE */}
            {!isCollapsed && (
              <Box className="px-4 py-3 mb-6 mx-3 rounded-xl user-profile-gradient">
                <Box className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <Avatar
                      src={avatarUrl}
                      alt={user?.name || "Admin"}
                      sx={{ 
                        width: 50, 
                        height: 50,
                        border: "2px solid white",
                        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
                      }}
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  </div>
                  <Box>
                    <Typography className="font-medium text-gray-900 dark:text-gray-100">
                      {user?.name || "Admin"}
                    </Typography>
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                      <Typography variant="caption" className="text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role}
                      </Typography>
                    </div>
                  </Box>
                </Box>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    <SettingsIcon fontSize="small" className="mr-1" style={{ fontSize: 14 }} />
                    Cài đặt
                  </button>
                  <button className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                    Hồ sơ
                    <ArrowForwardIosIcon fontSize="small" className="ml-1" style={{ fontSize: 10 }} />
                  </button>
                </div>
              </Box>
            )}

            {/* MENU ITEMS */}
            <Box className="px-4">
              <Item
                title="Dashboard"
                to="/admin"
                icon={<HomeOutlinedIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <CategoryLabel>Dữ liệu</CategoryLabel>
              </Box>
              <Item
                title="Người dùng"
                to="/admin/users"
                icon={<GroupsIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Hóa đơn"
                to="/admin/invoices"
                icon={<ReceiptOutlinedIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <CategoryLabel>Nội dung</CategoryLabel>
              </Box>
              <Item
                title="Tạo khóa học"
                to="/admin/create-course"
                icon={<VideoCallIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Khóa học"
                to="/admin/courses"
                icon={<OndemandVideoIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <CategoryLabel>Tùy chỉnh</CategoryLabel>
              </Box>
              <Item
                title="FAQ"
                to="/admin/faq"
                icon={<QuizIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Danh mục"
                to="/admin/categories"
                icon={<WysiwygIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <CategoryLabel>Quản lý</CategoryLabel>
              </Box>
              <Item
                title="Thành viên"
                to="/admin/team"
                icon={<PeopleOutlinedIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Khóa học chờ duyệt"
                to="/admin/pending-courses"
                icon={<OndemandVideoIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <CategoryLabel>Thống kê</CategoryLabel>
              </Box>
              <Item
                title="Khóa học"
                to="/admin/courses-analytics"
                icon={<BarChartOutlinedIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Đơn hàng"
                to="/admin/orders-analytics"
                icon={<MapOutlinedIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Người dùng"
                to="/admin/users-analytics"
                icon={<ManageHistoryIcon className="text-gray-600 dark:text-gray-300" />}
                selected={selected}
                setSelected={setSelected}
              />

              <Box className="mt-6 mb-2">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                  <button
                    onClick={logoutHandler}
                    className="w-full flex items-center space-x-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 text-red-500 p-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow group"
                  >
                    <ExitToAppIcon className="group-hover:rotate-12 transition-transform duration-300" />
                    {!isCollapsed && (
                      <span className="font-medium">Đăng xuất</span>
                    )}
                  </button>
                </div>
              </Box>
            </Box>
          </Menu>
        </Sidebar>
      </Box>
    </>
  );
};

export default AdminSidebar;
