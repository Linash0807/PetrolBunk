import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

export function DashboardLayout({ children, activePath = '/', onNavigate }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 w-full min-h-screen">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activePath={activePath}
        onNavigate={onNavigate}
      />

      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
        <TopNav onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
