import React, { useEffect, useState } from "react";
import { Box, Typography, Rating, Paper, Avatar, Divider, TextField, InputAdornment, Tabs, Tab } from "@mui/material";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import { useGetMentorInfoQuery } from "@/redux/features/mentor/mentorApi";
import { useGetMentorCoursesQuery } from "@/redux/features/mentor/mentorCoursesApi";
import Loader from "@/app/components/Loader/Loader";
import {URL} from "@/app/utils/url";
import { AiOutlineSearch } from "react-icons/ai";

interface Review {
  _id: string;
  user: {
    _id?: string;
    name?: string;
    avatar?: {
      url?: string;
    };
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface CourseReview {
  _id: string;
  user: {
    _id?: string;
    name?: string;
    avatar?: {
      url?: string;
    };
  };
  rating: number;
  comment: string;
  createdAt: string;
  courseId?: string;
  courseName?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`review-tabpanel-${index}`}
      aria-labelledby={`review-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `review-tab-${index}`,
    'aria-controls': `review-tabpanel-${index}`,
  };
}

const MentorReviews = () => {
  const { theme } = useTheme();
  const { isLoading: isMentorLoading, data: mentorData } = useGetMentorInfoQuery({}, { refetchOnMountOrArgChange: true });
  const { isLoading: isCoursesLoading, data: coursesData } = useGetMentorCoursesQuery({}, { refetchOnMountOrArgChange: true });
  
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filteredCourseReviews, setFilteredCourseReviews] = useState<CourseReview[]>([]);
  const [courseAverageRating, setCourseAverageRating] = useState(0);
  const [totalCourseReviews, setTotalCourseReviews] = useState(0);

  useEffect(() => {
    if (mentorData) {
      console.log("Mentor reviews data:", mentorData.mentor.reviews);
      setReviews(mentorData.mentor.reviews || []);
      setFilteredReviews(mentorData.mentor.reviews || []);
      setAverageRating(mentorData.mentor.averageRating || 0);
    }
  }, [mentorData]);

  // Extract course reviews from courses data
  useEffect(() => {
    if (coursesData && coursesData.courses) {
      const allCourseReviews: CourseReview[] = [];
      let totalRating = 0;
      let reviewCount = 0;
      
      coursesData.courses.forEach((course: any) => {
        if (course.reviews && course.reviews.length > 0) {
          course.reviews.forEach((review: any) => {
            allCourseReviews.push({
              ...review,
              courseId: course._id,
              courseName: course.name
            });
            
            totalRating += review.rating;
            reviewCount++;
          });
        }
      });
      
      setCourseReviews(allCourseReviews);
      setFilteredCourseReviews(allCourseReviews);
      setTotalCourseReviews(allCourseReviews.length);
      setCourseAverageRating(reviewCount > 0 ? totalRating / reviewCount : 0);
    }
  }, [coursesData]);

  // Filter reviews based on search term
  useEffect(() => {
    if (reviews.length > 0) {
      if (!searchTerm) {
        setFilteredReviews(reviews);
      } else {
        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = reviews.filter((review: Review) => {
          const userName = getUserName(review).toLowerCase();
          const comment = review.comment.toLowerCase();
          const ratingStr = review.rating.toString();
          
          return (
            userName.includes(lowercasedSearch) ||
            comment.includes(lowercasedSearch) ||
            ratingStr.includes(searchTerm)
          );
        });
        
        setFilteredReviews(filtered);
      }
    }
    
    if (courseReviews.length > 0) {
      if (!searchTerm) {
        setFilteredCourseReviews(courseReviews);
      } else {
        const lowercasedSearch = searchTerm.toLowerCase();
        const filtered = courseReviews.filter((review: CourseReview) => {
          const userName = getUserName(review).toLowerCase();
          const comment = review.comment.toLowerCase();
          const ratingStr = review.rating.toString();
          const courseName = (review.courseName || "").toLowerCase();
          
          return (
            userName.includes(lowercasedSearch) ||
            comment.includes(lowercasedSearch) ||
            ratingStr.includes(searchTerm) ||
            courseName.includes(lowercasedSearch)
          );
        });
        
        setFilteredCourseReviews(filtered);
      }
    }
  }, [searchTerm, reviews, courseReviews]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to get user display name with fallbacks
  const getUserName = (review: Review | CourseReview): string => {
    if (review?.user?.name) return review.user.name;
    if (typeof review.user === 'string') return "Học viên";
    return "Học viên";
  };

  // Function to get avatar URL with fallbacks
  const getAvatarUrl = (review: Review | CourseReview): string => {
    if (review?.user?.avatar?.url) return `${URL}/images/${review?.user?.avatar?.url}`;
    return "/avatar.png";
  };

  // Group course reviews by course
  const groupedCourseReviews = filteredCourseReviews.reduce((acc: Record<string, CourseReview[]>, review) => {
    const courseName = review.courseName || "Khóa học khác";
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(review);
    return acc;
  }, {});

  return (
    <>
      {isMentorLoading || isCoursesLoading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box display="flex" flexDirection="column" justifyContent="space-between">
            <Box mb="20px">
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Đánh giá 
              </Typography>
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1,
                  borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
                  mb: 2,
                  '& .MuiTab-root': {
                    color: theme === "dark" ? "#fff" : "#000",
                    '&.Mui-selected': {
                      color: theme === "dark" ? "#04d882" : "#1565c0",
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                  }
                }}
              >
                <Tab label={`Đánh giá về bạn (${reviews.length})`} {...a11yProps(0)} />
                <Tab label={`Đánh giá khóa học (${totalCourseReviews})`} {...a11yProps(1)} />
              </Tabs>
            </Box>

            <Box sx={{ mt: 3, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder={tabValue === 0 ? "Tìm kiếm theo tên học viên, nội dung đánh giá, số sao..." : "Tìm kiếm theo tên học viên, tên khóa học, nội dung đánh giá, số sao..."}
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AiOutlineSearch color={theme === "dark" ? "#fff" : "#1565c0"} size={24} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: "8px",
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F8F9FA",
                    color: theme === "dark" ? "#fff" : "#000",
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                    },
                  }
                }}
              />
            </Box>

            <TabPanel value={tabValue} index={0}>
              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body1" ml={1} color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                </Typography>
              </Box>
              
              {filteredReviews.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                >
                  <Typography variant="body1">
                    {searchTerm ? "Không tìm thấy đánh giá phù hợp" : "Bạn chưa nhận được đánh giá nào từ học viên."}
                  </Typography>
                </Paper>
              ) : (
                filteredReviews.map((review) => (
                  <Paper
                    key={review._id}
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 2,
                      backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                      color: theme === "dark" ? "#fff" : "#000",
                    }}
                  >
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar 
                        src={getAvatarUrl(review)} 
                        alt={getUserName(review)}
                        sx={{ width: 40, height: 40, mr: 1 }}
                      />
                      <Box>
                        <Typography variant="body1" fontWeight="bold">
                          {getUserName(review)}
                        </Typography>
                        <Typography variant="caption" color="textPrimary">
                          {review.createdAt ? format(review.createdAt) : ""}
                        </Typography>
                      </Box>
                      <Box ml="auto">
                        <Rating value={review.rating} precision={0.5} readOnly size="small" />
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {review.comment}
                    </Typography>
                  </Paper>
                ))
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={courseAverageRating} precision={0.5} readOnly />
                <Typography variant="body1" ml={1} color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {courseAverageRating.toFixed(1)} ({totalCourseReviews} đánh giá)
                </Typography>
              </Box>
              
              {filteredCourseReviews.length === 0 ? (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                >
                  <Typography variant="body1">
                    {searchTerm ? "Không tìm thấy đánh giá phù hợp" : "Các khóa học của bạn chưa nhận được đánh giá nào."}
                  </Typography>
                </Paper>
              ) : (
                Object.entries(groupedCourseReviews).map(([courseName, courseReviews]) => (
                  <Box key={courseName} mb={4}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      mb={2}
                      color={theme === "dark" ? "#04d882" : "#1565c0"}
                    >
                      {courseName}
                    </Typography>
                    
                    {courseReviews.map((review) => (
                      <Paper
                        key={review._id}
                        elevation={0}
                        sx={{
                          p: 3,
                          mb: 2,
                          backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                      >
                        <Box display="flex" alignItems="center" mb={2}>
                          <Avatar 
                            src={getAvatarUrl(review)} 
                            alt={getUserName(review)}
                            sx={{ width: 40, height: 40, mr: 1 }}
                          />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {getUserName(review)}
                            </Typography>
                            <Typography variant="caption" color="textPrimary">
                              {review.createdAt ? format(review.createdAt) : ""}
                            </Typography>
                          </Box>
                          <Box ml="auto">
                            <Rating value={review.rating} precision={0.5} readOnly size="small" />
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1">
                          {review.comment}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                ))
              )}
            </TabPanel>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MentorReviews; 