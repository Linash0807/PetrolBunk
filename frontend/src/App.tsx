import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { NewEntryForm } from './components/NewEntryForm';
import { Reports } from './components/Reports';
import { EditEntryModal } from './components/EditEntryModal';
import {
  Activity,
  ArrowRight,
  Banknote,
  CalendarDays,
  Droplet,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

function StatCard({ title, value, icon: Icon, trend }: { title: string; value: string; icon: LucideIcon; trend: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-md hover:-translate-y-0.5">
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

function DashboardOverview({
  entries,
  onNavigate,
}: {
  entries: ShiftEntry[];
  onNavigate: (path: string) => void;
}) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const todayEntries = entries.filter((entry) => entry.date === localToday);

  const totalSpeed = todayEntries.reduce((acc, curr) => acc + curr.speed, 0);
  const totalMS = todayEntries.reduce((acc, curr) => acc + curr.ms, 0);
  const totalHSD = todayEntries.reduce((acc, curr) => acc + curr.hsd, 0);
  const totalLiters = totalSpeed + totalMS + totalHSD;

  const totalCash = todayEntries.reduce((acc, curr) => acc + curr.cash, 0);
  const totalPhonePe = todayEntries.reduce((acc, curr) => acc + curr.phonePe, 0);
  const totalFleet = todayEntries.reduce((acc, curr) => acc + curr.fleetCard, 0);
  const totalCollection = totalCash + totalPhonePe + totalFleet;

  const totalShifts = todayEntries.length;
  const avgLitersPerShift = totalShifts > 0 ? totalLiters / totalShifts : 0;

  const latestEntries = [...todayEntries].slice(-5).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-cyan-100 via-sky-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950/40 dark:to-indigo-950/60 p-6 md:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 translate-x-14 -translate-y-16 rounded-full bg-cyan-200/50 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-10 translate-y-10 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />

        <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700/80 dark:text-blue-300/80">Operations Pulse</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h2>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
              Live shift snapshot with today's results and recent team activity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('/new-entry')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              New Entry <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('/reports')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 transition hover:bg-white dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-700"
            >
              Open Reports <CalendarDays className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today Liters"
          value={`${totalLiters.toFixed(2)} L`}
          icon={Droplet}
          trend={`${totalShifts} shifts`}
        />
        <StatCard
          title="Today Collection"
          value={`₹${totalCollection.toLocaleString('en-IN')}`}
          icon={Banknote}
          trend={`Cash ₹${totalCash.toLocaleString('en-IN')}`}
        />
        <StatCard
          title="Avg / Shift"
          value={`${avgLitersPerShift.toFixed(2)} L`}
          icon={TrendingUp}
          trend={totalShifts > 0 ? 'Computed live' : 'No shift data'}
        />
        <StatCard
          title="Entries Logged"
          value={`${totalShifts}`}
          icon={Activity}
          trend={totalShifts > 0 ? 'Updated now' : 'Start with new entry'}
        />
      </div>

      <div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Today's Shift Entries</h3>
          <div className="mt-4 space-y-2">
            {latestEntries.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No entries for today yet. Create your first shift entry to populate the dashboard.
              </div>
            )}

            {latestEntries.map((entry, index) => {
              const shiftLiters = entry.speed + entry.ms + entry.hsd;
              const shiftTotal = entry.cash + entry.phonePe + entry.fleetCard;

              return (
                <div
                  key={`${entry.date}-${entry.employee}-${entry.shift}-${index}`}
                  className="grid grid-cols-1 gap-2 rounded-xl border border-slate-100 p-3 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 md:grid-cols-4 md:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{entry.employee || 'Unknown Employee'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.bunk} • Shift {entry.shift} • Pump {entry.pump || '-'}</p>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{entry.date}</p>
                  <p className="font-semibold text-blue-700 dark:text-blue-400">{shiftLiters.toFixed(2)} L</p>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">₹{shiftTotal.toLocaleString('en-IN')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

import type { ShiftEntry } from './types';

const validPaths = ['/', '/new-entry', '/reports'] as const;

function normalizePath(path: string): string {
  return validPaths.includes(path as (typeof validPaths)[number]) ? path : '/';
}

function App() {
  const { token } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname));
  const [entries, setEntries] = useState<ShiftEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<ShiftEntry | null>(null);

  const navigateTo = (path: string) => {
    const nextPath = normalizePath(path);
    setCurrentPath(nextPath);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
  };

  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const apiBaseUrls = Array.from(
    new Set([
      configuredApiBaseUrl || 'http://localhost:5000/api',
      'https://petrolbunk-backend.onrender.com/api',
    ])
  );

  const fetchFromApi = async (path: string, init?: RequestInit) => {
    let lastError: unknown = null;

    const headers: Record<string, string> = { 
      ...(init?.headers as Record<string, string> || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    for (const baseUrl of apiBaseUrls) {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          ...init,
          headers
        });

        if (baseUrl !== apiBaseUrls[0]) {
          console.warn(`Primary API unavailable, using fallback: ${baseUrl}`);
        }

        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Failed to connect to API');
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);

    const loadEntries = async () => {
      try {
        const response = await fetchFromApi('/shift-entries');
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }

        const result = await response.json();
        if (result?.success && Array.isArray(result.data)) {
          setEntries(result.data);
        }
      } catch (error) {
        console.error('Error loading shift entries:', error);
      }
    };

    loadEntries();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleAddEntry = async (entry: ShiftEntry) => {
    const response = await fetchFromApi('/shift-entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const backendMessage = result?.message || result?.error;
      throw new Error(backendMessage ? `Failed to save entry: ${backendMessage}` : 'Failed to save entry');
    }

    if (!result?.success || !result?.data) {
      throw new Error('Invalid response while saving entry');
    }

    setEntries((prev) => [result.data, ...prev]);
    alert('Entry saved to MongoDB successfully!');
    navigateTo('/reports');
  };

  const handleUpdateEntry = async (entry: ShiftEntry) => {
    if (!entry._id) {
       alert("Cannot update: Entry ID is missing. This could be an old record without an ID.");
       return;
    }
    const response = await fetchFromApi(`/shift-entries/${entry._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const backendMessage = result?.message || result?.error;
      throw new Error(backendMessage ? `Failed to update entry: ${backendMessage}` : 'Failed to update entry');
    }

    if (!result?.success || !result?.data) {
      throw new Error('Invalid response while updating entry');
    }

    setEntries((prev) => prev.map(e => e._id === entry._id ? result.data : e));
    setEditingEntry(null);
    alert('Entry updated successfully!');
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetchFromApi(`/shift-entries/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Failed to delete entry');
      }

      setEntries((prev) => prev.filter(e => e._id !== id));
      alert('Entry deleted successfully!');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Error deleting entry');
    }
  };

  return (
    <ProtectedRoute onNavigate={navigateTo}>
      <DashboardLayout activePath={currentPath} onNavigate={navigateTo}>
        {currentPath === '/' && <DashboardOverview entries={entries} onNavigate={navigateTo} />}
        {currentPath === '/new-entry' && <NewEntryForm onAddEntry={handleAddEntry} entries={entries} />}
        {currentPath === '/reports' && <Reports entries={entries} onEditEntry={setEditingEntry} onDeleteEntry={handleDeleteEntry} />}
      </DashboardLayout>
      
      {editingEntry && (
        <EditEntryModal 
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleUpdateEntry}
        />
      )}
    </ProtectedRoute>
  );
}

export default App;
