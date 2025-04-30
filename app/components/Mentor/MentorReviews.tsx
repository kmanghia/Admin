import React, { useEffect, useState } from "react";
import { Box, Typography, Rating, Paper, Avatar, Divider, TextField, InputAdornment } from "@mui/material";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import { useGetMentorInfoQuery } from "@/redux/features/mentor/mentorApi";
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

const MentorReviews = () => {
  const { theme } = useTheme();
  const { isLoading, data, refetch } = useGetMentorInfoQuery({}, { refetchOnMountOrArgChange: true });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (data) {
      console.log("Mentor reviews data:", data.mentor.reviews);
      setReviews(data.mentor.reviews || []);
      setFilteredReviews(data.mentor.reviews || []);
      setAverageRating(data.mentor.averageRating || 0);
    }
  }, [data]);

  // Filter reviews based on search term
  useEffect(() => {
    if (reviews.length > 0) {
      if (!searchTerm) {
        setFilteredReviews(reviews);
        return;
      }
      
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
  }, [searchTerm, reviews]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  // Function to get user display name with fallbacks
  const getUserName = (review: Review): string => {
    if (review?.user?.name) return review.user.name;
    if (typeof review.user === 'string') return "Học viên";
    return "Học viên";
  };

  // Function to get avatar URL with fallbacks
  const getAvatarUrl = (review: Review): string => {
    if (review?.user?.avatar?.url) return `${URL}/images/${review?.user?.avatar?.url}`;
    return "/avatar.png";
  };

  return (
    <>
      {isLoading ? (
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
                Đánh giá từ học viên
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Rating value={averageRating} precision={0.5} readOnly />
                <Typography variant="body1" ml={1} color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {averageRating.toFixed(1)} ({reviews.length} đánh giá)
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm theo tên học viên, nội dung đánh giá, số sao..."
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
          </Box>
        </Box>
      )}
    </>
  );
};

export default MentorReviews; 