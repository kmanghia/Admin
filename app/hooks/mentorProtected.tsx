"use client";

import { redirect } from "next/navigation";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";
import React, { FC, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

const MentorProtected: FC<Props> = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector(
    (state: any) => state.auth
  );

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated || !user) {
    return redirect("/login");
  }

  if (user.role !== "mentor") {
    return redirect("/");
  }

  return <>{children}</>;
};

export default MentorProtected; 