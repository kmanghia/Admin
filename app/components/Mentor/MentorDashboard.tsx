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
import { useGetMentorInfoQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "../Loader/Loader";
import Link from "next/link";

type Props = {};

const MentorDashboard = (props: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const { theme } = useTheme();
  const { data, isLoading, refetch } = useGetMentorInfoQuery({}, { refetchOnMountOrArgChange: true });
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  console.log(data)
  useEffect(() => {
    if (data) {
      setTotalCourses(data?.mentor?.courses?.length || 0);
      
      // Calculate total students (purchased courses)
      let students = 0;
      let earnings = 0;
      data?.mentor?.courses?.forEach((course: any) => {
        students += course.purchased || 0;
        earnings += (course.purchased || 0) * course.price;
      });
      setTotalStudents(students);
      setTotalEarnings(earnings);
      setAverageRating(data?.mentor?.averageRating || 0);
    }
  }, [data]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box mb="20px">
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Xin chào, {user?.name}
              </Typography>
              <Typography variant="h5" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                Chào mừng đến với bảng điều khiển Mentor
              </Typography>
            </Box>

            {/* Hiển thị trạng thái phê duyệt
            {data?.mentor?.applicationStatus === "pending" && (
              <Box
                className="w-full bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6"
                sx={{ color: "rgb(180, 83, 9)" }}
              >
                <p className="font-semibold">Tài khoản mentor của bạn đang chờ phê duyệt</p>
                <p className="text-sm">Một số tính năng có thể bị hạn chế cho đến khi tài khoản của bạn được phê duyệt.</p>
              </Box>
            )}

            {data?.mentor?.applicationStatus === "rejected" && (
              <Box
                className="w-full bg-red-100 border-l-4 border-red-500 p-4 mb-6"
                sx={{ color: "rgb(185, 28, 28)" }}
              >
                <p className="font-semibold">Tài khoản mentor của bạn đã bị từ chối</p>
                <p className="text-sm">Vui lòng liên hệ với bộ phận hỗ trợ để biết thêm thông tin.</p>
              </Box>
            )} */}

            {/* GRID & CHARTS */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "15px",
                    borderRadius: "4px"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      {totalCourses}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      Khóa học
                    </Typography>
                  </Box>
                  <Box>
                    <VideoCallIcon
                      className={`${
                        theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                      } text-[40px]`}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "15px",
                    borderRadius: "4px"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      {totalStudents}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      Học viên
                    </Typography>
                  </Box>
                  <Box>
                    <PeopleOutlinedIcon
                      className={`${
                        theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                      } text-[40px]`}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "15px",
                    borderRadius: "4px"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      {averageRating.toFixed(1)}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      Đánh giá
                    </Typography>
                  </Box>
                  <Box>
                    <StarIcon
                      className={`${
                        theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                      } text-[40px]`}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box
                  sx={{
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: "15px",
                    borderRadius: "4px"
                  }}
                >
                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      {totalEarnings.toLocaleString("vi-VN")}đ
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                    >
                      Thu nhập
                    </Typography>
                  </Box>
                  <Box>
                    <BarChartOutlinedIcon
                      className={`${
                        theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                      } text-[40px]`}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>

            {/* Actions */}
            <Box mt="30px">
              <Typography
                variant="h5"
                sx={{ color: theme === "dark" ? "#fff" : "#000", mb: 2 }}
              >
                Hành động nhanh
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Link href="/mentor/create-course">
                    <Box
                      sx={{
                        backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                        p: "15px",
                        borderRadius: "4px",
                        textAlign: "center"
                      }}
                      className="hover:opacity-90 transition-all cursor-pointer"
                    >
                      <VideoCallIcon
                        className={`${
                          theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                        } text-[40px] mx-auto mb-2`}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                      >
                        Tạo khóa học mới
                      </Typography>
                    </Box>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Link href="/mentor/courses">
                    <Box
                      sx={{
                        backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                        p: "15px",
                        borderRadius: "4px",
                        textAlign: "center"
                      }}
                      className="hover:opacity-90 transition-all cursor-pointer"
                    >
                      <BarChartOutlinedIcon
                        className={`${
                          theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                        } text-[40px] mx-auto mb-2`}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                      >
                        Quản lý khóa học
                      </Typography>
                    </Box>
                  </Link>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Link href="/mentor/reviews">
                    <Box
                      sx={{
                        backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                        p: "15px",
                        borderRadius: "4px",
                        textAlign: "center"
                      }}
                      className="hover:opacity-90 transition-all cursor-pointer"
                    >
                      <StarIcon
                        className={`${
                          theme === "dark" ? "text-[#23d18b]" : "text-[#1565c0]"
                        } text-[40px] mx-auto mb-2`}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: theme === "dark" ? "#fff" : "#000" }}
                      >
                        Xem đánh giá
                      </Typography>
                    </Box>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MentorDashboard; 