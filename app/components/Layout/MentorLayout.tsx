"use client";
import React, { FC, ReactNode } from "react";
import MentorProtected from "@/app/hooks/mentorProtected";

interface MentorLayoutProps {
  children: ReactNode;
}

const MentorLayout: FC<MentorLayoutProps> = ({ children }) => {
  return <MentorProtected>{children}</MentorProtected>;
};

export default MentorLayout; 