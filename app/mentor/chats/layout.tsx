"use client";
import React, { useState } from "react";
import Heading from "@/app/utils/Heading";
import MentorSidebar from "@/app/components/Mentor/MentorSidebar";
import MentorHero from "@/app/components/Mentor/MentorHero";
import MentorProtected from "@/app/hooks/mentorProtected";

export default function MentorChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeItem, setActiveItem] = useState(7); // 7 is the ID for Chat in sidebar

  return (
    
      <><Heading
          title="Tin nhắn - LMS"
          description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
          keywords="Lập trình, MERN, Redux, Machine Learning" /><div className="flex min-h-screen">
              <div className="1500px:w-[16%] w-1/5">
                  <MentorSidebar active={activeItem} setActive={setActiveItem} />
              </div>
              <div className="w-[85%]">
                  <MentorHero />
                  {children}
              </div>
          </div></>
    
  );
} 