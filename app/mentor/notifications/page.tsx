"use client";

import React, { useState, useEffect } from "react";
import { useGetMentorNotificationsQuery, useUpdateNotificationMutation } from "@/redux/features/notifications/notificationsApi";
import { useTheme } from "next-themes";
import {
  Box,
  Container,
  Card,
  Typography,
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
  useMediaQuery,
  Paper,
  Tooltip,
  Badge,
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
  Home as HomeIcon,
  NotificationsOutlined as NotificationsIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

import Heading from "@/app/utils/Heading";
import Link from "next/link";
import MentorSidebar from "@/app/components/Mentor/MentorSidebar";
import MentorHero from "@/app/components/Mentor/MentorHero";

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
  const [active, setActive] = useState(8); // ID for notifications in sidebar

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
        return <ShoppingCartIcon sx={{ color: "white" }} />;
      case "update":
        return <UpdateIcon sx={{ color: "white" }} />;
      case "review":
        return <StarIcon sx={{ color: "white" }} />;
      case "discussion":
        return <QuestionAnswerIcon sx={{ color: "white" }} />;
      case "course":
        return <BookIcon sx={{ color: "white" }} />;
      default:
        return <CampaignIcon sx={{ color: "white" }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "#3b82f6"; // Blue
      case "update":
        return "#f97316"; // Orange
      case "review":
        return "#eab308"; // Yellow
      case "discussion":
        return "#22c55e"; // Green
      case "course":
        return "#a855f7"; // Purple
      default:
        return "#3b82f6"; // Blue
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
      return theme === "dark" ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.05)";
    }
    return "transparent";
  };

  const unreadCount = data?.notifications?.filter((n: Notification) => n.status === "unread").length || 0;

  return (
    <div>
      <Heading
        title="Thông báo - Giảng viên"
        description="Xem các thông báo dành cho giảng viên"
        keywords="mentor, notifications, lms"
      />
      
      <div className="flex min-h-screen">
        <div className="1500px:w-[16%] w-1/5">
          <MentorSidebar active={active} setActive={setActive} />
        </div>
        <div className="w-[85%]">
          <MentorHero />
          
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: "16px",
                overflow: "hidden",
                bgcolor: theme === "dark" ? "#1f2937" : "#ffffff",
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
                boxShadow: theme === "dark" ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)" : "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.02)",
              }}
            >
              {/* Header */}
              <Box 
                sx={{ 
                  p: 3, 
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  bgcolor: theme === "dark" ? "#111827" : "#f8fafc",
                  borderBottom: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)"
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <NotificationsIcon fontSize="large" sx={{ color: "#3b82f6" }} />
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: theme === "dark" ? "#f9fafb" : "#1f2937" }}>
                    Thông báo
                  </Typography>
                  {unreadCount > 0 && (
                    <Badge 
                      badgeContent={unreadCount} 
                      color="error" 
                      sx={{ ml: 1, "& .MuiBadge-badge": { fontSize: "0.75rem", fontWeight: 700 } }}
                    />
                  )}
                </Box>
                <Chip 
                  icon={<FilterListIcon fontSize="small" />}
                  label={activeTab === 0 ? "Tất cả" : activeTab === 1 ? "Chưa đọc" : "Đã đọc"}
                  variant="outlined"
                  color="primary"
                  sx={{ borderRadius: "20px", fontWeight: 500 }}
                />
              </Box>

              {/* Tabs */}
              <Box 
                sx={{ 
                  px: 3, 
                  pt: 3, 
                  bgcolor: theme === "dark" ? "#1f2937" : "#ffffff",
                }}
              >
                <Tabs 
                  value={activeTab} 
                  onChange={handleChangeTab} 
                  variant={isMobile ? "fullWidth" : "standard"}
                  sx={{ 
                    mb: 3,
                    "& .MuiTabs-indicator": {
                      height: "3px",
                      borderRadius: "3px"
                    },
                    "& .MuiTab-root": {
                      fontWeight: 600,
                      fontSize: "1rem",
                      textTransform: "none",
                      p: 1.5,
                      minHeight: "48px",
                      color: theme === "dark" ? "#9ca3af" : "#6b7280",
                    },
                    "& .Mui-selected": {
                      color: "#3b82f6",
                    }
                  }}
                >
                  <Tab label="Tất cả" />
                  <Tab 
                    label={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography>Chưa đọc</Typography>
                        {unreadCount > 0 && (
                          <Chip 
                            label={unreadCount} 
                            size="small" 
                            color="error" 
                            sx={{ ml: 1, height: 20, fontSize: "0.75rem", fontWeight: 700 }} 
                          />
                        )}
                      </Box>
                    } 
                  />
                  <Tab label="Đã đọc" />
                </Tabs>
              </Box>

              {/* Content */}
              <Box 
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  bgcolor: theme === "dark" ? "#1f2937" : "#ffffff",
                }}
              >
                {isLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
                    <CircularProgress size={40} sx={{ color: "#3b82f6" }} />
                  </Box>
                ) : filteredNotifications.length === 0 ? (
                  <Card
                    sx={{
                      p: 5,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      borderRadius: "10px",
                      border: "1px dashed",
                      borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      bgcolor: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                      my: 3,
                    }}
                  >
                    <CampaignIcon sx={{ fontSize: 70, color: theme === "dark" ? "#4b5563" : "#9ca3af", mb: 2 }} />
                    <Typography variant="h6" sx={{ color: theme === "dark" ? "#d1d5db" : "#4b5563", mb: 1 }}>
                      Không có thông báo nào{activeTab === 1 ? " chưa đọc" : activeTab === 2 ? " đã đọc" : ""}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme === "dark" ? "#9ca3af" : "#6b7280" }}>
                      Bạn sẽ nhận được thông báo khi có hoạt động mới
                    </Typography>
                  </Card>
                ) : (
                  <List 
                    sx={{ 
                      width: "100%", 
                      bgcolor: "transparent",
                      borderRadius: "10px",
                      p: 0,
                    }}
                  >
                    {filteredNotifications.map((notification, index) => (
                      <React.Fragment key={notification._id}>
                        <ListItem 
                          alignItems="flex-start" 
                          disablePadding
                          sx={{ 
                            py: 2.5,
                            px: 3,
                            cursor: "pointer",
                            bgcolor: theme === "dark" ? (notification.status === "unread" ? "rgba(59, 130, 246, 0.08)" : "transparent") : (notification.status === "unread" ? "rgba(59, 130, 246, 0.04)" : "transparent"),
                            borderRadius: "8px",
                            my: 1,
                            transition: "all 0.2s ease",
                            border: "1px solid",
                            borderColor: theme === "dark" ? (notification.status === "unread" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.05)") : (notification.status === "unread" ? "rgba(59, 130, 246, 0.1)" : "rgba(0,0,0,0.03)"),
                            "&:hover": {
                              bgcolor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                              transform: "translateY(-2px)",
                              boxShadow: theme === "dark" ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)" : "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                            },
                          }}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <ListItemIcon sx={{ mt: 0.5, minWidth: { xs: "48px", sm: "64px" } }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getNotificationColor(notification.type),
                                width: { xs: 40, sm: 48 },
                                height: { xs: 40, sm: 48 },
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)"
                              }}
                            >
                              {getNotificationIcon(notification.type)}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                                <Typography 
                                  variant="subtitle1" 
                                  sx={{ 
                                    fontWeight: notification.status === "unread" ? 700 : 600,
                                    fontSize: "1.05rem",
                                    color: theme === "dark" ? "#f9fafb" : "#1f2937",
                                    pr: 2
                                  }}
                                >
                                  {notification.title}
                                </Typography>
                                {notification.status === "unread" && (
                                  <Tooltip title="Chưa đọc">
                                    <Chip 
                                      size="small" 
                                      label="Mới" 
                                      sx={{ 
                                        bgcolor: "#3b82f6",
                                        color: "white",
                                        fontWeight: 700,
                                        height: 24,
                                        fontSize: "0.7rem",
                                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                                      }} 
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{ 
                                    display: "block",
                                    color: theme === "dark" ? "#d1d5db" : "#4b5563",
                                    mb: 1.5,
                                    lineHeight: 1.5
                                  }}
                                >
                                  {notification.message}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme === "dark" ? "#9ca3af" : "#6b7280",
                                    fontWeight: 500,
                                    display: "flex",
                                    alignItems: "center"
                                  }}
                                >
                                  <UpdateIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.7 }} />
                                  {formatDate(notification.createdAt)}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </Card>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;