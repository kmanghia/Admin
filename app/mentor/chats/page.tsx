"use client";
import React from "react";
import MentorLayout from "@/app/components/Layout/MentorLayout";
import MentorChatList from "@/app/components/Mentor/MentorChatList";
import Head from "next/head";

export default function ChatListPage() {
  return (
  
      <><Head>
          <title>Tin nhắn | Mentor Portal</title>
      </Head><div className="p-5">
              <MentorChatList />
          </div></>
 
  );
} 