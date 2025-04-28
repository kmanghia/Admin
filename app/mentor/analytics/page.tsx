"use client";
import React, { useState } from "react";
import Heading from "../../utils/Heading";
import { useSelector } from "react-redux";
import MentorHero from "../../components/Mentor/MentorHero";
import MentorSidebar from "../../components/Mentor/MentorSidebar";
import MentorAnalytics from "../../components/Mentor/MentorAnalytics";
import MentorLayout from "@/app/components/Layout/MentorLayout";

const Page = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [activeItem, setActiveItem] = useState(5);

  return (

      <><Heading
      title="Thống kê - LMS"
      description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
      keywords="Lập trình, MERN, Redux, Machine Learning" /><div className="flex min-h-screen">
        <div className="1500px:w-[16%] w-1/5 ">
          <MentorSidebar active={activeItem} setActive={setActiveItem} />
        </div>
        <div className="w-[85%]">
          <MentorHero />
          <MentorAnalytics />
        </div>
      </div></>
    
  );
};

export default Page; 