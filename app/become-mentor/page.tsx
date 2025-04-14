"use client";
import React, { useState } from "react";
import Heading from "../utils/Heading";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import BecomeMentorForm from "../components/Mentor/BecomeMentorForm";
import { useSelector } from "react-redux";

const Page = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(5);
  const [route, setRoute] = useState("Login");
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  
  return (
    <div>
      <Heading
        title="Đăng ký làm Mentor - LMS"
        description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
        keywords="Lập trình, MERN, Redux, Machine Learning"
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        route={route}
        setRoute={setRoute}
      />
      <div className="w-full flex justify-center">
        <div className="w-[90%] 800px:w-[80%] 1000px:w-[70%] py-10 mt-[80px]">
          <h1 className="text-center text-[25px] leading-[35px] sm:text-3xl dark:text-white text-black font-[700] font-Poppins">
            Đăng ký trở thành Mentor
          </h1>
          <div className="mt-12">
            <BecomeMentorForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page; 