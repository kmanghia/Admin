import React, { useEffect, useState } from "react";
import { Box, Typography, Rating, Paper, Avatar, Divider } from "@mui/material";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import { useGetMentorInfoQuery } from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";

interface Review {
  _id: string;
  user: {
    name: string;
    avatar: {
      url: string;
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

  useEffect(() => {
    if (data) {
      setReviews(data.mentor.reviews || []);
      setAverageRating(data.mentor.averageRating || 0);
    }
  }, [data]);

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

            {reviews.length === 0 ? (
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
                  Bạn chưa nhận được đánh giá nào từ học viên.
                </Typography>
              </Paper>
            ) : (
              reviews.map((review) => (
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
                      src={review?.user?.avatar?.url || "/avatar.png"} 
                      alt={review?.user?.name || "User"}
                      sx={{ width: 40, height: 40, mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {review?.user?.name || "Học viên"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
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