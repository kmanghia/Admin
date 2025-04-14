import Link from "next/link";
import React, { FC } from "react";

interface NavigationProps {
  activeItem: number;
  isMobile: boolean;
}

const navigationItems = [
  {
    name: "Trang chủ",
    url: "/",
  },
  {
    name: "Khóa học",
    url: "/courses",
  },
  {
    name: "Về chúng tôi",
    url: "/about",
  },
  {
    name: "Liên hệ",
    url: "/contact",
  },
  {
    name: "Chính sách",
    url: "/policy",
  },
  {
    name: "Trở thành Mentor",
    url: "/become-mentor",
  },
];

const Navigation: FC<NavigationProps> = ({ activeItem, isMobile }) => {
  return (
    <div className={`block ${isMobile ? "mt-5" : ""}`}>
      <div className="hidden 800px:flex">
        {navigationItems.map((item, index) => (
          <Link href={item.url} key={index} passHref>
            <span
              className={`${
                activeItem === index
                  ? "dark:text-[#37a39a] text-[#37a39a]"
                  : "dark:text-white text-black"
              } text-[18px] px-6 font-Poppins font-[400] transition-colors duration-300 hover:text-[#37a39a] dark:hover:text-[#37a39a]`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </div>
      {isMobile && (
        <div className="w-full mt-5 pb-4">
          {navigationItems.map((item, index) => (
            <Link href={item.url} key={index} passHref>
              <div className="text-center py-3">
                <span
                  className={`${
                    activeItem === index
                      ? "dark:text-[#37a39a] text-[#37a39a]"
                      : "dark:text-white text-black"
                  } text-[18px] font-Poppins font-[400] transition-colors duration-300 hover:text-[#37a39a] dark:hover:text-[#37a39a]`}
                >
                  {item.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navigation;