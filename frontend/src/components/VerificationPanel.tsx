import { AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

interface VerificationPanelProps {
  totalNet: number;
  totalWrittenNet: number;
  calculatedCash: number;
  actualCash: number;
  netMatch: boolean;
  cashMatch: boolean;
  mismatchedNozzleNames: string[];
  isFullyVerified: boolean;
}

export function VerificationPanel({ 
  totalNet, totalWrittenNet, calculatedCash, actualCash, 
  netMatch, cashMatch, mismatchedNozzleNames, isFullyVerified
}: VerificationPanelProps) {
  
  if (isFullyVerified) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-bottom">
        <div className="bg-emerald-500 text-white rounded-full p-2 mt-1">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">Entry Verified</h3>
          <p className="text-emerald-700 dark:text-emerald-500 text-sm mt-1">All nozzle readings exactly match their sales, and the actual cash completely matches the calculated cash. You're good to submit!</p>
        </div>
      </div>
    );
  }

  const hasCashInput = actualCash !== undefined && !Number.isNaN(actualCash);
  const hasActualErrors = !netMatch || mismatchedNozzleNames.length > 0 || (!cashMatch && hasCashInput);

  if (!hasActualErrors) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-bottom mb-6">
        <div className="bg-blue-500 text-white rounded-full p-2 mt-1 flex-shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-400">Verification Pending</h3>
          <p className="text-blue-700 dark:text-blue-500 text-sm mt-1">Please fill the necessary fields such as meter readings and actual cash to completely verify the shift.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-500 rounded-2xl p-5 animate-in slide-in-from-bottom mb-6">
      <div className="flex items-start gap-4 mb-4 border-b border-rose-200 dark:border-rose-800/50 pb-4">
        <div className="bg-rose-500 text-white rounded-full p-2 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-rose-800 dark:text-rose-400">Verification Failed</h3>
          <p className="text-rose-700 dark:text-rose-500 text-sm mt-1">There are mismatches in your entry. Please review the errors below before submitting the form.</p>
        </div>
      </div>

      <div className="space-y-4 pl-12 text-sm">
        {!netMatch && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-rose-800 dark:text-rose-300">Total Liters Mismatch</span>
            <span className="text-rose-700 dark:text-rose-400">
              Calculated {totalNet.toFixed(2)} L vs Written {totalWrittenNet.toFixed(2)} L 
              <span className="font-bold ml-1">(Diff: {Math.abs(totalNet - totalWrittenNet).toFixed(2)} L)</span>
            </span>
          </div>
        )}

        {mismatchedNozzleNames.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-rose-800 dark:text-rose-300">Nozzle Errors</span>
            <ul className="list-disc list-inside text-rose-700 dark:text-rose-400">
              {mismatchedNozzleNames.map(name => (
                <li key={name}>Nozzle <strong>{name}</strong> has mismatched readings</li>
              ))}
            </ul>
          </div>
        )}

        {(!cashMatch && hasCashInput) && (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-rose-800 dark:text-rose-300">Cash Discrepancy</span>
            <span className="text-rose-700 dark:text-rose-400">
              Calculated ₹{calculatedCash.toFixed(2)} vs Actual ₹{actualCash.toFixed(2)}
              <span className="font-bold ml-1">(Diff: ₹{Math.abs(calculatedCash - actualCash).toFixed(2)})</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
