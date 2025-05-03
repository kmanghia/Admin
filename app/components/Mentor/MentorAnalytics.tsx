import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { useTheme } from "next-themes";
import { useGetMentorCoursesQuery } from "@/redux/features/mentor/mentorCoursesApi";
import { useGetMentorStudentsQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần Chart.js
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MentorAnalytics = () => {
  const { theme } = useTheme();
  const { isLoading: isCoursesLoading, data: coursesData } = useGetMentorCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const { isLoading: isStudentsLoading, data: studentsData } = useGetMentorStudentsQuery({}, { refetchOnMountOrArgChange: true });
  
  const [courseStats, setCourseStats] = useState<any>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    averageRating: 0,
  });

  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [courseDistribution, setCourseDistribution] = useState<any[]>([]);
  const [ratingDistribution, setRatingDistribution] = useState<any[]>([]);

  useEffect(() => {
    if (coursesData && coursesData.courses) {
      let totalStudents = 0;
      let totalRevenue = 0;
      let totalRatings = 0;
      let totalRatingCount = 0;
      
      // Data for course distribution
      const courseData: { [key: string]: number } = {};
      
      // Data for rating distribution
      const ratingData: { [key: string]: number } = {
        "5 sao": 0,
        "4 sao": 0,
        "3 sao": 0,
        "2 sao": 0,
        "1 sao": 0,
      };
      
      coursesData.courses.forEach((course: any) => {
        // Add course to distribution
        courseData[course.name] = course.purchased || 0;
        
        // Count total students and revenue
        totalStudents += course.purchased || 0;
        totalRevenue += (course.purchased || 0) * course.price;
        
        // Calculate ratings
        if (course.ratings) {
          totalRatings += course.ratings;
          totalRatingCount++;
        }
        
        // Add ratings to distribution
        if (course.reviews && course.reviews.length > 0) {
          course.reviews.forEach((review: any) => {
            if (review.rating === 5) ratingData["5 sao"]++;
            else if (review.rating === 4) ratingData["4 sao"]++;
            else if (review.rating === 3) ratingData["3 sao"]++;
            else if (review.rating === 2) ratingData["2 sao"]++;
            else if (review.rating === 1) ratingData["1 sao"]++;
          });
        }
      });
      
      // Set stats
      setCourseStats({
        totalCourses: coursesData.courses.length,
        totalStudents,
        totalRevenue,
        averageRating: totalRatingCount > 0 ? (totalRatings / totalRatingCount).toFixed(1) : 0,
      });
      
      // Generate course distribution data
      const courseDistData = Object.keys(courseData).map(name => ({
        name,
        students: courseData[name],
      }));
      setCourseDistribution(courseDistData);
      
      // Generate rating distribution data
      const ratingDistData = Object.keys(ratingData).map(rating => ({
        rating,
        count: ratingData[rating],
      }));
      setRatingDistribution(ratingDistData);
    }
  }, [coursesData]);
  
  // Process monthly revenue based on student purchase dates
  useEffect(() => {
    if (studentsData && studentsData.students) {
      // Data for monthly revenue
      const monthlyData: { [key: string]: number } = {};
      const currentYear = new Date().getFullYear();
      
      studentsData.students.forEach((student: any) => {
        if (student.courses && student.courses.length > 0) {
          student.courses.forEach((course: any) => {
            if (course.purchaseDate) {
              const purchaseDate = new Date(course.purchaseDate);
              
              // Only consider current year
              if (purchaseDate.getFullYear() === currentYear) {
                const monthKey = purchaseDate.getMonth(); // 0-11
                
                // Add to monthly revenue
                if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += course.price;
              }
            }
          });
        }
      });
      
      // Generate monthly revenue data for chart
      const monthlyRevData = [];
      const months = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
      
      for (let i = 0; i < 12; i++) {
        monthlyRevData.push({
          month: months[i],
          revenue: monthlyData[i] || 0,
        });
      }
      setMonthlyRevenue(monthlyRevData);
    }
  }, [studentsData]);

  // Chart data
  const monthlyRevenueData = {
    labels: monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Doanh thu',
        data: monthlyRevenue.map(item => item.revenue),
        backgroundColor: theme === 'dark' ? 'rgba(75, 192, 192, 0.2)' : 'rgba(54, 162, 235, 0.2)',
        borderColor: theme === 'dark' ? 'rgb(75, 192, 192)' : 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  };
  
  const courseDistributionData = {
    labels: courseDistribution.map(item => item.name),
    datasets: [
      {
        label: 'Số học viên',
        data: courseDistribution.map(item => item.students),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const ratingDistributionData = {
    labels: ratingDistribution.map(item => item.rating),
    datasets: [
      {
        label: 'Số lượng đánh giá',
        data: ratingDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === "dark" ? "#fff" : "#000"
        }
      },
      title: {
        display: true,
        text: 'Thống kê theo thời gian',
        color: theme === "dark" ? "#fff" : "#000"
      },
    },
    scales: {
      y: {
        ticks: {
          color: theme === "dark" ? "#fff" : "#000"
        },
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        }
      },
      x: {
        ticks: {
          color: theme === "dark" ? "#fff" : "#000"
        },
        grid: {
          color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        }
      }
    }
  };

  return (
    <div className="mt-[30px]">
      {isCoursesLoading || isStudentsLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Thống kê
              </Typography>
              <Typography variant="h5" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                Phân tích chi tiết về hiệu suất khóa học của bạn
              </Typography>
            </Box>
          </Box>

          {/* Stats Summary */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>Tổng số khóa học</Typography>
                <Typography variant="h3" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {courseStats.totalCourses}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>Tổng số học viên</Typography>
                <Typography variant="h3" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {courseStats.totalStudents}
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>Tổng doanh thu</Typography>
                <Typography variant="h3" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {courseStats.totalRevenue.toLocaleString('vi-VN')}đ
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                  textAlign: 'center'
                }}
              >
                <Typography variant="h6" gutterBottom>Đánh giá trung bình</Typography>
                <Typography variant="h3" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {courseStats.averageRating} / 5
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                <Typography variant="h6" mb={2} align="center">Doanh thu theo tháng</Typography>
                <Box height="300px">
                  <Bar data={monthlyRevenueData} options={options} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                <Typography variant="h6" mb={2} align="center">Phân bố học viên theo khóa học</Typography>
                <Box height="300px" sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Pie data={courseDistributionData} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper 
                elevation={0}
                sx={{
                  p: 3,
                  backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              >
                <Typography variant="h6" mb={2} align="center">Phân bố đánh giá</Typography>
                <Box height="300px">
                  <Bar data={ratingDistributionData} options={options} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
};

export default MentorAnalytics; 