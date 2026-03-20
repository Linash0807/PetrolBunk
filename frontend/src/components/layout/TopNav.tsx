import { Menu, Droplet } from 'lucide-react';

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between px-4 glass-effect md:px-8 print:hidden">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <Droplet className="w-4 h-4" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent truncate hidden sm:block md:hidden lg:block">
            Petrol Bunk Manager
          </h1>
          <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent sm:hidden">
            PBM
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800 cursor-pointer">
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AD</span>
        </div>
      </div>
    </header>
  );
}
