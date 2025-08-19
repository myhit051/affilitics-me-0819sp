import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FacebookAPITesterComponent from '@/components/FacebookAPITester';

const FacebookTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                Facebook API Tester
              </h1>
              <p className="text-gray-300">
                ทดสอบการเชื่อมต่อและดึงข้อมูลจาก Facebook API กับข้อมูลจริง
              </p>
            </div>
            <FacebookAPITesterComponent />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacebookTest;