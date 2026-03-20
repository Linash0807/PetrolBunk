import { IndianRupee, CreditCard, Banknote, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface PaymentSectionProps {
  totalNet: number;
  totalSpeed: number;
  totalMS: number;
  totalHSD: number;
  prices: { Speed: number; MS: number; HSD: number };
  phonePe: string;
  setPhonePe: (val: string) => void;
  expense: string;
  setexpense: (val: string) => void;
  fleetCard: string;
  setFleetCard: (val: string) => void;
  actualCash: string;
  setActualCash: (val: string) => void;
  calculatedCash: number;
  totalAmount: number;
  isCashMatch: boolean;
  isCashMismatch: boolean;
}

export function PaymentSection({ 
  totalNet, totalSpeed, totalMS, totalHSD, prices, phonePe, setPhonePe, expense, setexpense, fleetCard, setFleetCard, actualCash, setActualCash, 
  calculatedCash, totalAmount, isCashMatch, isCashMismatch
}: PaymentSectionProps) {

  const actualCashNum = parseFloat(actualCash) || 0;

  let highlightClass = "border-slate-200 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500";
  if (isCashMatch) highlightClass = "border-emerald-500 text-emerald-700 dark:text-emerald-400 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10 shadow-emerald-500/10 shadow-lg";
  if (isCashMismatch) highlightClass = "border-rose-500 text-rose-700 dark:text-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/50 dark:bg-rose-900/10 shadow-rose-500/10 shadow-lg";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 mt-6 animate-in slide-in-from-bottom border-b-4 border-b-blue-500 dark:border-b-blue-600">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <IndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">Payment Section</h3>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-5 border border-blue-100 dark:border-blue-800/50 space-y-3">
        {totalSpeed > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Speed (₹{prices.Speed.toFixed(2)}/L)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalSpeed.toFixed(2)} L = ₹{(totalSpeed * prices.Speed).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {totalMS > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">MS (₹{prices.MS.toFixed(2)}/L)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalMS.toFixed(2)} L = ₹{(totalMS * prices.MS).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {totalHSD > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">HSD (₹{prices.HSD.toFixed(2)}/L)</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalHSD.toFixed(2)} L = ₹{(totalHSD * prices.HSD).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        
        {(totalSpeed > 0 || totalMS > 0 || totalHSD > 0) && (
          <div className="border-t border-blue-200 dark:border-blue-800/50 pt-2" />
        )}

        <div className="flex items-center justify-between mb-2 mt-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Net Sales</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{totalNet.toFixed(2)} L</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
            Total Amount
          </span>
          <span className="text-2xl font-black text-blue-700 dark:text-blue-400">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">Pe</span>
              PhonePe Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input 
                type="number"
                placeholder="0.00"
                value={phonePe}
                onChange={e => setPhonePe(e.target.value)}
                className="w-full h-14 pl-8 pr-3 text-xl font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-500" />
              Fleet Card Received
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input 
                type="number"
                placeholder="0.00"
                value={fleetCard}
                onChange={e => setFleetCard(e.target.value)}
                className="w-full h-14 pl-8 pr-3 text-xl font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">Pe</span>
              Expense
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input 
                type="number"
                placeholder="0.00"
                value={expense}
                onChange={e => setexpense(e.target.value)}
                className="w-full h-14 pl-8 pr-3 text-xl font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
              <Banknote className="w-5 h-5" /> Calculated Cash
            </span>
            <span className="text-xl font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              ₹{calculatedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Actual Cash Received</span>
              {isCashMatch && <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" /> Matched</span>}
              {isCashMismatch && <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><XCircle className="w-3 h-3" /> Mismatch</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
              <input 
                type="number"
                placeholder="0.00"
                value={actualCash}
                onChange={e => setActualCash(e.target.value)}
                className={`w-full h-16 pl-8 pr-3 text-2xl font-bold rounded-xl outline-none transition-all border-2 ${highlightClass}`}
              />
            </div>
            
            {isCashMismatch && (
              <div className="mt-2 text-sm flex items-start gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-lg border border-rose-100 dark:border-rose-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Cash is off by <strong>₹{Math.abs(calculatedCash - actualCashNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> compared to the calculated amount.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
