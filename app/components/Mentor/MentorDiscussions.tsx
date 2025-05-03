import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, TextField, InputAdornment, Avatar, Button, Divider, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Badge } from "@mui/material";
import { useTheme } from "next-themes";
import { format } from "timeago.js";
import { useGetMentorCoursesQuery } from "@/redux/features/mentor/mentorCoursesApi";
import { useAnswerQuestionMutation } from "@/redux/features/mentor/mentorApi";
import Loader from "@/app/components/Loader/Loader";
import { AiOutlineSearch, AiOutlineSend } from "react-icons/ai";
import { MdExpandMore } from "react-icons/md";
import { toast } from "react-hot-toast";
import { URL, URL_SERVER } from "@/app/utils/url";

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
      id={`discussion-tabpanel-${index}`}
      aria-labelledby={`discussion-tab-${index}`}
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
    id: `discussion-tab-${index}`,
    'aria-controls': `discussion-tabpanel-${index}`,
  };
}

interface IUser {
  _id?: string;
  name?: string;
  avatar?: {
    url?: string;
  };
  role?: string;
}

interface QuestionReply {
  _id: string;
  user: IUser;
  answer: string;
  createdAt: string;
}

// Using the same structure as in course.model.ts
interface Question {
  _id: string;
  user: IUser;
  question: string;
  questionReplies: QuestionReply[];
  createdAt: string;
  // Additional metadata for frontend display
  courseId: string;
  courseName: string;
  contentId: string;
  lessonTitle: string;
}

