"use client";

import { useNotif } from "@/context/notifContext";
import { useSidebar } from "@/context/sidebarContext";
import { Bell, ChevronDown, Hospital, Menu, Plus, X } from "lucide-react";
import React from "react";

export const Header = () => {
  const { toggleSidebar } = useSidebar();
  const { toggleNotif } = useNotif();
  return (
    <div className="bg-white w-screen h-14 flex items-center justify-between gap-4 px-8 fixed left-0 top-0 shadow-md">
      <button onClick={toggleSidebar} className="cursor-pointer hover:scale-105 duration-200">
        <Menu color="#151515" />
      </button>
      {/* <input type="text" placeholder='' className='bg-primary/40 rounded-full h-full px-3 focus:outline-none w-1/4' /> */}
      <div className="flex items-center gap-8">
        <button onClick={toggleNotif} className="cursor-pointer hover:scale-105 duration-200">
          <Bell color="#AB4545" fill="#AB4545" />
        </button>
        <div className="flex gap-2">
          <Hospital />
          <p className="font-bold text-xl text-black_primary">
            RSUD Zainal Abidin
          </p>
        </div>
        <button className="flex items-center ml-10 gap-2 bg-primary rounded-full px-4 py-1.5 shadow-md">
          <p className="font-light text-sm text-white">Admin</p>
          <ChevronDown color="white" width={20} />
        </button>
      </div>
    </div>
  );
};
