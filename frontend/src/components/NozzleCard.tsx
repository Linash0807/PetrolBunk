import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export type NozzleData = {
  id: string;
  name: string;
  omr: string;
  cmr: string;
  testing: string;
  writtenNet: string;
};

interface NozzleCardProps {
  nozzle: NozzleData;
  sales: number;
  netSales: number;
  isMatch: boolean;
  isMismatch: boolean;
  hasInputs: boolean;
  isNegativeSales: boolean;
  isOmrLocked?: boolean;
  omrHelpText?: string;
  onChange: (field: keyof NozzleData, value: string) => void;
}

export function NozzleCard({ 
  nozzle, sales, netSales, isMatch, isMismatch, hasInputs, isNegativeSales, isOmrLocked = false, omrHelpText = '', onChange 
}: NozzleCardProps) {
  
  let statusColorClass = "border-slate-200 dark:border-slate-800";
  let headerBgClass = "bg-slate-50 dark:bg-slate-800/50";
  
  if (isNegativeSales) {
    statusColorClass = "border-rose-500 dark:border-rose-500/50 shadow-rose-500/10 shadow-lg";
    headerBgClass = "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300";
  } else if (isMatch) {
    statusColorClass = "border-emerald-500 dark:border-emerald-500/50 shadow-emerald-500/10 shadow-lg";
    headerBgClass = "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
  } else if (isMismatch) {
    statusColorClass = "border-rose-500 dark:border-rose-500/50 shadow-rose-500/10 shadow-lg";
    headerBgClass = "bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300";
  }

  const writtenNetNum = parseFloat(nozzle.writtenNet) || 0;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ${statusColorClass}`}>
      <div className={`px-5 py-3 flex items-center justify-between border-b ${isMatch || isMismatch || isNegativeSales ? 'border-transparent' : 'border-slate-100 dark:border-slate-800'} ${headerBgClass}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">{nozzle.name}</span>
          {isMatch && !isNegativeSales && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {(isMismatch || isNegativeSales) && <XCircle className="w-5 h-5 text-rose-500" />}
        </div>
        {hasInputs && (
          <div className={`text-sm font-medium ${isNegativeSales ? 'text-rose-600 dark:text-rose-400' : isMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isNegativeSales ? 'Invalid Data' : isMatch ? 'Matched' : 'Mismatch'}
          </div>
        )}
      </div>
      
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">OMR</label>
            <input 
              type="number"
              placeholder="0.00"
              value={nozzle.omr}
              readOnly={isOmrLocked}
              onChange={e => onChange('omr', e.target.value)}
              className={`w-full h-12 px-3 text-lg font-medium rounded-xl border outline-none transition-all ${
                isOmrLocked
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-not-allowed'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {isOmrLocked && omrHelpText && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{omrHelpText}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CMR</label>
            <input 
              type="number"
              placeholder="0.00"
              value={nozzle.cmr}
              onChange={e => onChange('cmr', e.target.value)}
              className="w-full h-12 px-3 text-lg font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Testing</label>
            <input 
              type="number"
              placeholder="0.00"
              value={nozzle.testing}
              onChange={e => onChange('testing', e.target.value)}
              className="w-full h-12 px-3 text-lg font-medium rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Written Net</label>
            <input 
              type="number"
              placeholder="0.00"
              value={nozzle.writtenNet}
              onChange={e => onChange('writtenNet', e.target.value)}
              className={`w-full h-12 px-3 text-lg font-bold rounded-xl border outline-none transition-all ${
                isMatch && !isNegativeSales ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-400 focus:ring-emerald-500 focus:border-emerald-500' :
                (isMismatch || isNegativeSales)? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700/50 text-rose-700 dark:text-rose-400 focus:ring-rose-500 focus:border-rose-500' :
                'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-blue-500 focus:border-blue-500'
              } focus:ring-2`}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
          <div className="flex flex-col">
            <span className="text-slate-500 dark:text-slate-400">Sales (CMR-OMR)</span>
            <span className={`font-semibold ${isNegativeSales ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {sales.toFixed(2)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-slate-500 dark:text-slate-400">Calculated Net</span>
            <span className={`font-bold text-lg ${
              isMatch && !isNegativeSales ? 'text-emerald-600 dark:text-emerald-400' :
              (isMismatch || isNegativeSales) ? 'text-rose-600 dark:text-rose-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {netSales.toFixed(2)}
            </span>
          </div>
        </div>
        
        {isNegativeSales && (
          <div className="mt-2 text-xs flex items-start gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>CMR cannot be less than OMR. Please check your meter readings.</span>
          </div>
        )}
        {!isNegativeSales && isMismatch && (
          <div className="mt-2 text-xs flex items-start gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Difference of {Math.abs(netSales - writtenNetNum).toFixed(2)} detected between calculated and written net.</span>
          </div>
        )}
      </div>
    </div>
  );
}
