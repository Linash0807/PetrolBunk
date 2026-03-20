import { Home, PlusCircle, BarChart3, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePath?: string;
  onNavigate?: (path: string) => void;
}

const navItems = [
  { name: 'Dashboard', icon: Home, path: '/' },
  { name: 'New Entry', icon: PlusCircle, path: '/new-entry' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
];

export function Sidebar({ isOpen, onClose, activePath = '/', onNavigate }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-effect transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:w-64 max-md:bg-white max-md:dark:bg-slate-900 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 md:hidden border-b border-slate-200 dark:border-slate-800">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:mt-6">
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activePath === item.path;
              return (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate(item.path);
                    onClose(); 
                  }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  }`} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
