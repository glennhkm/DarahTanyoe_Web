"use client";

import { useAuth } from "@/context/authContext";
import { useNotif } from "@/context/notifContext";
import { useSidebar } from "@/context/sidebarContext";
import { Bell, ChevronDown, Hospital, LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { toggleNotif } = useNotif();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (pathname === "/login") {
    return null;
  }

  return (
    
    <div className="bg-white w-screen h-14 flex items-center justify-between gap-4 px-8 fixed left-0 top-0 shadow-md">
      <button onClick={toggleSidebar} className="cursor-pointer hover:scale-105 duration-200">
        <Menu color="#151515" />
      </button>
      <div className="flex items-center gap-8">
        <button onClick={toggleNotif} className="cursor-pointer hover:scale-105 duration-200">
          <Bell color="#AB4545" fill="#AB4545" />
        </button>
        <div className="flex gap-2">
          <Hospital />
          <p className="font-bold text-xl text-black_primary">
            {user && user.full_name}
          </p>
        </div>
        <button className="flex items-center ml-10 gap-2 bg-primary rounded-full px-4 py-1.5 shadow-md">
          <p className="font-light text-sm text-white">Admin</p>
          <ChevronDown color="white" width={20} />
        </button>
        <button onClick={logout} className="flex items-center ml-10 gap-2 bg-primary rounded-full px-4 py-1.5 shadow-md">
          <p className="font-light text-sm text-white">Logout</p>
          <LogOut color="white" width={20} />
        </button>
      </div>
    </div>
  );
};
