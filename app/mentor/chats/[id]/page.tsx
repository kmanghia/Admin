"use client";
import React from "react";
import MentorLayout from "@/app/components/Layout/MentorLayout";
import MentorChatDetail from "@/app/components/Mentor/MentorChatDetail";
import Head from "next/head";

export default function ChatDetailPage({ params }: { params: { id: string } }) {
  return (
   
      <><Head>
      <title>Tin nhắn | Mentor Portal</title>
    </Head><div className="h-screen">
        <MentorChatDetail chatId={params.id} />
      </div></>
   
  );
} 