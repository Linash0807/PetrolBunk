import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Fuel, Lock, User } from 'lucide-react';

export const Login: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
      const baseUrl = configuredApiBaseUrl || 'http://localhost:5000/api';
      
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        login(data.token);
        onNavigate('/');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border-4 border-blue-50 dark:border-slate-800">
            <Fuel className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
            Manager Login
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Sign in to access the Petrol Bunk Tracker
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}
          
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-slate-300 dark:border-slate-600 placeholder-slate-400 text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
