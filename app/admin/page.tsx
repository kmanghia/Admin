"use client";
import React, { useState } from "react";
import Heading from "../utils/Heading";
import AdminSidebar from "../components/Admin/sidebar/AdminSidebar";
import MentorSidebar from "../components/Mentor/MentorSidebar";
import AdminProtected, { useUserRole } from "../hook/adminProtected";
import DashboardHero from "../components/Admin/DashboardHero";
import MentorDashboard from "../components/Mentor/MentorDashboard";

type Props = {};

// Component con sẽ sử dụng context để lấy role
const DashboardContent = () => {
  const [active, setActive] = useState(1);
  const userRole = useUserRole();

  return (
    <>
      <Heading
        title={userRole === "admin" ? "Admin Dashboard" : "Mentor Dashboard"}
        description="Hệ thống quản lý LMS"
        keywords="Nextjs, tailwind, admin, mentor"
      />
      <div className="flex min-h-screen">
        <div className="1500px:w-[16%] w-1/5">
          {userRole === "admin" ? (
            <AdminSidebar />
          ) : (
            <MentorSidebar active={active} setActive={setActive} />
          )}
        </div>
        <div className="w-[85%]">
          {userRole === "admin" ? (
            <DashboardHero isDashboard={true} />
          ) : (
            <MentorDashboard />
          )}
        </div>
      </div>
    </>
  );
};

const Page = (props: Props) => {
  return (
    <div>
      <AdminProtected>
        <DashboardContent />
      </AdminProtected>
    </div>
  );
};

export default Page;
