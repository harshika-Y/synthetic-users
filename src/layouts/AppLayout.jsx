import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';

const AppLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#062319] text-[#FFFFFF]">
      {/* Persistent Royal Emerald Green Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#062319]">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-8 relative bg-gradient-to-b from-[#062319] via-[#082b20] to-[#041a13] text-[#FFFFFF]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
