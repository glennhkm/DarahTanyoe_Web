"use client";

import { useNotif } from "@/context/notifContext";

export const Notif = () => {
  const { isShowNotif } = useNotif();
  return isShowNotif ? (
    <div className="bg-white w-80 h-96 rounded-lg shadow-lg fixed top-16 right-1/4"></div>
  ) : null;
};
