"use client";
import React, { FC, useEffect, useState } from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { ThemeSwitcher } from "@/app/utils/ThemeSwitcher";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useSelector } from "react-redux";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";

type Props = {};

const MentorHero: FC<Props> = (props: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full flex items-center justify-end p-6 dark:bg-gray-900 bg-white">
      <div className="flex items-center">
        <ThemeSwitcher />
        <Link href="/profile">
          <Image
            src="/avatar.png"
            alt="avatar"
            width={35}
            height={35}
            className="rounded-full ml-4 cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
};

export default MentorHero; 