"use client";
import React, { useState } from "react";
import Heading from "../../utils/Heading";
import { useSelector } from "react-redux";
import MentorHero from "../../components/Mentor/MentorHero";
import MentorSidebar from "../../components/Mentor/MentorSidebar";
import CreateCourse from "../../components/Mentor/CreateCourse";
import MentorLayout from "@/app/components/Layout/MentorLayout";

const Page = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [activeItem, setActiveItem] = useState(6);

  return (
   
      <><Heading
      title="Tạo khóa học mới - LMS"
      description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
      keywords="Lập trình, MERN, Redux, Machine Learning" /><div className="flex min-h-screen">
        <div className="1500px:w-[16%] w-1/5">
          <MentorSidebar active={activeItem} setActive={setActiveItem} />
        </div>
        <div className="w-[85%]">
          <MentorHero />
          <CreateCourse />
        </div>
      </div></>
  );
};

export default Page; 