"use client";
import React, { FC, useEffect, useState } from "react";
import AdminSidebar from "../../../components/Admin/sidebar/AdminSidebar";
import DashboardHero from "../../../components/Admin/DashboardHero";
import AdminProtected from "../../../hook/adminProtected";
import { useSelector } from "react-redux";
import Heading from "../../../utils/Heading";
import MentorDetails from "../../../components/Admin/Mentor/MentorDetails";

interface Props {
  params: any;
}

const MentorDetailsPage: FC<Props> = ({ params }) => {
  const id = params.id;
  const [open, setOpen] = useState(false);
  const { user } = useSelector((state: any) => state.auth);
  const [activeItem, setActiveItem] = useState(8);
  const [value, setValue] = useState(0);

  return (
    <div>
      <AdminProtected>
        <Heading
          title="Chi tiết Mentor - LMS"
          description="LMS is a platform for students to learn and get help from teachers"
          keywords="Programming,MERN,Redux,Machine Learning"
        />
        <div className="flex h-screen">
          <div className="1500px:w-[16%] w-1/5">
            <AdminSidebar />
          </div>
          <div className="w-[85%]">
            <DashboardHero />
            <MentorDetails id={id} />
          </div>
        </div>
      </AdminProtected>
    </div>
  );
};

export default MentorDetailsPage; 