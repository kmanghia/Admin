"use client";
import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import Navigation from "./Navigation";
import { ThemeSwitcher } from "../utils/ThemeSwitcher";
import Image from "next/image";

interface HeaderProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: number;
  setActiveItem: (activeItem: number) => void;
  route: string;
  setRoute: (route: string) => void;
}

const Header: FC<HeaderProps> = ({
  open,
  setOpen,
  activeItem,
  setActiveItem,
  route,
  setRoute,
}) => {
  const { user } = useSelector((state: any) => state.auth);
  const [active, setActive] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={`w-full relative ${active ? "bg-white dark:bg-opacity-50 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black fixed top-0 left-0 z-[80]" : ""}`}>
      <div className={`${active ? "w-[95%] 800px:w-[92%] m-auto py-2" : "w-[95%] 800px:w-[92%] m-auto py-5"} transition hidden 800px:flex items-center justify-between`}>
        <div>
          <Link href="/" className="text-[25px] font-Poppins font-[500] text-black dark:text-white">
            {
              <Image
                src={"/logo.png"}
                alt=""
                quality={100}
                width={active ? 150 : 180}
                height={active ? 40 : 60}
                className="cursor-pointer dark:bg-transparent"
              />
            }
          </Link>
        </div>
        <div className="flex items-center">
          <Navigation activeItem={activeItem} isMobile={false} />
          <ThemeSwitcher />
          {user ? (
            <Link href={"/profile"}>
              <Image
                src={user.avatar ? user.avatar.url : "/avatar.png"}
                alt=""
                width={30}
                height={30}
                className="w-[30px] h-[30px] rounded-full cursor-pointer"
                style={{ border: active ? "3px solid #37a39a" : "3px solid transparent" }}
              />
            </Link>
          ) : (
            <div
              className="border border-[#37a39a] text-black dark:text-white p-2 rounded-full w-[38px] h-[38px] flex items-center justify-center cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                className=""
                data-icon="user"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className={`w-full block 800px:hidden ${active ? "fixed top-0 left-0 z-[9999]" : ""}`}>
        <div className={`${active ? "w-full bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-black h-[70px] flex items-center justify-between py-3 px-4" : "w-full h-[60px] flex items-center justify-between py-3 px-4 dark:shadow"}`}>
          <div>
            <Link href="/">
              <Image
                src={"/logo.png"}
                alt=""
                quality={100}
                width={active ? 130 : 150}
                height={active ? 30 : 40}
                className="cursor-pointer dark:bg-transparent"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            {user ? (
              <Link href={"/profile"}>
                <Image
                  src={user.avatar ? user.avatar.url : "/avatar.png"}
                  alt=""
                  width={30}
                  height={30}
                  className="w-[30px] h-[30px] rounded-full cursor-pointer"
                  style={{ border: active ? "3px solid #37a39a" : "3px solid transparent" }}
                />
              </Link>
            ) : (
              <div
                className="border border-[#37a39a] text-black dark:text-white p-2 rounded-full w-[38px] h-[38px] flex items-center justify-center cursor-pointer"
                onClick={() => setOpen(true)}
              >
                <svg
                  viewBox="64 64 896 896"
                  focusable="false"
                  className=""
                  data-icon="user"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
                </svg>
              </div>
            )}
            <div
              className="text-black dark:text-white cursor-pointer"
              onClick={() => setOpenSidebar(!openSidebar)}
            >
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                className=""
                data-icon="menu"
                width="28"
                height="28"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8zm0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"></path>
              </svg>
            </div>
            {openSidebar && (
              <div
                className="fixed w-full h-screen top-0 left-0 z-[999] dark:bg-[unset] bg-[#00000024]"
                onClick={() => setOpenSidebar(false)}
                id="screen"
              >
                <div className="w-[70%] fixed z-[9999] h-screen bg-white dark:bg-slate-900 dark:bg-opacity-90 top-0 right-0">
                  <Navigation activeItem={activeItem} isMobile={true} />
                  <div className="w-full flex justify-center">
                    {user ? (
                      <div className="flex items-center">
                        <Link href="/profile">
                          <div className="flex items-center">
                            <Image
                              src={user.avatar ? user.avatar.url : "/avatar.png"}
                              alt=""
                              width={30}
                              height={30}
                              className="w-[30px] h-[30px] rounded-full cursor-pointer"
                            />
                            <h5 className="pl-2 text-black dark:text-white font-Poppins">
                              {user.name}
                            </h5>
                          </div>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div
                          className="border border-[#37a39a] text-black dark:text-white p-2 rounded-full w-[38px] h-[38px] flex items-center justify-center cursor-pointer"
                          onClick={() => {
                            setOpen(true);
                            setOpenSidebar(false);
                          }}
                        >
                          <svg
                            viewBox="64 64 896 896"
                            focusable="false"
                            className=""
                            data-icon="user"
                            width="1em"
                            height="1em"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path d="M858.5 763.6a374 374 0 00-80.6-119.5 375.63 375.63 0 00-119.5-80.6c-.4-.2-.8-.3-1.2-.5C719.5 518 760 444.7 760 362c0-137-111-248-248-248S264 225 264 362c0 82.7 40.5 156 102.8 201.1-.4.2-.8.3-1.2.5-44.8 18.9-85 46-119.5 80.6a375.63 375.63 0 00-80.6 119.5A371.7 371.7 0 00136 901.8a8 8 0 008 8.2h60c4.4 0 7.9-3.5 8-7.8 2-77.2 33-149.5 87.8-204.3 56.7-56.7 132-87.9 212.2-87.9s155.5 31.2 212.2 87.9C779 752.7 810 825 812 902.2c.1 4.4 3.6 7.8 8 7.8h60a8 8 0 008-8.2c-1-47.8-10.9-94.3-29.5-138.2zM512 534c-45.9 0-89.1-17.9-121.6-50.4S340 407.9 340 362c0-45.9 17.9-89.1 50.4-121.6S466.1 190 512 190s89.1 17.9 121.6 50.4S684 316.1 684 362c0 45.9-17.9 89.1-50.4 121.6S557.9 534 512 534z"></path>
                          </svg>
                        </div>
                        <h5
                          className="text-black dark:text-white font-Poppins pl-2 cursor-pointer"
                          onClick={() => {
                            setOpen(true);
                            setOpenSidebar(false);
                          }}
                        >
                          Đăng nhập
                        </h5>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 