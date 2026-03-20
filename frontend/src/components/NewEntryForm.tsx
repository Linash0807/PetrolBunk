import { useState } from 'react';
import { Calendar, MapPin, Clock, User, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NozzleCard, type NozzleData } from './NozzleCard';
import { PaymentSection } from './PaymentSection';
import { VerificationPanel } from './VerificationPanel';
import type { ShiftEntry } from '../types';

const NOZZLES = ['Speed1', 'Speed2', 'MS1', 'MS2', 'HSD1', 'HSD2'];

interface NewEntryFormProps {
  onAddEntry: (entry: ShiftEntry) => Promise<void>;
}

export function NewEntryForm({ onAddEntry }: NewEntryFormProps) {
  const [bunk, setBunk] = useState('Bunk 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('A');
  const [employee, setEmployee] = useState('');
  const [entryMode, setEntryMode] = useState<'employee' | 'bunk'>('employee');

  const [prices, setPrices] = useState({
    Speed: '117.78',
    MS: '108.31',
    HSD: '96.19'
  });

  const [nozzles, setNozzles] = useState<NozzleData[]>(
    NOZZLES.map(name => ({
      id: name,
      name,
      omr: '',
      cmr: '',
      testing: '',
      writtenNet: ''
    }))
  );

  const [phonePe, setPhonePe] = useState('');
  const [expense, setexpense] = useState(''); 
  const [fleetCard, setFleetCard] = useState('');
  const [actualCash, setActualCash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNozzleChange = (index: number, field: keyof NozzleData, value: string) => {
    const updated = [...nozzles];
    updated[index] = { ...updated[index], [field]: value };
    setNozzles(updated);
  };

  // ----------------------------------------------------
  // GLOBAL CALCULATIONS (ONLY IN PARENT AS REQUESTED)
  // ----------------------------------------------------
  
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
    
    // Net is Sales - Testing, but min 0 unless sales is negative
    const netSales = isNegativeSales ? sales : Math.max(0, sales - testingNum);
    
    const hasInputs = nozzle.cmr !== '' && nozzle.writtenNet !== '';
    const isMatch = hasInputs && Math.abs(netSales - writtenNetNum) < 0.01;
    const isMismatch = hasInputs && !isMatch;

    if (isMismatch && !isNegativeSales) {
      mismatchedNozzleNames.push(nozzle.name);
    }

    // Only add to totals if inputs are valid and non-negative
    if (!isNegativeSales) {
      totalNet += netSales;
      if (nozzle.name.startsWith('Speed')) totalSpeed += netSales;
      else if (nozzle.name.startsWith('MS')) totalMS += netSales;
      else if (nozzle.name.startsWith('HSD')) totalHSD += netSales;
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

  const phonePeNum = parseFloat(phonePe) || 0;
  const fleetCardNum = parseFloat(fleetCard) || 0;
  const actualCashNum = parseFloat(actualCash);
  const expenseNum = parseFloat(expense) || 0;
  const hasCashInput = actualCash !== '' && !Number.isNaN(actualCashNum);
  
  const speedPriceNum = parseFloat(prices.Speed) || 0;
  const msPriceNum = parseFloat(prices.MS) || 0;
  const hsdPriceNum = parseFloat(prices.HSD) || 0;

  const totalAmount = Math.round(((totalSpeed * speedPriceNum) + (totalMS * msPriceNum) + (totalHSD * hsdPriceNum)) * 100) / 100;
  const calculatedCash = Math.round(Math.max(0, totalAmount - phonePeNum - fleetCardNum - expenseNum) * 100) / 100;

  // Verification Logic
  const hasAnyInputs = nozzles.some(n => n.cmr !== '' || n.writtenNet !== '');
  const netMatch = Math.abs(totalNet - totalWrittenNet) < 0.01 && mismatchedNozzleNames.length === 0 && !hasNegativeSales;
  const isCashMatch = hasCashInput && Math.abs(actualCashNum - calculatedCash) < 0.01;
  const isCashMismatch = hasCashInput && !isCashMatch;

  const isFullyVerified = hasAnyInputs && netMatch && isCashMatch && !hasNegativeSales && mismatchedNozzleNames.length === 0;
  const hasErrors = hasNegativeSales || mismatchedNozzleNames.length > 0 || isCashMismatch || (!netMatch && hasAnyInputs);
  const isEmployeeMissing = entryMode === 'employee' && employee.trim() === '';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-28 animate-in fade-in duration-500 relative">
      
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
              {isFullyVerified ? 'All values verified successfully' : hasErrors ? 'Mismatch detected' : entryMode === 'bunk' ? 'Bunk Verification Pending' : 'Shift Verification Pending'}
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

      {/* Mode Switcher */}
      <div className="flex justify-center px-4 pt-2 pb-2">
        <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center shadow-inner border border-slate-200 dark:border-slate-700 w-full max-w-sm relative z-10">
          <button 
            onClick={() => setEntryMode('employee')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${entryMode === 'employee' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow shadow-black/5 scale-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'}`}
          >
            {entryMode === 'employee' ? '👤 Employee' : 'Employee'}
          </button>
          <button 
            onClick={() => setEntryMode('bunk')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${entryMode === 'bunk' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow shadow-black/5 scale-100' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 scale-95 hover:scale-100'}`}
          >
            {entryMode === 'bunk' ? '🏢 Bunk' : 'Bunk'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {entryMode === 'employee' ? 'New Shift Entry' : 'New Bunk Entry'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {entryMode === 'employee' ? 'Fill meter readings for an employee shift.' : 'Fill total meter readings for the bunk.'}
          </p>
        </div>
      </div>

      {/* Top Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
          {entryMode === 'employee' ? 'Shift Details' : 'Bunk Details'}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Bunk
            </label>
            <select 
              value={bunk}
              onChange={e => setBunk(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="Bunk 1">Bunk 1</option>
              <option value="Bunk 2">Bunk 2</option>
              <option value="Bunk 3">Bunk 3</option>
              <option value="Bunk 4">Bunk 4</option>
              <option value="Bunk 5">Bunk 5</option>
              <option value="Bunk 5">Bunk 6</option>
              <option value="Bunk 5">Bunk 7</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" /> Date
            </label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {entryMode === 'employee' && (
            <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Shift
              </label>
              <select 
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="A">Shift A (Morning)</option>
                <option value="B">Shift B (Evening)</option>
                <option value="C">Shift C (Night)</option>
              </select>
            </div>
          )}

          {entryMode === 'employee' && (
            <div className="space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" /> Employee Name
              </label>
              <input 
                type="text" 
                placeholder="Enter name"
                value={employee}
                onChange={e => setEmployee(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          )}
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
              <input 
                type="number" 
                value={prices.Speed}
                onChange={e => setPrices({...prices, Speed: e.target.value})}
                className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">MS</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input 
                type="number" 
                value={prices.MS}
                onChange={e => setPrices({...prices, MS: e.target.value})}
                className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">HSD</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
              <input 
                type="number" 
                value={prices.HSD}
                onChange={e => setPrices({...prices, HSD: e.target.value})}
                className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nozzle Cards list */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider pt-2 pl-1">Meter Readings</h3>
        
        {nozzles.map((nozzle, index) => {
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

      {/* Fuel Sales Summary Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Fuel Sales Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-xl border border-orange-100 dark:border-orange-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1 uppercase tracking-wider">MS Sales</div>
            <div className="text-2xl font-black text-orange-700 dark:text-orange-300">{totalMS.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider">HSD Sales</div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalHSD.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 flex flex-col items-center justify-center">
            <div className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1 uppercase tracking-wider">Speed Sales</div>
            <div className="text-2xl font-black text-purple-700 dark:text-purple-300">{totalSpeed.toFixed(2)} <span className="text-base font-medium opacity-70">L</span></div>
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
        
        <button 
          disabled={!isFullyVerified || isSubmitting || isEmployeeMissing}
          onClick={async () => {
            if (isEmployeeMissing) {
              alert('Please enter employee name before submitting.');
              return;
            }

            try {
              setIsSubmitting(true);
              await onAddEntry({
                bunk,
                date,
                shift: entryMode === 'bunk' ? 'Day End' : shift,
                employee: entryMode === 'bunk' ? 'Bunk Total' : employee,
                speed: totalSpeed,
                ms: totalMS,
                hsd: totalHSD,
                cash: actualCashNum,
                phonePe: phonePeNum,
                fleetCard: fleetCardNum,
                expense: expenseNum,
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
          <CheckCircle2 className="w-5 h-5" /> {isSubmitting ? 'Saving...' : 'Submit Entry'}
        </button>
      </div>
    </div>
  );
}
