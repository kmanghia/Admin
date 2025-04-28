"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-[#0000001c] dark:border-[#ffffff1c]">
      <div className="w-[95%] 800px:w-[85%] m-auto py-10">
        <div className="w-full flex flex-wrap gap-6 justify-between">
          <div className="w-full md:w-[30%] lg:w-[25%]">
            <Link href="/">
              <Image
                src={theme === "dark" ? "/logo_light.png" : "/logo.png"}
                alt="LMS"
                width={180}
                height={50}
                className="mb-6"
              />
            </Link>
            <p className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px] leading-7">
              Nền tảng học tập trực tuyến hàng đầu, kết nối học viên với kiến thức và kỹ năng mới nhất từ những chuyên gia hàng đầu.
            </p>
          </div>
          <div className="w-full sm:w-[40%] md:w-[20%] lg:w-[15%]">
            <h1 className="text-[20px] font-[600] text-black dark:text-white mb-6">Về chúng tôi</h1>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Chính sách
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Điều khoản
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-[40%] md:w-[20%] lg:w-[15%]">
            <h1 className="text-[20px] font-[600] text-black dark:text-white mb-6">Khóa học</h1>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/courses"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Tất cả khóa học
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?category=Web Development"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Lập trình Web
                </Link>
              </li>
              <li>
                <Link
                  href="/courses?category=Mobile Development"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Lập trình Mobile
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-[40%] md:w-[20%] lg:w-[15%]">
            <h1 className="text-[20px] font-[600] text-black dark:text-white mb-6">Hỗ trợ</h1>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/become-mentor"
                  className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]"
                >
                  Trở thành Mentor
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full sm:w-[40%] md:w-[20%] lg:w-[20%]">
            <h1 className="text-[20px] font-[600] text-black dark:text-white mb-6">Liên hệ</h1>
            <div className="flex items-center mt-4">
              <div className="w-[30px] h-[30px] bg-[#38a169] flex items-center justify-center rounded-full mr-2">
                <i className="fas fa-phone text-white"></i>
              </div>
              <span className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]">
                +84 123 456 789
              </span>
            </div>
            <div className="flex items-center mt-4">
              <div className="w-[30px] h-[30px] bg-[#38a169] flex items-center justify-center rounded-full mr-2">
                <i className="fas fa-envelope text-white"></i>
              </div>
              <span className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]">
                contact@lms.edu.vn
              </span>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center items-center pt-8 border-t border-[#00000017] dark:border-[#ffffff17] mt-10">
          <p className="text-[#000000ac] dark:text-[#ffffffac] font-Poppins text-[16px]">
            © 2023 LMS. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 