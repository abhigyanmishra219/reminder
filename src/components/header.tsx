"use client";

import { Avatar, Box, Flex, Text, Button } from "@radix-ui/themes";
import { useContext } from "react";
import { UserContext } from "./context/user-context";

import LogoutButton from "./logout";

export default function Header() {
  const { user } = useContext(UserContext);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* Left Side */}
        <Flex align="center" gap="4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md">
            <span className="text-2xl">📅</span>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Reminder WhatsApp
            </h1>

            <p className="text-sm text-gray-500">
              Smart Reminder Sender System
            </p>
          </div>
        </Flex>

        {/* Right Side */}
 {user && (
  <div className="flex items-center gap-3">
    
    {/* User Card */}
    <div className="group flex items-center gap-4 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg">
      
      {/* Avatar */}
      <div className="relative flex items-center justify-center">
        
        {/* Glow */}
        <div className="absolute h-14 w-14 rounded-full bg-blue-500/20 blur-lg"></div>

        {/* Avatar Circle */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-500 p-[2px] shadow-lg">
          
          <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
            <span className="text-xl font-bold text-gray-800">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>

      {/* User Info */}
      <Box className="flex flex-col">
        <Text
          as="div"
          size="3"
          weight="bold"
          className="font-bold tracking-tight text-gray-900"
        >
          {user?.name}
        </Text>

        <Text
          as="div"
          size="2"
          className="mt-1 text-gray-500"
        >
          {user?.email}
        </Text>
      </Box>
    </div>

    {/* Logout Button */}
    <h1
      size="3"
      radius="full"
      className="group cursor-pointer overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-r from-red-500 to-rose-500 px-5 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <Flex align="center" gap="2">
        
        {/* Icon */}
        

        {/* Text */}
        <span className="tracking-wide">
          <LogoutButton />
        </span>
      </Flex>
    </h1>

  </div>
)}
      </div>
    </header>
  );
}