"use client";

import { DashboardCard } from "@/components/cards/dashboardCard";
import ProtectedRoute from "@/components/protectedRoute/protectedRoute";
// import { useAuth } from "@/context/authContext";
import React from "react";

const Home = () => {
  // const { user, logout } = useAuth();
  return (
    <ProtectedRoute>
      <div className={`w-full h-full flex flex-col gap-6`}>
        <h2 className="font-bold text-3xl text-white">Dashboard</h2>
        <div className="flex flex-wrap gap-6">
          <DashboardCard />
          <DashboardCard />
          <DashboardCard />
          <DashboardCard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Home;
