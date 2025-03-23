import { DashboardCard } from "@/components/cards/dashboardCard";
import { Header } from "@/components/header/header";
import { Notif } from "@/components/notif/notif";
import { Sidebar } from "@/components/sidebar/sidebar";
import React from "react";

const Home = () => {
  return (
    <div className={`w-full h-full flex flex-col gap-6`}>
      <h2 className="font-bold text-3xl text-white">Dashboard</h2>
      <div className="flex flex-wrap gap-6">
        <DashboardCard />
        <DashboardCard />
        <DashboardCard />
        <DashboardCard />
      </div>
    </div>
  );
};

export default Home;
