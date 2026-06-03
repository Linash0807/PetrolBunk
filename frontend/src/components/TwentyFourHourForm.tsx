import { useState } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NozzleCard, type NozzleData } from './NozzleCard';
import { PaymentSection } from './PaymentSection';
import { VerificationPanel } from './VerificationPanel';
import type { DailyEntry } from '../types';

const NOZZLE_NAMES = [
  'MS 1', 'MS 2', 'MS 3', 'MS 4', 'MS 5', 'MS 6',
  'HSD 1', 'HSD 2', 'HSD 3', 'HSD 4', 'HSD 5', 'HSD 6',
  'Speed 1', 'Speed 2'
];

const INITIAL_NOZZLES = NOZZLE_NAMES.map(name => ({
  id: name,
  name: name,
  omr: '',
  cmr: '',
  testing: '',
  writtenNet: ''
}));

interface TwentyFourHourFormProps {
  onAddEntry: (entry: DailyEntry) => Promise<void>;
  initialEntry?: DailyEntry | null;
  onCancel?: () => void;
}

export function TwentyFourHourForm({ onAddEntry, initialEntry, onCancel }: TwentyFourHourFormProps) {
  const [date, setDate] = useState(() => {
    if (initialEntry?.date) {
      // Ensure date format is YYYY-MM-DD
      return initialEntry.date.split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  });

  const [prices, setPrices] = useState({
    Speed: '125.82',
    MS: '116.35',
    HSD: '104.08'
  });

  const [nozzles, setNozzles] = useState<NozzleData[]>(() => {
    if (initialEntry?.nozzleReadings && initialEntry.nozzleReadings.length > 0) {
      return INITIAL_NOZZLES.map(initial => {
        const found = initialEntry.nozzleReadings!.find(
          r => r.nozzleId === initial.id || r.nozzleName === initial.name
        );
        return {
          id: initial.id,
          name: initial.name,
          omr: found ? found.omr.toString() : '',
          cmr: found ? found.cmr.toString() : '',
          testing: found ? found.testing.toString() : '',
          writtenNet: found ? found.writtenNet.toString() : ''
        };
      });
    }
    return INITIAL_NOZZLES;
  });

  const [phonePe, setPhonePe] = useState(() => initialEntry?.phonePe?.toString() || '');
  const [lubricant, setLubricant] = useState(() => initialEntry?.lubricant?.toString() || '');
  const [expense, setexpense] = useState(() => initialEntry?.expense?.toString() || ''); 
  const [fleetCard, setFleetCard] = useState(() => initialEntry?.fleetCard?.toString() || '');
  const [actualCash, setActualCash] = useState(() => initialEntry?.cash?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNozzleChange = (index: number, field: keyof NozzleData, value: string) => {
    const updated = [...nozzles];
    updated[index] = { ...updated[index], [field]: value };
    setNozzles(updated);
  };

  let totalNet = 0;
  let totalWrittenNet = 0;
  let hasNegativeSales = false;
  const mismatchedNozzleNames: string[] = [];
  let totalSpeed = 0;
  let totalMS = 0;
  let totalHSD = 0;

  const nozzleProps = nozzles.map(nozzle => {
    const omrNum = parseFloat(nozzle.omr) || 0;
    const cmrNum = parseFloat(nozzle.cmr) || 0;
    const testingNum = parseFloat(nozzle.testing) || 0;
    const writtenNetNum = parseFloat(nozzle.writtenNet) || 0;

    const sales = nozzle.cmr !== '' ? (cmrNum - omrNum) : 0;
    const isNegativeSales = nozzle.cmr !== '' && sales < 0;
    if (isNegativeSales) hasNegativeSales = true;
    
    const netSales = isNegativeSales ? sales : Math.max(0, sales - testingNum);
    
    const hasInputs = nozzle.cmr !== '' && nozzle.writtenNet !== '';
    const isMatch = hasInputs && Math.abs(netSales - writtenNetNum) < 0.01;
    const isMismatch = hasInputs && !isMatch;

    if (isMismatch && !isNegativeSales) {
      mismatchedNozzleNames.push(nozzle.name);
    }

    if (!isNegativeSales) {
      totalNet += netSales;
      if (nozzle.name.includes('Speed')) totalSpeed += netSales;
      else if (nozzle.name.includes('MS')) totalMS += netSales;
      else if (nozzle.name.includes('HSD')) totalHSD += netSales;
    }
    totalWrittenNet += writtenNetNum;

    return {
      sales,
      netSales,
      isMatch,
      isMismatch,
      hasInputs,
      isNegativeSales
    };
  });

  const lubricantNum = parseFloat(lubricant) || 0;
  const phonePeNum = parseFloat(phonePe) || 0;
  const fleetCardNum = parseFloat(fleetCard) || 0;
  const actualCashNum = parseFloat(actualCash);
  const expenseNum = parseFloat(expense) || 0;
  const hasCashInput = actualCash !== '' && !Number.isNaN(actualCashNum);
  
  const speedPriceNum = parseFloat(prices.Speed) || 0;
  const msPriceNum = parseFloat(prices.MS) || 0;
  const hsdPriceNum = parseFloat(prices.HSD) || 0;

  const totalAmount = Math.round(((totalSpeed * speedPriceNum) + (totalMS * msPriceNum) + (totalHSD * hsdPriceNum)) * 100) / 100;
  const calculatedCash = Math.round(Math.max(0, totalAmount - phonePeNum - fleetCardNum - expenseNum + lubricantNum) * 100) / 100;

  const hasAnyInputs = nozzles.some(n => n.cmr !== '' || n.writtenNet !== '');
  const netMatch = Math.abs(totalNet - totalWrittenNet) < 0.01 && mismatchedNozzleNames.length === 0 && !hasNegativeSales;
  const isCashMatch = hasCashInput && Math.abs(actualCashNum - calculatedCash) < 0.01;
  const isCashMismatch = hasCashInput && !isCashMatch;

  const isFullyVerified = hasAnyInputs && netMatch && isCashMatch && !hasNegativeSales && mismatchedNozzleNames.length === 0;
  const hasErrors = hasNegativeSales || mismatchedNozzleNames.length > 0 || isCashMismatch || (!netMatch && hasAnyInputs);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 relative">
      
      {/* Top Banner Status */}
      <div className={`sticky top-0 z-40 rounded-b-2xl shadow-md border-b-4 md:rounded-t-2xl p-4 transition-all duration-300 ${
        isFullyVerified ? 'bg-emerald-500 border-emerald-700 text-white shadow-emerald-500/20' : 
        hasErrors ? 'bg-rose-50 dark:bg-rose-900 border-rose-500 text-rose-900 dark:text-rose-100 shadow-rose-500/20' : 
        'bg-white dark:bg-slate-900 border-blue-500 dark:border-blue-600 shadow-slate-200 dark:shadow-slate-900'
      }`}>
        <div className="flex items-start gap-4">
          <div className="shrink-0 mt-1">
            {isFullyVerified ? <ShieldCheck className="w-8 h-8 text-white" /> : 
             hasErrors ? <AlertTriangle className="w-8 h-8 text-rose-500 dark:text-rose-400" /> : 
             <AlertTriangle className="w-8 h-8 text-blue-500 dark:text-blue-400" />}
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${isFullyVerified ? 'text-white' : hasErrors ? 'text-rose-800 dark:text-rose-200' : 'text-slate-900 dark:text-white'}`}>
              {isFullyVerified ? 'All values verified successfully' : hasErrors ? 'Mismatch detected' : '24 Hrs Verification Pending'}
            </h2>
            
            <div className={`mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm ${isFullyVerified ? 'text-emerald-50' : hasErrors ? 'text-rose-700 dark:text-rose-300' : 'text-slate-600 dark:text-slate-400'}`}>
              <div className="flex justify-between border-b pb-1 border-black/5 dark:border-white/5">
                <span>Total Net</span>
                <span className="font-semibold">{totalNet.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-black/5 dark:border-white/5">
                <span>Total Amount</span>
                <span className="font-semibold">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Written Net</span>
                <span className="font-semibold">{totalWrittenNet.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Cash</span>
                <span className="font-semibold">₹{calculatedCash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between col-span-2 pt-1 mt-1 border-t border-black/10 dark:border-white/10">
                <span className="font-bold">Actual Cash Present</span>
                <span className="font-bold">{hasCashInput ? `₹${actualCashNum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {initialEntry ? 'Edit 24 Hrs Bunk Report' : '24 Hrs Bunk Report'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {initialEntry ? 'Modify meter readings and verify collections.' : 'Fill meter readings for all pumps at the end of the day.'}
          </p>
        </div>
      </div>

      {/* Date Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          Entry Details
        </h3>
        <div className="max-w-md space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> Date
          </label>
          <input 
            type="date" 
            value={date}
            onChange={e => setDate(e.target.value)}
            disabled={!!initialEntry}
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Fuel Prices Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Fuel Prices (₹/L)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Speed</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input type="number" value={prices.Speed} onChange={e => setPrices({...prices, Speed: e.target.value})} className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">MS</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input type="number" value={prices.MS} onChange={e => setPrices({...prices, MS: e.target.value})} className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">HSD</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input type="number" value={prices.HSD} onChange={e => setPrices({...prices, HSD: e.target.value})} className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Pumps Section */}
      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider pt-2 pl-1">Meter Readings</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {['MS', 'HSD', 'Speed'].map(fuel => {
            const fuelNozzles = nozzles.map((n, i) => ({ n, i })).filter(({ n }) => n.name.startsWith(fuel));
            if (fuelNozzles.length === 0) return null;
            return (
              <div key={fuel} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200">
                  {fuel} Pumps
                </div>
                <div className="p-4 space-y-4">
                  {fuelNozzles.map(({ n: nozzle, i: index }) => {
                    const props = nozzleProps[index];
                    return (
                      <NozzleCard 
                        key={nozzle.id} 
                        nozzle={nozzle} 
                        sales={props.sales}
                        netSales={props.netSales}
                        isMatch={props.isMatch}
                        isMismatch={props.isMismatch}
                        hasInputs={props.hasInputs}
                        isNegativeSales={props.isNegativeSales}
                        onChange={(field, value) => handleNozzleChange(index, field, value)} 
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fuel Sales Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Fuel Sales Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">MS Sales</div>
            <div className="text-2xl font-black text-orange-700 dark:text-orange-300">{totalMS.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
            <div className="text-sm font-bold text-orange-600 dark:text-orange-400 mt-1">₹{(totalMS * msPriceNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">HSD Sales</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalHSD.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">₹{(totalHSD * hsdPriceNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider">Speed Sales</div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300">{totalSpeed.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
            <div className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">₹{(totalSpeed * speedPriceNum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      <PaymentSection 
        totalNet={totalNet}
        totalSpeed={totalSpeed}
        totalMS={totalMS}
        totalHSD={totalHSD}
        prices={{ Speed: speedPriceNum, MS: msPriceNum, HSD: hsdPriceNum }}
        phonePe={phonePe} setPhonePe={setPhonePe}
        lubricant={lubricant} setLubricant={setLubricant}
        expense={expense} setexpense={setexpense}
        fleetCard={fleetCard} setFleetCard={setFleetCard}
        actualCash={actualCash} setActualCash={setActualCash}
        calculatedCash={calculatedCash} totalAmount={totalAmount}
        isCashMatch={isCashMatch}
        isCashMismatch={isCashMismatch}
      />

      <VerificationPanel 
        totalNet={totalNet}
        totalWrittenNet={totalWrittenNet}
        calculatedCash={calculatedCash}
        actualCash={hasCashInput ? actualCashNum : NaN}
        netMatch={netMatch}
        cashMatch={isCashMatch}
        mismatchedNozzleNames={mismatchedNozzleNames}
        isFullyVerified={isFullyVerified}
      />

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-3 left-1 right-1 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex gap-3 z-50 lg:max-w-7xl lg:mx-auto rounded-t-2xl">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-4 rounded-xl border border-slate-350 dark:border-slate-700 font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>
        )}
        <button 
          disabled={!isFullyVerified || isSubmitting}
          onClick={async () => {
            try {
              setIsSubmitting(true);
              
              const nozzleReadings = nozzles.map((nozzle) => ({
                nozzleId: nozzle.id,
                nozzleName: nozzle.name,
                omr: parseFloat(nozzle.omr) || 0,
                cmr: parseFloat(nozzle.cmr) || 0,
                testing: parseFloat(nozzle.testing) || 0,
                writtenNet: parseFloat(nozzle.writtenNet) || 0,
              }));

              await onAddEntry({
                ...(initialEntry?._id ? { _id: initialEntry._id } : {}),
                date,
                speed: totalSpeed,
                ms: totalMS,
                hsd: totalHSD,
                cash: actualCashNum,
                phonePe: phonePeNum,
                lubricant: lubricantNum,
                fleetCard: fleetCardNum,
                expense: expenseNum,
                nozzleReadings
              });
            } finally {
              setIsSubmitting(false);
            }
          }}
          className={`flex-1 py-4 px-6 rounded-xl font-bold active:scale-95 transition-all flex items-center justify-center gap-2 ${
            isFullyVerified && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30' 
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" /> {isSubmitting ? 'Saving...' : initialEntry ? 'Update 24 Hrs Report' : 'Submit 24 Hrs Report'}
        </button>
      </div>
    </div>
  );
}
