"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface NotifContextProps {
  isShowNotif: boolean;
  toggleNotif: () => void;
}

const NotifContext = createContext<NotifContextProps | undefined>(undefined);

export const NotifProvider = ({ children }: { children: ReactNode }) => {
  const [isShowNotif, setIsShowNotif] = useState(false);

  const toggleNotif = () => setIsShowNotif((prev) => !prev);

  return (
    <NotifContext.Provider value={{ isShowNotif, toggleNotif }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => {
  const context = useContext(NotifContext);
  if (!context) {
    throw new Error("useNotif must be used within a NotifProvider");
  }
  return context;
};
