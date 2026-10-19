import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MainLayout = () => {
  return (
    <div className="app min-h-screen bg-[#080A0E] text-[#F6F1E7] relative selection:bg-[#D6B66F]/30 selection:text-[#D6B66F]">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
