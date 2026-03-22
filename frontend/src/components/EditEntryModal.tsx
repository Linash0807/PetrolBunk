import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { ShiftEntry } from '../types';

const PUMPS = ['1', '2', '3', '4', '5', '6'];

interface EditEntryModalProps {
  entry: ShiftEntry;
  onClose: () => void;
  onSave: (updatedEntry: ShiftEntry) => Promise<void>;
}

export function EditEntryModal({ entry, onClose, onSave }: EditEntryModalProps) {
  const [formData, setFormData] = useState({
    date: entry.date,
    shift: entry.shift,
    pump: entry.pump || '1',
    employee: entry.employee,
    speed: entry.speed.toString(),
    ms: entry.ms.toString(),
    hsd: entry.hsd.toString(),
    cash: entry.cash.toString(),
    phonePe: entry.phonePe.toString(),
    fleetCard: entry.fleetCard.toString(),
    expense: entry.expense.toString(),
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic calculations for the UI
  const currentTotalLiters = (parseFloat(formData.speed) || 0) + (parseFloat(formData.ms) || 0) + (parseFloat(formData.hsd) || 0);
  const currentTotalCollection = (parseFloat(formData.cash) || 0) + (parseFloat(formData.phonePe) || 0) + (parseFloat(formData.fleetCard) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSave({
        ...entry,
        date: formData.date,
        shift: formData.shift,
        pump: formData.pump,
        employee: formData.employee,
        speed: parseFloat(formData.speed) || 0,
        ms: parseFloat(formData.ms) || 0,
        hsd: parseFloat(formData.hsd) || 0,
        cash: parseFloat(formData.cash) || 0,
        phonePe: parseFloat(formData.phonePe) || 0,
        fleetCard: parseFloat(formData.fleetCard) || 0,
        expense: parseFloat(formData.expense) || 0,
      });
    } catch (error) {
      console.error(error);
      alert('Failed to update entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Shift Entry</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto overflow-x-hidden flex-1 border-t border-slate-100 dark:border-slate-800 shadow-inner bg-white dark:bg-slate-950">
          <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => handleChange('date', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Shift</label>
                <select 
                  value={formData.shift}
                  onChange={e => handleChange('shift', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100"
                >
                  <option value="A">Shift A</option>
                  <option value="B">Shift B</option>
                  <option value="C">Shift C</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Pump</label>
                <select 
                  value={formData.pump}
                  onChange={e => handleChange('pump', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100"
                >
                  {PUMPS.map(p => (
                    <option key={p} value={p}>Pump {p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee</label>
                <input 
                  type="text" 
                  value={formData.employee}
                  onChange={e => handleChange('employee', e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-700 dark:text-slate-100"
                />
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Fuel Sales */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Fuel Sales (Liters)</h3>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">Total: {currentTotalLiters.toFixed(2)} L</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Speed</label>
                  <input type="number" step="0.01" value={formData.speed === '0' ? '' : formData.speed} onChange={e => handleChange('speed', e.target.value)} className="w-full h-12 px-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">MS</label>
                  <input type="number" step="0.01" value={formData.ms === '0' ? '' : formData.ms} onChange={e => handleChange('ms', e.target.value)} className="w-full h-12 px-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">HSD</label>
                  <input type="number" step="0.01" value={formData.hsd === '0' ? '' : formData.hsd} onChange={e => handleChange('hsd', e.target.value)} className="w-full h-12 px-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-800 dark:text-white" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* Collections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Collections (INR)</h3>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Total: ₹{currentTotalCollection.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Cash</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" step="0.01" value={formData.cash === '0' ? '' : formData.cash} onChange={e => handleChange('cash', e.target.value)} className="w-full h-12 pl-8 pr-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">PhonePe</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" step="0.01" value={formData.phonePe === '0' ? '' : formData.phonePe} onChange={e => handleChange('phonePe', e.target.value)} className="w-full h-12 pl-8 pr-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Fleet Card</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" step="0.01" value={formData.fleetCard === '0' ? '' : formData.fleetCard} onChange={e => handleChange('fleetCard', e.target.value)} className="w-full h-12 pl-8 pr-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Expense</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" step="0.01" value={formData.expense === '0' ? '' : formData.expense} onChange={e => handleChange('expense', e.target.value)} className="w-full h-12 pl-8 pr-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900 rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              form="edit-form"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-black tracking-wide text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
