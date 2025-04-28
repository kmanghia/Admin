import React, { FC, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { useGetAllUsersQuery } from "@/redux/features/user/userApi";
import { useGetAllCoursesQuery } from "@/redux/features/courses/coursesApi";
import { useGetAllOrdersQuery } from "@/redux/features/orders/ordersApi";
import UserAnalytics from "../Analytics/UserAnalytics";
import OrdersAnalytics from "../Analytics/OrdersAnalytics";
import CourseAnalytics from "../Analytics/CourseAnalytics";
import Loader from "../../Loader/Loader";
import { FaUsers, FaUserTie, FaBook, FaMoneyBillWave } from "react-icons/fa";

const DashboardWidgets = () => {
  // Fetch data
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery({});
  const { data: coursesData, isLoading: coursesLoading } = useGetAllCoursesQuery({});
  const { data: ordersData, isLoading: ordersLoading } = useGetAllOrdersQuery({});

  // Stats
  const [userCount, setUserCount] = useState(0);
  const [mentorCount, setMentorCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Calculate stats when data is loaded
  useEffect(() => {
    if (usersData) {
      const users = usersData.users.filter((user: any) => user.role === "user");
      const mentors = usersData.users.filter((user: any) => user.role === "mentor");
      setUserCount(users.length);
      setMentorCount(mentors.length);
    }

    if (coursesData) {
      setCourseCount(coursesData.courses.length);
    }

    if (ordersData && coursesData) {
      let total = 0;
      ordersData.orders.forEach((order: any) => {
        // Tìm khóa học tương ứng với courseId trong order
        const course = coursesData.courses.find((course: any) => course._id === order.courseId);
        if (course) {
          // Lấy giá từ khóa học và chuyển đổi thành số
          const price = course.price || 0;
          // Chuyển đổi từ chuỗi "123000đ" thành số 123000
          const numericPrice = typeof price === 'string' 
            ? parseFloat(price.replace(/[^\d.-]/g, '')) 
            : parseFloat(price);
          
          total += numericPrice;
        }
      });
      setTotalRevenue(total);
    }
  }, [usersData, coursesData, ordersData]);

  const isLoading = usersLoading || coursesLoading || ordersLoading;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="min-h-screen ml-[30px] p-6 bg-gray-50 dark:bg-gray-900">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Tổng quan về hệ thống LMS
            </p>
          </motion.div>
          
          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* User Card */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">
                    Người dùng
                  </p>
                  <p className="text-white text-3xl font-bold mt-1">
                    {userCount}
                  </p>
                </div>
                <div className="bg-blue-400 p-3 rounded-lg text-white shadow-md">
                  <FaUsers size={32} />
                </div>
              </div>
              <div className="bg-black bg-opacity-10 px-6 py-2">
                <p className="text-white text-opacity-80 text-xs">
                  Tổng số người dùng có role "user"
                </p>
              </div>
            </motion.div>

            {/* Mentor Card */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">
                    Giảng viên
                  </p>
                  <p className="text-white text-3xl font-bold mt-1">
                    {mentorCount}
                  </p>
                </div>
                <div className="bg-purple-400 p-3 rounded-lg text-white shadow-md">
                  <FaUserTie size={32} />
                </div>
              </div>
              <div className="bg-black bg-opacity-10 px-6 py-2">
                <p className="text-white text-opacity-80 text-xs">
                  Tổng số người dùng có role "mentor"
                </p>
              </div>
            </motion.div>

            {/* Course Card */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">
                    Khóa học
                  </p>
                  <p className="text-white text-3xl font-bold mt-1">
                    {courseCount}
                  </p>
                </div>
                <div className="bg-emerald-400 p-3 rounded-lg text-white shadow-md">
                  <FaBook size={32} />
                </div>
              </div>
              <div className="bg-black bg-opacity-10 px-6 py-2">
                <p className="text-white text-opacity-80 text-xs">
                  Tổng số khóa học trong hệ thống
                </p>
              </div>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-white text-opacity-80 text-sm font-medium">
                    Doanh thu
                  </p>
                  <p className="text-white text-3xl font-bold mt-1">
                    {formatPrice(totalRevenue)} ₫
                  </p>
                </div>
                <div className="bg-amber-400 p-3 rounded-lg text-white shadow-md">
                  <FaMoneyBillWave size={32} />
                </div>
              </div>
              <div className="bg-black bg-opacity-10 px-6 py-2">
                <p className="text-white text-opacity-80 text-xs">
                  Tổng doanh thu từ các đơn hàng
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Recent Activities and User Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-800 dark:text-white">Thống kê người dùng</h2>
              </div>
              <div className="p-2 h-[300px]">
          <UserAnalytics isDashboard={true} />
              </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-800 dark:text-white">Phân bố người dùng</h2>
              </div>
              <div className="flex items-center justify-center p-6 h-[300px]">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      {/* Background circle */}
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="15.91" 
                        fill="none" 
                        stroke="#E0E0E0" 
                        strokeWidth="3" 
                        className="dark:opacity-20"
                      />
                      
                      {/* User slice */}
                      {userCount + mentorCount > 0 && (
                        <>
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="15.91" 
                            fill="none" 
                            stroke="#3B82F6" 
                            strokeWidth="3" 
                            strokeDasharray={`${userCount / (userCount + mentorCount) * 100}, 100`} 
                            strokeDashoffset="25"
                            className="origin-center -rotate-90"
                          />
                          
                          {/* Mentor slice */}
                          <circle 
                            cx="18" 
                            cy="18" 
                            r="15.91" 
                            fill="none" 
                            stroke="#8B5CF6" 
                            strokeWidth="3" 
                            strokeDasharray={`${mentorCount / (userCount + mentorCount) * 100}, 100`} 
                            strokeDashoffset={`${-userCount / (userCount + mentorCount) * 100 + 25}`}
                            className="origin-center -rotate-90"
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700 dark:text-gray-200">
                        {userCount + mentorCount}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Tổng</span>
        </div>
      </div>

                  <div className="flex justify-center mt-4 space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        User: {userCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Mentor: {mentorCount}
                      </span>
                    </div>
                  </div>
        </div>
      </div>
            </motion.div>
          </div>

          {/* Course Analytics and Orders Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-800 dark:text-white">Thống kê khóa học</h2>
              </div>
              <div className="p-2 h-[300px]">
          <CourseAnalytics isDashboard={true} />
        </div>
            </motion.div>

            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-gray-800 dark:text-white">Thống kê đơn hàng</h2>
              </div>
              <div className="p-2 h-[300px]">
                <OrdersAnalytics isDashboard={true} />
              </div>
            </motion.div>
      </div>
    </div>
      )}
    </>
  );
};

export default DashboardWidgets;