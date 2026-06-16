import { useState } from 'react';
import { X, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import type { ShiftEntry, ExpenseItem } from '../types';

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
    lubricant: (entry.lubricant || 0).toString(),
    expense: entry.expense.toString(),
  });
  
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(() => {
    return entry.expenseItems || [];
  });
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const handleAddExpenseItem = () => {
    const name = newItemName.trim();
    const amount = parseFloat(newItemAmount) || 0;
    if (!name) {
      alert('Please enter a description for the expense.');
      return;
    }
    if (amount <= 0) {
      alert('Please enter an amount greater than 0.');
      return;
    }
    setExpenseItems([...expenseItems, { name, amount }]);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddExpenseItem();
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic calculations for the UI
  const currentTotalLiters = (parseFloat(formData.speed) || 0) + (parseFloat(formData.ms) || 0) + (parseFloat(formData.hsd) || 0);
  const currentExpenseTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const currentTotalCollection = (parseFloat(formData.cash) || 0) + (parseFloat(formData.phonePe) || 0) + (parseFloat(formData.fleetCard) || 0) + (parseFloat(formData.lubricant) || 0) - currentExpenseTotal;

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
        lubricant: parseFloat(formData.lubricant) || 0,
        expense: currentExpenseTotal,
        expenseItems: expenseItems,
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Lubricant</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input type="number" step="0.01" value={formData.lubricant === '0' ? '' : formData.lubricant} onChange={e => handleChange('lubricant', e.target.value)} className="w-full h-12 pl-8 pr-4 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>
                </div>
              </div>

              {/* Expense Manager */}
              <div className="border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-4 rounded-2xl space-y-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">Ex</span>
                  Expense Items List (Total: ₹{currentExpenseTotal.toLocaleString('en-IN')})
                </label>

                {/* List of current expenses */}
                {expenseItems.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic pl-1">No expense items added yet.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                    {expenseItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-left-2 duration-200">
                        <span className="font-semibold text-slate-800 dark:text-slate-250 text-sm">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = expenseItems.filter((_, i) => i !== idx);
                              setExpenseItems(updated);
                            }}
                            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all cursor-pointer animate-in zoom-in-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new expense input row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Expense description (e.g. Tea, Repairs)"
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                  />
                  <div className="flex gap-2">
                    <div className="relative flex-1 sm:w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={newItemAmount}
                        onChange={e => setNewItemAmount(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-11 pl-7 pr-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddExpenseItem}
                      className="px-4 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95 shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
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
