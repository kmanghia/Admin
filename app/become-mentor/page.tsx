"use client";
import React, { useState } from "react";
import Heading from "../utils/Heading";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import BecomeMentorForm from "../components/Mentor/BecomeMentorForm";
import { useSelector } from "react-redux";
import { FaChalkboardTeacher, FaLaptopCode, FaCertificate } from "react-icons/fa";

// CSS cho background animation
const backgroundStyles = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  
  @keyframes floatingShapes {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  
  .floating-shape {
    animation: floatingShapes 8s ease-in-out infinite;
  }
  
  .floating-shape-2 {
    animation: floatingShapes 10s ease-in-out infinite 1s;
  }
  
  .animated-gradient {
    background: linear-gradient(270deg, #0ea5e9, #6366f1, #8b5cf6);
    background-size: 400% 400%;
    animation: gradientAnimation 15s ease infinite;
  }
`;

const Page = () => {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(5);
  const [route, setRoute] = useState("Login");
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  
  return (
    <div className="min-h-screen flex flex-col">
      <style jsx>{backgroundStyles}</style>
      <Heading
        title="Đăng ký làm giảng viên - LMS"
        description="LMS là nền tảng học tập trực tuyến giúp học viên tiếp cận với kiến thức mới"
        keywords="Lập trình, MERN, Redux, Machine Learning"
      />
      
      {/* Background and decorations */}
      <div className="fixed inset-0 animated-gradient -z-10"></div>
      
      {/* Decorative Shapes */}
      <div className="fixed -z-5 inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-60 h-60 bg-white rounded-full opacity-10 floating-shape"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-white rounded-full opacity-10 floating-shape-2"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white opacity-10 rounded-lg rotate-45 floating-shape"></div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center w-full py-10 mt-[80px]">
        <div className="w-[90%] 800px:w-[80%] 1000px:w-[70%] max-w-5xl">
          <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-white/60">
            <h1 className="text-center text-[30px] leading-[1.3] sm:text-4xl text-gray-800 font-[700] font-Poppins">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Đăng ký trở thành Giảng viên
              </span>
            </h1>
            
            <p className="text-center text-gray-600 mt-4 max-w-3xl mx-auto">
              Chia sẻ kiến thức, xây dựng cộng đồng và tạo thu nhập thụ động bằng cách tham gia làm giảng viên trên nền tảng của chúng tôi.
            </p>
            
            {/* Benefits section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <div className="bg-white/90 p-5 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all">
                <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-500">
                  <FaChalkboardTeacher size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Truyền cảm hứng</h3>
                <p className="text-gray-600 text-sm">Chia sẻ kiến thức và truyền cảm hứng cho hàng nghìn học viên trên nền tảng của chúng tôi.</p>
              </div>
              
              <div className="bg-white/90 p-5 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-all">
                <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-purple-500">
                  <FaLaptopCode size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Linh hoạt</h3>
                <p className="text-gray-600 text-sm">Tự do thiết kế khóa học và làm việc theo lịch trình phù hợp với bạn.</p>
              </div>
              
              <div className="bg-white/90 p-5 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg transition-all">
                <div className="bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-indigo-500">
                  <FaCertificate size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Thu nhập</h3>
                <p className="text-gray-600 text-sm">Tạo nguồn thu nhập thụ động từ việc bán khóa học của bạn trên nền tảng.</p>
              </div>
            </div>
            
            <div className="mt-8">
              <BecomeMentorForm />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Page; 