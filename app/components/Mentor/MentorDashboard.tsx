import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Box, Grid, Typography } from "@mui/material";
import {
  PeopleOutlinedIcon,
  BarChartOutlinedIcon,
  VideoCallIcon,
  StarIcon,
} from "../Admin/sidebar/Icon";
import { useSelector } from "react-redux";
import { useGetMentorInfoQuery, useGetMentorStudentsQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "../Loader/Loader";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {};

const MentorDashboard = (props: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const { theme } = useTheme();
  const { data, isLoading, refetch } = useGetMentorInfoQuery({}, { refetchOnMountOrArgChange: true });
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const { isLoading: studentsLoading, data: studentsData } = useGetMentorStudentsQuery({}, { refetchOnMountOrArgChange: true });

  useEffect(() => {
    if (studentsData?.success && studentsData?.students) {
      console.log("Students data:", studentsData.students);
      setTotalStudents(studentsData.students.length);
    }
  }, [studentsData]);

  useEffect(() => {
    if (data) {
      setTotalCourses(data?.mentor?.courses?.length || 0);
      let earnings = 0;
      data?.mentor?.courses?.forEach((course: any) => {
        earnings += (course.purchased || 0) * course.price;
      });
      setTotalEarnings(earnings);
      setAverageRating(data?.mentor?.averageRating || 0);
    }
  }, [data]);

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const gradientColors = {
    courses: theme === "dark" ? 
      "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)" : 
      "linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)",
    students: theme === "dark" ? 
      "linear-gradient(135deg, #4158D0 0%, #C850C0 100%)" : 
      "linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)",
    rating: theme === "dark" ? 
      "linear-gradient(135deg, #FFCC33 0%, #FFB347 100%)" : 
      "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    earnings: theme === "dark" ? 
      "linear-gradient(135deg, #00B09B 0%, #96C93D 100%)" : 
      "linear-gradient(135deg, #00B09B 0%, #96C93D 100%)"
  };

  const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
    <motion.div
      variants={itemVariants}
      className="w-full"
      whileHover={{ 
        scale: 1.03,
        transition: { duration: 0.2 }
      }}
    >
      <Box
        sx={{
          background: gradient,
          color: "#fff",
          p: "25px",
          borderRadius: "20px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.1)",
            transform: "translateX(-100%)",
            transition: "transform 0.5s ease",
          },
          "&:hover::before": {
            transform: "translateX(100%)",
          }
        }}
      >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
            position: "relative",
            zIndex: 1
                  }}
                >
                  <Box>
                    <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 1,
                textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
              }}
            >
              {value}
                    </Typography>
                    <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                opacity: 0.9,
                fontSize: "1.1rem"
              }}
            >
              {title}
                    </Typography>
                  </Box>
          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: "50%",
              p: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(5px)"
            }}
          >
            <Icon className="text-[35px]" />
          </Box>
                  </Box>
                </Box>
    </motion.div>
  );

  const ActionCard = ({ title, icon: Icon, href, gradient }: any) => (
    <Link href={href}>
      <motion.div
        whileHover={{ 
          scale: 1.05,
          rotate: [0, -1, 1, -1, 0],
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
        className="w-full"
      >
        <Box
          sx={{
            background: gradient,
            color: "#fff",
            p: "30px",
            borderRadius: "20px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            "&::after": {
              content: '""',
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 50%)",
              opacity: 0,
              transition: "opacity 0.3s ease",
            },
            "&:hover::after": {
              opacity: 1,
            }
          }}
        >
                <Box
                  sx={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
                    display: "flex",
                    alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              backdropFilter: "blur(5px)",
              border: "2px solid rgba(255,255,255,0.2)"
            }}
          >
            <Icon className="text-[40px]" />
          </Box>
                    <Typography
                      variant="h5"
            sx={{
              fontWeight: 600,
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            {title}
                    </Typography>
                  </Box>
      </motion.div>
    </Link>
  );

  return (
    <>
      {isLoading || studentsLoading ? (
        <Loader />
      ) : (
        <Box 
          className="min-h-screen"
          sx={{ 
            p: { xs: "20px", md: "40px" },
            background: theme === "dark" 
              ? "linear-gradient(135deg, #1a1f2c 0%, #2d3748 100%)"
              : "linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)",
          }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Welcome Section */}
            <Box 
              sx={{
                background: theme === "dark"
                  ? "linear-gradient(135deg, #2d3748 0%, #1a1f2c 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                borderRadius: "30px",
                p: "40px",
                mb: "40px",
                boxShadow: theme === "dark" 
                  ? "0 20px 40px rgba(0,0,0,0.3)"
                  : "0 20px 40px rgba(0,0,0,0.1)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "5px",
                  background: "linear-gradient(90deg, #FF6B6B, #4158D0, #FFCC33, #00B09B)",
                }
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography
                  variant="h2"
                  sx={{
                    color: theme === "dark" ? "#fff" : "#1a202c",
                    fontWeight: "bold",
                    mb: 2,
                    background: "linear-gradient(90deg, #FF6B6B, #4158D0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Xin chào, {user?.name}
                </Typography>
                    <Typography
                      variant="h5"
                  sx={{
                    color: theme === "dark" ? "#a0aec0" : "#4a5568",
                    fontWeight: "normal"
                  }}
                >
                  Chào mừng đến với bảng điều khiển giảng viên
                    </Typography>
              </motion.div>
                  </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 5 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Khóa học"
                  value={totalCourses}
                  icon={VideoCallIcon}
                  gradient={gradientColors.courses}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Học viên"
                  value={totalStudents}
                  icon={PeopleOutlinedIcon}
                  gradient={gradientColors.students}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Đánh giá"
                  value={averageRating.toFixed(1)}
                  icon={StarIcon}
                  gradient={gradientColors.rating}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Thu nhập"
                  value={`${totalEarnings.toLocaleString("vi-VN")}đ`}
                  icon={BarChartOutlinedIcon}
                  gradient={gradientColors.earnings}
                />
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{
                  color: theme === "dark" ? "#fff" : "#1a202c",
                  fontWeight: "bold",
                  mb: 4,
                  textAlign: "center",
                  textShadow: theme === "dark" 
                    ? "2px 2px 4px rgba(0,0,0,0.3)"
                    : "2px 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                Hành động nhanh
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6} md={4}>
                  <ActionCard
                    title="Tạo khóa học mới"
                    icon={VideoCallIcon}
                    href="/mentor/create-course"
                    gradient={gradientColors.courses}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ActionCard
                    title="Quản lý khóa học"
                    icon={BarChartOutlinedIcon}
                    href="/mentor/courses"
                    gradient={gradientColors.students}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <ActionCard
                    title="Xem đánh giá"
                    icon={StarIcon}
                    href="/mentor/reviews"
                    gradient={gradientColors.rating}
                  />
                </Grid>
              </Grid>
            </Box>
          </motion.div>
        </Box>
      )}
    </>
  );
};

export default MentorDashboard; 