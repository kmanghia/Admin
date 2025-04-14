"use client";
import React, { FC, useEffect, useState } from "react";
import Heading from "../utils/Heading";
import { useSelector } from "react-redux";
import { redirect } from "next/navigation";
import MentorHero from "../components/Mentor/MentorHero";
import MentorDashboard from "../components/Mentor/MentorDashboard";
import MentorSidebar from "../components/Mentor/MentorSidebar";
import MentorProtected from "../hooks/mentorProtected";

const Page = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [activeItem, setActiveItem] = useState(0);

  return (
    <div>
      <MentorProtected>
        <Heading
          title="Mentor Dashboard - LMS"
          description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
          keywords="Lập trình, MERN, Redux, Machine Learning"
        />
        <div className="flex min-h-screen">
          <div className="1500px:w-[16%] w-1/5">
            <MentorSidebar active={activeItem} setActive={setActiveItem} />
          </div>
          <div className="w-[85%]">
            <MentorHero />
            <MentorDashboard />
          </div>
        </div>
      </MentorProtected>
    </div>
  );
};

export default Page; 