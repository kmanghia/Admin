"use client";
import React, { FC, useEffect, useState } from "react";
import AdminSidebar from "../../components/Admin/sidebar/AdminSidebar";
import DashboardHero from "../../components/Admin/DashboardHero";
import AdminProtected from "../../hook/adminProtected";
import { useSelector } from "react-redux";
import Heading from "../../utils/Heading";
import PendingCourses from "../../components/Admin/Course/PendingCourses";

const PendingCoursesPage = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [activeItem, setActiveItem] = useState(8);
  const [value, setValue] = useState(0);

  return (
    <div>
     
        <Heading
          title="Khóa học chờ duyệt - LMS"
          description="LMS is a platform for students to learn and get help from teachers"
          keywords="Programming,MERN,Redux,Machine Learning"
        />
        <div className="flex h-screen">
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero />
            <PendingCourses />
          </div>
        </div>
      
    </div>
  );
};

export default PendingCoursesPage; 