import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Rating, Paper, Avatar, Divider, TextField, InputAdornment, Tabs, Tab, Button, IconButton } from "@mui/material";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import { useGetMentorInfoQuery } from "@/redux/features/mentor/mentorApi";
import { useGetMentorCoursesQuery } from "@/redux/features/mentor/mentorCoursesApi";
import { 
  useAddReplyToCourseReviewMutation,
  useAddReplyToMentorReviewMutation,
  useGetMentorReviewsQuery,
  useGetMentorCourseReviewsQuery
} from "@/redux/features/review/reviewApi";
import Loader from "@/app/components/Loader/Loader";
import {URL} from "@/app/utils/url";
import { AiOutlineSearch } from "react-icons/ai";
import toast from "react-hot-toast";
import { FaReply } from "react-icons/fa";
import { MdClose } from "react-icons/md";

interface Review {
  _id: string;
  userId: {
    _id?: string;
    name?: string;
    avatar?: {
      url?: string;
    };
  };
  rating: number;
  comment: string;
  createdAt: string;
  replies?: ReplyData[];
}

interface ReplyData {
  _id?: string;
  user_id: {
    _id?: string;
    name?: string;
    avatar?: {
      url?: string;
    };
  };
  content: string;
  createdAt: string;
  updatedAt?: string;
}

