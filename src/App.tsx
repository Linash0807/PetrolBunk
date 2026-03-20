import { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { NewEntryForm } from './components/NewEntryForm';
import { Activity, Droplet, DollarSign, TrendingUp } from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back. Here's what's happening today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Liters Sold" value="4,250 L" icon={Droplet} trend="+12.5%" />
        <StatCard title="Revenue" value="₹4,25,000" icon={DollarSign} trend="+8.2%" />
        <StatCard title="Active Entries" value="142" icon={Activity} trend="+2.4%" />
        <StatCard title="Efficiency" value="98.5%" icon={TrendingUp} trend="+1.1%" />
      </div>

      <div className="mt-8 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 min-h-[300px] flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Main Content Area (Charts / Tables go here)</p>
      </div>
    </div>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState('/');

  return (
    <DashboardLayout activePath={currentPath} onNavigate={setCurrentPath}>
      {currentPath === '/' && <DashboardOverview />}
      {currentPath === '/new-entry' && <NewEntryForm />}
      {currentPath === '/reports' && (
        <div className="flex items-center justify-center p-12 text-slate-500 animate-in fade-in">
          Reports Module Coming Soon...
        </div>
      )}
    </DashboardLayout>
  );
}

export default App;
