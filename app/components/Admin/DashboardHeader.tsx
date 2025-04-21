"use client";
import { ThemeSwitcher } from "@/app/utils/ThemeSwitcher";
import {
  useGetAllNotificationsQuery,
  useUpdateNotificationStatusMutation,
} from "@/redux/features/notifications/notificationsApi";
import React, { FC, useEffect, useState } from "react";
import { IoMdNotificationsOutline } from "react-icons/io";
import socketIO from "socket.io-client";//ket noi thoi gian thuc voi server
import { format } from "timeago.js";
const ENDPOINT = process.env.NEXT_PUBLIC_SOCKET_SERVER_URI || "";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

type Props = {
  open?: boolean;
  setOpen?: any;
};

const DashboardHeader: FC<Props> = ({ open, setOpen }) => {
  const { data, refetch } = useGetAllNotificationsQuery(undefined, {
    refetchOnMountOrArgChange: true,//dữ liệu được tải lại mỗi khi component được mount
  });
  const [updateNotificationStatus, { isSuccess }] =
    useUpdateNotificationStatusMutation();
  const [notifications, setNotifications] = useState<any>([]);
  const [audio] = useState<any>(
    typeof window !== "undefined" &&
      new Audio("/simple-notification-152054.mp3")
  );

  const playNotificationSound = () => {
    if (audio) {
      try {
        // Create a new Audio instance each time to ensure fresh playback
        const sound = new Audio("/simple-notification-152054.mp3");
        sound.volume = 1.0; // Ensure volume is at maximum
        sound.play()
          .then(() => {
            console.log("Notification sound played successfully");
          })
          .catch((error: any) => {
            console.error("Error playing notification sound:", error);
          });
      } catch (error) {
        console.error("Error creating audio:", error);
      }
    }
  };

  // Thêm hàm test âm thanh
  const testNotificationSound = () => {
    try {
      // Create a new Audio instance for test
      const sound = new Audio("/simple-notification-152054.mp3");
      sound.volume = 1.0; // Ensure volume is at maximum
      sound.play()
        .then(() => {
          console.log("Test sound played successfully");
        })
        .catch((error: any) => {
          console.error("Error playing test sound:", error);
        });
    } catch (error) {
      console.error("Error creating audio:", error);
    }
  };

  useEffect(() => {
    if (data) {
      setNotifications(
        data.notifications.filter((item: any) => item.status === "unread")
      );
    }
    if (isSuccess) {
      refetch();
    }
  }, [data, isSuccess]);

  useEffect(() => {
    console.log("Setting up socket listeners");
    
    // Lắng nghe sự kiện newNotification
    socketId.on("newNotification", (notification: any) => {
      console.log("Received new notification:", notification);
      
      // Thêm notification mới vào state
      setNotifications((prev: any) => [notification, ...prev]);
      
      // Tải lại danh sách notifications
      refetch();
    });

    // Lắng nghe sự kiện playNotificationSound
    socketId.on("playNotificationSound", () => {
      console.log("Received play sound event");
      playNotificationSound();
    });

    // Cleanup khi component unmount
    return () => {
      console.log("Cleaning up socket listeners");
      socketId.off("newNotification");
      socketId.off("playNotificationSound");
    };
  }, []);

  const handleNotificationStatusChange = async (id: string) => {
    await updateNotificationStatus(id);
  };

  return (
    <div className="w-full flex items-center justify-end p-6 fixed top-5 right-0 z-[9999999]">
      <ThemeSwitcher />
      {/* Thêm nút test âm thanh */}
      <button
        onClick={testNotificationSound}
        className="mr-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
      >
        Test Sound
      </button>
      <div
        className="relative cursor-pointer m-2"
        onClick={() => setOpen(!open)}
      >
        <IoMdNotificationsOutline className="text-2xl cursor-pointer dark:text-white text-black" />
        <span className="absolute -top-2 -right-2 bg-[#3ccba0] rounded-full w-[20px] h-[20px] text-[12px] flex items-center justify-center text-white">
          {notifications && notifications.length}
        </span>
      </div>
      {open && (
        <div className="w-[350px] h-[60vh] overflow-y-scroll py-3 px-2 border border-[#ffffff0c] dark:bg-[#111C43] bg-white shadow-xl absolute top-16 z-[1000000000] rounded">
          <h5 className="text-center text-[20px] font-Poppins text-black dark:text-white p-3">
            Thông báo
          </h5>
          {notifications &&
            notifications.map((item: any, index: number) => (
              <div
                className="dark:bg-[#2d3a4e] bg-[#00000013] font-Poppins border-b dark:border-b-[#ffffff47] border-b-[#0000000f]"
                key={index}
              >
                <div className="w-full flex items-center justify-between p-2">
                  <p className="text-black dark:text-white">{item.title}</p>
                  <p
                    className="text-black dark:text-white cursor-pointer"
                    onClick={() => handleNotificationStatusChange(item._id)}
                  >
                    Đánh dấu đã đọc
                  </p>
                </div>
                <p className="px-2 text-black dark:text-white">
                  {item.message}
                </p>
                <p className="p-2 text-black dark:text-white text-[14px]">
                  {format(item.createdAt)}
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