interface CourseReview {
  _id: string;
  userId: {
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
  replies?: ReplyData[];
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
  
  // Add the review API hooks
  const [addReplyToCourseReview, { isLoading: isReplySubmittingCourse }] = useAddReplyToCourseReviewMutation();
  const [addReplyToMentorReview, { isLoading: isReplySubmittingMentor }] = useAddReplyToMentorReviewMutation();
  const [mentorId, setMentorId] = useState<string | undefined>(undefined);
  
  // Use our new API endpoints
  const { data: mentorReviewsData, isLoading: isMentorReviewsLoading, refetch: refetchMentorReviews } = useGetMentorReviewsQuery(mentorId, {
    skip: !mentorId,
    refetchOnMountOrArgChange: true
  });
  
  // Add the new endpoint for mentor course reviews
  const { data: mentorCourseReviewsData, isLoading: isMentorCourseReviewsLoading, refetch: refetchMentorCourseReviews } = useGetMentorCourseReviewsQuery(mentorId, {
    skip: !mentorId,
    refetchOnMountOrArgChange: true
  });
  
  const [tabValue, setTabValue] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [filteredCourseReviews, setFilteredCourseReviews] = useState<CourseReview[]>([]);
  const [courseAverageRating, setCourseAverageRating] = useState(0);
  const [totalCourseReviews, setTotalCourseReviews] = useState(0);
  
  // New state for reply functionality
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Set mentorId when mentor data is available
  useEffect(() => {
    if (mentorData && mentorData.mentor && mentorData.mentor._id) {
      setMentorId(mentorData.mentor._id);
      setAverageRating(mentorData.mentor.averageRating || 0);
    }
  }, [mentorData]);

  // Update reviews when mentor reviews data changes
  useEffect(() => {
    if (mentorReviewsData && mentorReviewsData.reviews) {
      setReviews(mentorReviewsData.reviews || []);
      setFilteredReviews(mentorReviewsData.reviews || []);
    }
  }, [mentorReviewsData]);
  
  // Update course reviews when mentor course reviews data changes
  useEffect(() => {
    if (mentorCourseReviewsData && mentorCourseReviewsData.reviews) {
      const courseReviewsData = mentorCourseReviewsData.reviews || [];
      setCourseReviews(courseReviewsData);
      setFilteredCourseReviews(courseReviewsData);
      setTotalCourseReviews(courseReviewsData.length);
      
      // Calculate average rating
      if (courseReviewsData.length > 0) {
        const totalRating = courseReviewsData.reduce((sum: number, review: CourseReview) => sum + review.rating, 0);
        const avgRating = totalRating / courseReviewsData.length;
        setCourseAverageRating(avgRating);
      }
    }
  }, [mentorCourseReviewsData]);

  // Handle search filtering
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
    setSearchTerm(e.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getUserName = (review: Review | CourseReview): string => {
    if (review?.userId?.name) return review.userId.name;
    if (typeof review.userId === 'string') return "Học viên";
    return "Học viên";
  };

  const getAvatarUrl = (review: Review | CourseReview): string => {
    if (review?.userId?.avatar?.url) return `${URL}/images/${review.userId.avatar.url}`;
    return "/avatar.png";
  };

  const groupedCourseReviews = filteredCourseReviews.reduce((acc: Record<string, CourseReview[]>, review) => {
    const courseName = review.courseName || "Khóa học khác";
    if (!acc[courseName]) {
      acc[courseName] = [];
    }
    acc[courseName].push(review);
    return acc;
  }, {});

  // Handle reply submission for mentor reviews
  const handleMentorReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    
    try {
      const response = await addReplyToMentorReview({
        comment: replyText,
        reviewId,
      }).unwrap();
      
      if (response.success) {
        toast.success("Đã phản hồi đánh giá thành công");
        setReplyText("");
        setActiveReplyId(null);
        
        // Refresh mentor reviews
        if (mentorId) {
          refetchMentorReviews();
        }
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Có lỗi xảy ra khi gửi phản hồi";
      toast.error(errorMessage);
    }
  };

  // Handle reply submission for course reviews 
  const handleCourseReplySubmit = async (courseId: string, reviewId: string) => {
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }
    
    try {
      setSelectedCourseId(courseId);
      
      const response = await addReplyToCourseReview({
        comment: replyText,
        reviewId,
      }).unwrap();
      
      if (response.success) {
        toast.success("Đã phản hồi đánh giá thành công");
        setReplyText("");
        setActiveReplyId(null);
        
        // Refresh appropriate data based on the current tab
        if (mentorId) {
          refetchMentorCourseReviews();
        }
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Có lỗi xảy ra khi gửi phản hồi";
      toast.error(errorMessage);
    } finally {
      setSelectedCourseId(null);
    }
  };

  const toggleReplyForm = (reviewId: string) => {
    if (activeReplyId === reviewId) {
      setActiveReplyId(null);
      setReplyText("");
    } else {
      setActiveReplyId(reviewId);
      setReplyText("");
    }
  };

  const renderReply = (reply: ReplyData) => {
    return (
      <Box 
        key={reply._id} 
        sx={{ 
          pl: 4, 
          pt: 1, 
          pb: 1,
          borderLeft: `2px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
          ml: 2,
          mt: 1
        }}
      >
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar 
            src={reply?.user_id?.avatar?.url ? `${URL}/images/${reply.user_id.avatar.url}` : "/avatar.png"} 
            alt={reply?.user_id?.name || "Người dùng"}
            sx={{ width: 30, height: 30, mr: 1 }}
          />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {reply?.user_id?.name || "Người dùng"}
            </Typography>
            <Typography variant="caption" color="textPrimary">
              {reply.createdAt ? format(reply.createdAt) : ""}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ ml: 5 }}>
          {reply.content}
        </Typography>
      </Box>
    );
  };

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
              
              {isMentorReviewsLoading ? (
                <Loader />
              ) : filteredReviews.length === 0 ? (
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
                      <Box ml="auto" display="flex" alignItems="center">
                        <Rating value={review.rating} precision={0.5} readOnly size="small" />
                        <IconButton 
                          size="small" 
                          onClick={() => toggleReplyForm(review._id)}
                          sx={{ 
                            ml: 1,
                            color: theme === "dark" ? "#04d882" : "#1565c0" 
                          }}
                        >
                          {activeReplyId === review._id ? <MdClose /> : <FaReply />}
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {review.comment}
                    </Typography>
                    
                    {review.replies && review.replies.length > 0 && (
                      <Box mt={2}>
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                          Phản hồi:
                        </Typography>
                        {review.replies.map((reply) => renderReply(reply))}
                      </Box>
                    )}
                    
                    {activeReplyId === review._id && (
                      <Box mt={2}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Nhập phản hồi của bạn..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: theme === "dark" ? "#283046" : "#F8F9FA",
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
                              },
                              '&:hover fieldset': {
                                borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                              },
                            },
                          }}
                        />
                        <Box display="flex" justifyContent="flex-end" mt={1}>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isReplySubmittingMentor || !replyText.trim()}
                            onClick={() => handleMentorReplySubmit(review._id)}
                            sx={{
                              backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                              '&:hover': {
                                backgroundColor: theme === "dark" ? "#03b66f" : "#0d47a1",
                              },
                            }}
                          >
                            {isReplySubmittingMentor ? "Đang gửi..." : "Gửi phản hồi"}
                          </Button>
                        </Box>
                      </Box>
                    )}
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
              
              {isMentorCourseReviewsLoading ? (
                <Loader />
              ) : filteredCourseReviews.length === 0 ? (
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
                          <Box ml="auto" display="flex" alignItems="center">
                            <Rating value={review.rating} precision={0.5} readOnly size="small" />
                            <IconButton 
                              size="small" 
                              onClick={() => toggleReplyForm(review._id)}
                              sx={{ 
                                ml: 1,
                                color: theme === "dark" ? "#04d882" : "#1565c0" 
                              }}
                            >
                              {activeReplyId === review._id ? <MdClose /> : <FaReply />}
                            </IconButton>
                          </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body1">
                          {review.comment}
                        </Typography>
                        
                        {review.replies && review.replies.length > 0 && (
                          <Box mt={2}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                              Phản hồi:
                            </Typography>
                            {review.replies.map((reply) => renderReply(reply))}
                          </Box>
                        )}
                        
                        {activeReplyId === review._id && (
                          <Box mt={2}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              placeholder="Nhập phản hồi của bạn..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: theme === "dark" ? "#283046" : "#F8F9FA",
                                '& .MuiOutlinedInput-root': {
                                  '& fieldset': {
                                    borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
                                  },
                                  '&:hover fieldset': {
                                    borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                                  },
                                },
                              }}
                            />
                            <Box display="flex" justifyContent="flex-end" mt={1}>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={isReplySubmittingCourse || !replyText.trim()}
                                onClick={() => handleCourseReplySubmit(review.courseId || "", review._id)}
                                sx={{
                                  backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                                  '&:hover': {
                                    backgroundColor: theme === "dark" ? "#03b66f" : "#0d47a1",
                                  },
                                }}
                              >
                                {isReplySubmittingCourse ? "Đang gửi..." : "Gửi phản hồi"}
                              </Button>
                            </Box>
                          </Box>
                        )}
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