const MentorDiscussions = () => {
  const { theme } = useTheme();
  const { isLoading, data: coursesData, refetch } = useGetMentorCoursesQuery({}, { refetchOnMountOrArgChange: true });
  const [answerQuestion, { isLoading: isAnswering }] = useAnswerQuestionMutation();
  
  const [tabValue, setTabValue] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [courseFilters, setCourseFilters] = useState<string[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [unansweredCount, setUnansweredCount] = useState(0);
  
  // Extract questions from courses
  useEffect(() => {
    if (coursesData && coursesData.courses) {
      const allQuestions: Question[] = [];
      
      // Process each course
      coursesData.courses.forEach((course: any) => {
        // Process each course content section
        course.courseData.forEach((content: any) => {
          // Check if content has questions
          if (content.questions && content.questions.length > 0) {
            content.questions.forEach((question: any) => {
              allQuestions.push({
                ...question,
                courseId: course._id,
                courseName: course.name,
                contentId: content._id,
                lessonTitle: content.title || 'Bài học không có tiêu đề'
              });
            });
          }
        });
      });
      
      // Sort by creation date (newest first)
      allQuestions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
      
      // Count unanswered questions
      const unanswered = allQuestions.filter(q => 
        !q.questionReplies || q.questionReplies.length === 0
      ).length;
      setUnansweredCount(unanswered);
      
      // Get unique course IDs for filtering
      const uniqueCourseIds = ["all", ...Array.from(new Set(coursesData.courses.map((course: any) => course._id))).map(id => String(id))];
      setCourseFilters(uniqueCourseIds);
      
      setLoading(false);
    }
  }, [coursesData]);

  // Filter questions based on search term and course filter
  useEffect(() => {
    if (questions.length > 0) {
      let filtered = [...questions];
      
      // Apply course filter
      if (selectedCourseFilter !== "all") {
        filtered = filtered.filter(question => question.courseId === selectedCourseFilter);
      }
      
      // Apply search filter if there is a search term
      if (searchTerm) {
        const lowercasedSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(question => {
          const questionText = question.question.toLowerCase();
          const userName = getUserName(question).toLowerCase();
          const courseName = question.courseName?.toLowerCase() || "";
          const lessonTitle = question.lessonTitle?.toLowerCase() || "";
          
          return (
            questionText.includes(lowercasedSearch) ||
            userName.includes(lowercasedSearch) ||
            courseName.includes(lowercasedSearch) ||
            lessonTitle.includes(lowercasedSearch)
          );
        });
      }
      
      // Filter based on tab
      if (tabValue === 1) {
        // Unanswered questions
        filtered = filtered.filter(q => !q.questionReplies || q.questionReplies.length === 0);
      } else if (tabValue === 2) {
        // Answered questions
        filtered = filtered.filter(q => q.questionReplies && q.questionReplies.length > 0);
      }
      
      // Always sort by unanswered first, then by date (newest first)
      filtered.sort((a, b) => {
        const aHasReplies = a.questionReplies && a.questionReplies.length > 0;
        const bHasReplies = b.questionReplies && b.questionReplies.length > 0;
        
        if (aHasReplies === bHasReplies) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        return aHasReplies ? 1 : -1; // Unanswered first
      });
      
      setFilteredQuestions(filtered);
    }
  }, [searchTerm, questions, selectedCourseFilter, tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCourseFilterChange = (courseId: string) => {
    setSelectedCourseFilter(courseId);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };

  const handleSubmitAnswer = async (questionId: string, courseId: string, contentId: string) => {
    if (!answers[questionId] || answers[questionId].trim() === "") {
      toast.error("Vui lòng nhập câu trả lời");
      return;
    }

    try {
      setLoading(true);
      
      // Use the Redux mutation instead of direct axios call
      await answerQuestion({
        answer: answers[questionId],
        courseId,
        contentId,
        questionId
      }).unwrap();
      
      toast.success("Đã trả lời câu hỏi thành công");
      setAnswers({
        ...answers,
        [questionId]: ""
      });
      
      // Refetch courses to get updated questions and answers
      refetch();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Có lỗi xảy ra khi trả lời câu hỏi");
      console.error(error);
    }
  };

  // Function to get user display name with fallbacks
  const getUserName = (item: Question | QuestionReply): string => {
    if (item?.user?.name) return item.user.name;
    if (typeof item.user === 'string') return "Học viên";
    return "Học viên";
  };

  // Function to get avatar URL with fallbacks
  const getAvatarUrl = (item: Question | QuestionReply): string => {
    if (item?.user?.avatar?.url) return `${URL}/images/${item?.user?.avatar?.url}`;
    return "/avatar.png";
  };
  
  const getCourseName = (courseId: string): string => {
    if (coursesData && coursesData.courses) {
      const course = coursesData.courses.find((c: any) => c._id === courseId);
      return course ? course.name : "Khóa học không xác định";
    }
    return "Đang tải...";
  };

  return (
    <div className="mt-[30px]">
      {isLoading || loading ? (
        <Loader />
      ) : (
        <Box m="20px">
          <Box display="flex" flexDirection="column">
            <Box mb={4}>
              <Typography
                variant="h2"
                color={theme === "dark" ? "#fff" : "#000"}
                fontWeight="bold"
                sx={{ m: "0 0 5px 0" }}
              >
                Thảo luận bài học
              </Typography>
              <Typography variant="h5" color={theme === "dark" ? "#04d882" : "#1565c0"} mb={2}>
                Trả lời câu hỏi từ học viên
              </Typography>
              
              {/* Summary cards */}
              <Box display="flex" gap={2} mb={4} mt={2}>
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    background: theme === "dark" ? "#1F2A40" : "#F8F9FA",
                    borderRadius: "10px",
                    border: `1px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
                  }}
                >
                  <Typography variant="body1" color="textSecondary">Tổng số câu hỏi</Typography>
                  <Typography variant="h4" color={theme === "dark" ? "#fff" : "#000"} mt={1}>
                    {questions.length}
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    background: unansweredCount > 0 
                      ? (theme === "dark" ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.05)")
                      : (theme === "dark" ? "#1F2A40" : "#F8F9FA"),
                    borderRadius: "10px",
                    border: `1px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
                  }}
                >
                  <Typography variant="body1" color="textSecondary">Câu hỏi chưa trả lời</Typography>
                  <Typography 
                    variant="h4" 
                    color={unansweredCount > 0 ? (theme === "dark" ? "#ff5252" : "#d32f2f") : (theme === "dark" ? "#fff" : "#000")}
                    mt={1}
                  >
                    {unansweredCount}
                  </Typography>
                </Paper>
                
                <Paper 
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    background: theme === "dark" ? "#1F2A40" : "#F8F9FA",
                    borderRadius: "10px",
                    border: `1px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
                  }}
                >
                  <Typography variant="body1" color="textSecondary">Câu hỏi đã trả lời</Typography>
                  <Typography variant="h4" color={theme === "dark" ? "#04d882" : "#4caf50"} mt={1}>
                    {questions.length - unansweredCount}
                  </Typography>
                </Paper>
              </Box>
              
              {/* Course filters */}
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                <Button
                  variant={selectedCourseFilter === "all" ? "contained" : "outlined"}
                  sx={{
                    backgroundColor: selectedCourseFilter === "all" && theme === "dark" ? "#04d882" : selectedCourseFilter === "all" ? "#1565c0" : "transparent",
                    color: selectedCourseFilter === "all" ? "#fff" : theme === "dark" ? "#fff" : "#1565c0",
                    borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                    borderRadius: "20px",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: theme === "dark" ? "rgba(4, 216, 130, 0.1)" : "rgba(21, 101, 192, 0.1)",
                    },
                  }}
                  onClick={() => handleCourseFilterChange("all")}
                >
                  Tất cả khóa học
                </Button>
                
                {courseFilters.filter(id => id !== "all").map((courseId) => (
                  <Button
                    key={courseId}
                    variant={selectedCourseFilter === courseId ? "contained" : "outlined"}
                    sx={{
                      backgroundColor: selectedCourseFilter === courseId && theme === "dark" ? "#04d882" : selectedCourseFilter === courseId ? "#1565c0" : "transparent",
                      color: selectedCourseFilter === courseId ? "#fff" : theme === "dark" ? "#fff" : "#1565c0",
                      borderColor: theme === "dark" ? "#04d882" : "#1565c0",
                      borderRadius: "20px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: theme === "dark" ? "rgba(4, 216, 130, 0.1)" : "rgba(21, 101, 192, 0.1)",
                      },
                    }}
                    onClick={() => handleCourseFilterChange(courseId)}
                  >
                    {getCourseName(courseId)}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 1, mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Tìm kiếm theo tên học viên, nội dung câu hỏi, tên khóa học, tên bài học..."
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
              <Tab label={
                <span>Tất cả câu hỏi ({questions.length})</span>
              } {...a11yProps(0)} />
              <Tab label={
                <Badge 
                  badgeContent={unansweredCount} 
                  color="error"
                  sx={{ 
                    '& .MuiBadge-badge': {
                      right: -15,
                      top: -5,
                    }
                  }}
                >
                  <span>Chưa trả lời</span>
                </Badge>
              } {...a11yProps(1)} />
              <Tab label={
                <span>Đã trả lời ({questions.length - unansweredCount})</span>
              } {...a11yProps(2)} />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              {renderQuestions(filteredQuestions)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderQuestions(filteredQuestions)}
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              {renderQuestions(filteredQuestions)}
            </TabPanel>
          </Box>
        </Box>
      )}
    </div>
  );

  function renderQuestions(questionsToRender: Question[]) {
    if (questionsToRender.length === 0) {
      return (
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
            {searchTerm || selectedCourseFilter !== "all" 
              ? "Không tìm thấy câu hỏi phù hợp với điều kiện tìm kiếm" 
              : tabValue === 1 
                ? "Không có câu hỏi nào chưa được trả lời"
                : tabValue === 2
                  ? "Không có câu hỏi nào đã được trả lời"
                  : "Chưa có câu hỏi nào từ học viên"}
          </Typography>
        </Paper>
      );
    }

    return questionsToRender.map((question) => (
      <Accordion 
        key={question._id}
        sx={{
          mb: 2,
          backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0",
          color: theme === "dark" ? "#fff" : "#000",
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          borderRadius: '8px',
          overflow: 'hidden',
          border: `1px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
        }}
      >
        <AccordionSummary
          expandIcon={<MdExpandMore color={theme === "dark" ? "#fff" : "#000"} size={24} />}
          sx={{ 
            p: 2,
            backgroundColor: (!question.questionReplies || question.questionReplies.length === 0) 
              ? (theme === "dark" ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 0, 0, 0.05)")
              : (theme === "dark" ? "rgba(4, 216, 130, 0.1)" : "rgba(76, 175, 80, 0.05)")
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" mb={1}>
              <Avatar
                src={getAvatarUrl(question)}
                alt={getUserName(question)}
                sx={{ width: 40, height: 40, mr: 1 }}
              />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {getUserName(question)}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(question.createdAt)}
                </Typography>
              </Box>
              <Box 
                ml="auto" 
                mr={2}
                display="flex"
                flexDirection="column"
                alignItems="flex-end"
              >
                <Typography variant="body2" fontWeight="bold" color={theme === "dark" ? "#04d882" : "#1565c0"}>
                  {question.courseName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {question.lessonTitle}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1">{question.question}</Typography>
            <Box mt={1}>
              <Typography 
                variant="caption" 
                sx={{ 
                  backgroundColor: (!question.questionReplies || question.questionReplies.length === 0) 
                    ? (theme === "dark" ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.1)")
                    : (theme === "dark" ? "rgba(4, 216, 130, 0.2)" : "rgba(76, 175, 80, 0.1)"),
                  color: (!question.questionReplies || question.questionReplies.length === 0)
                    ? (theme === "dark" ? "#ff5252" : "#d32f2f")
                    : (theme === "dark" ? "#04d882" : "#4caf50"),
                  borderRadius: '4px',
                  padding: '3px 8px',
                }}
              >
                {(!question.questionReplies || question.questionReplies.length === 0) 
                  ? "Chưa trả lời" 
                  : `Đã trả lời (${question.questionReplies.length})`}
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 2 }}>
          {question.questionReplies && question.questionReplies.length > 0 ? (
            <Box>
              {question.questionReplies.map((reply) => (
                <Paper
                  key={reply._id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: reply.user.role === "mentor" 
                      ? (theme === "dark" ? "rgba(4, 216, 130, 0.05)" : "rgba(76, 175, 80, 0.05)")
                      : (theme === "dark" ? "#2F3B52" : "#FFFFFF"),
                    border: `1px solid ${theme === "dark" ? "#3e4396" : "#E0E3E7"}`,
                    borderRadius: '8px',
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar
                      src={getAvatarUrl(reply)}
                      alt={getUserName(reply)}
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1,
                        backgroundColor: reply.user.role === "mentor" 
                          ? (theme === "dark" ? "#04d882" : "#4caf50")
                          : undefined
                      }}
                    />
                    <Box>
                      <Box display="flex" alignItems="center">
                        <Typography variant="body2" fontWeight="bold">
                          {getUserName(reply)}
                        </Typography>
                        {reply.user.role === "mentor" && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              ml: 1,
                              backgroundColor: theme === "dark" ? "rgba(4, 216, 130, 0.2)" : "rgba(76, 175, 80, 0.1)",
                              color: theme === "dark" ? "#04d882" : "#4caf50",
                              borderRadius: '4px',
                              padding: '1px 6px',
                            }}
                          >
                            Mentor
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        {format(reply.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 5 }}>
                    {reply.answer}
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Chưa có câu trả lời nào cho câu hỏi này.
            </Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" fontWeight="bold" mb={1}>
            Trả lời câu hỏi
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="Nhập câu trả lời của bạn..."
            value={answers[question._id] || ""}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            sx={{
              mb: 2,
              backgroundColor: theme === "dark" ? "#2F3B52" : "#FFFFFF",
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === "dark" ? "#3e4396" : "#E0E3E7",
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === "dark" ? "#04d882" : "#1565c0",
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme === "dark" ? "#04d882" : "#1565c0",
              },
            }}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<AiOutlineSend />}
              onClick={() => handleSubmitAnswer(question._id, question.courseId, question.contentId)}
              sx={{
                backgroundColor: theme === "dark" ? "#04d882" : "#1565c0",
                '&:hover': {
                  backgroundColor: theme === "dark" ? "#03b66b" : "#0d47a1",
                },
                borderRadius: "8px",
              }}
            >
              Gửi trả lời
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    ));
  }
};

export default MentorDiscussions; 