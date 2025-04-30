import React, { useState, useEffect } from "react";
import { useGetMentorNotificationsQuery, useUpdateNotificationMutation } from "@/redux/features/notifications/notificationsApi";
import { useTheme } from "next-themes";
import {
  Box,
  Card,
  Typography,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Container,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Book as BookIcon,
  Star as StarIcon,
  ShoppingCart as ShoppingCartIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Update as UpdateIcon,
  Campaign as CampaignIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

import Heading from "@/app/utils/Heading";
import DashboardHeader from "@/app/components/Admin/DashboardHeader";

import MentorSidebar from "@/app/components/Mentor/MentorSidebar";

interface Notification {
  _id: string;
  title: string;
  message: string;
  status: string;
  type: string;
  link: string;
  createdAt: string;
  courseId?: string;
}

const NotificationsPage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);

  const { data, isLoading, refetch } = useGetMentorNotificationsQuery({}, { refetchOnMountOrArgChange: true });
  const [updateNotification] = useUpdateNotificationMutation();

  useEffect(() => {
    if (data?.notifications) {
      const notifications = [...data.notifications];
      if (activeTab === 0) {
        setFilteredNotifications(notifications);
      } else if (activeTab === 1) {
        setFilteredNotifications(notifications.filter((n: Notification) => n.status === "unread"));
      } else {
        setFilteredNotifications(notifications.filter((n: Notification) => n.status === "read"));
      }
    }
  }, [data, activeTab]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.status === "unread") {
      try {
        await updateNotification(notification._id).unwrap();
        refetch();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to the link if available
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCartIcon sx={{ color: "#2467EC" }} />;
      case "update":
        return <UpdateIcon sx={{ color: "#FFA500" }} />;
      case "review":
        return <StarIcon sx={{ color: "#FFD700" }} />;
      case "discussion":
        return <QuestionAnswerIcon sx={{ color: "#4CAF50" }} />;
      case "course":
        return <BookIcon sx={{ color: "#9C27B0" }} />;
      default:
        return <CampaignIcon sx={{ color: "#2467EC" }} />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "HH:mm - dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "Không xác định";
    }
  };

  const getBgColor = (status: string, type: string) => {
    if (status === "unread") {
      return theme === "dark" ? "rgba(36, 103, 236, 0.1)" : "rgba(36, 103, 236, 0.05)";
    }
    return "transparent";
  };

  const MentorLayout = ({ children }: { children: React.ReactNode }) => {
    const [active, setActive] = useState(5);
    const [open, setOpen] = useState(false);
    
    return (
      <div className="flex">
        <div className="1500px:w-[16%] w-1/5">
          <MentorSidebar active={active} setActive={setActive} />
        </div>
        <div className="w-[85%]">
          <DashboardHeader open={open} setOpen={setOpen} />
          {children}
        </div>
      </div>
    );
  };

  return (
    <div>
      <Heading
        title="Thông báo - Giảng viên"
        description="Xem các thông báo dành cho giảng viên"
        keywords="mentor, notifications, lms"
      />

      <div>
        <MentorLayout>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                Thông báo
              </Typography>
            </Box>

            <Tabs 
              value={activeTab} 
              onChange={handleChangeTab} 
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{ 
                mb: 3,
                "& .MuiTab-root": {
                  fontWeight: 600,
                  fontSize: "1rem",
                  textTransform: "none",
                },
                "& .Mui-selected": {
                  color: theme === "dark" ? "#2467EC" : "#2467EC",
                }
              }}
            >
              <Tab label="Tất cả" />
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography>Chưa đọc</Typography>
                    {data?.notifications?.filter((n: Notification) => n.status === "unread").length > 0 && (
                      <Chip 
                        label={data?.notifications?.filter((n: Notification) => n.status === "unread").length} 
                        size="small" 
                        color="error" 
                        sx={{ ml: 1, height: 20, fontSize: "0.75rem" }} 
                      />
                    )}
                  </Box>
                } 
              />
              <Tab label="Đã đọc" />
            </Tabs>

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                <CircularProgress color="primary" />
              </Box>
            ) : filteredNotifications.length === 0 ? (
              <Card
                sx={{
                  p: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  borderRadius: "10px",
                  boxShadow: theme === "dark" ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.1)",
                }}
              >
                <CampaignIcon sx={{ fontSize: 60, color: "#aaa", mb: 2 }} />
                <Typography variant="h6" color="textSecondary">
                  Không có thông báo nào{activeTab === 1 ? " chưa đọc" : activeTab === 2 ? " đã đọc" : ""}
                </Typography>
              </Card>
            ) : (
              <List sx={{ width: "100%", bgcolor: theme === "dark" ? "#1a1f2c" : "background.paper", borderRadius: "10px" }}>
                {filteredNotifications.map((notification, index) => (
                  <React.Fragment key={notification._id}>
                    <ListItem 
                      alignItems="flex-start" 
                      sx={{ 
                        py: 2,
                        px: 3,
                        cursor: "pointer",
                        bgcolor: getBgColor(notification.status, notification.type),
                        "&:hover": {
                          bgcolor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        },
                        borderLeft: notification.status === "unread" ? `4px solid #2467EC` : "none",
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemIcon sx={{ minWidth: { xs: "40px", sm: "56px" } }}>
                        <Avatar sx={{ bgcolor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(36, 103, 236, 0.1)" }}>
                          {getNotificationIcon(notification.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.status === "unread" ? 700 : 400,
                              mb: 0.5,
                              color: theme === "dark" ? "#fff" : "#000"
                            }}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ 
                                display: "block",
                                color: theme === "dark" ? "#ccc" : "#555",
                                mb: 1,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {formatDate(notification.createdAt)}
                              </Typography>
                              {notification.status === "unread" && (
                                <Tooltip title="Chưa đọc">
                                  <Chip 
                                    size="small" 
                                    label="Mới" 
                                    sx={{ 
                                      bgcolor: theme === "dark" ? "rgba(36, 103, 236, 0.2)" : "rgba(36, 103, 236, 0.1)",
                                      color: "#2467EC",
                                      fontWeight: 500,
                                      height: 20,
                                      fontSize: "0.7rem",
                                    }} 
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < filteredNotifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </MentorLayout>
      </div>
    </div>
  );
};

export default NotificationsPage; 