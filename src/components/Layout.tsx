import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden font-sans bg-[#F8F9FA]">
      <Sidebar />
      <main className="flex-grow flex flex-col bg-[#F4F7F6] overflow-y-auto w-full md:w-[calc(100%-320px)] h-screen">
        {children}
      </main>
    </div>
  );
}
