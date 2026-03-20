import { useState } from 'react';
import { MapPin, Printer, Calculator, Fuel, CreditCard, Banknote, History, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ShiftEntry } from '../types';

const BUNKS = ['Bunk 1', 'Bunk 2', 'Bunk 3', 'Bunk 4', 'Bunk 5', 'Bunk 6', 'Bunk 7'];

export function Reports({ entries }: { entries: ShiftEntry[] }) {
  const [selectedBunk, setSelectedBunk] = useState<string>('Bunk 1');
  const [testingValue, setTestingValue] = useState<string>('0');
  const reportDate = new Date().toLocaleDateString('en-GB');
  const bunkNumber = selectedBunk.replace(/\D+/g, '') || selectedBunk;

  const testingNum = parseFloat(testingValue) || 0;
  const currentData = entries.filter(e => e.bunk === selectedBunk);

  // Calculate Totals
  const totalSpeed = currentData.reduce((acc, curr) => acc + curr.speed, 0);
  const totalMS = currentData.reduce((acc, curr) => acc + curr.ms, 0);
  const totalHSD = currentData.reduce((acc, curr) => acc + curr.hsd, 0);

  const grossTotalLiters = totalSpeed + totalMS + totalHSD;
  const netTotalLiters = Math.max(0, grossTotalLiters - testingNum);

  const totalCash = currentData.reduce((acc, curr) => acc + curr.cash, 0);
  const totalPhonePe = currentData.reduce((acc, curr) => acc + curr.phonePe, 0);
  const totalFleetCard = currentData.reduce((acc, curr) => acc + curr.fleetCard, 0);
  const totalCollection = totalCash + totalPhonePe + totalFleetCard;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const fileDate = new Date().toISOString().split('T')[0];
    const safeBunk = selectedBunk.toLowerCase().replace(/\s+/g, '-');
    const fileName = `${safeBunk}-${fileDate}.pdf`;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DAY END SALES REPORT', 40, 40);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${reportDate}`, 40, 58);
    doc.text(`Bunk No: ${bunkNumber}`, 180, 58);
   /* doc.text(`Testing Deduction: ${testingNum.toFixed(2)} L`, 300, 58);*/

    autoTable(doc, {
      startY: 72,
      theme: 'grid',
      styles: { fontSize: 9, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, cellPadding: 4 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      body: [
        ['Net Liters', `${netTotalLiters.toFixed(2)} L`],
        ['Gross Liters', `${grossTotalLiters.toFixed(2)} L`],
        ['Total Cash', `Rs ${totalCash.toLocaleString('en-IN')}`],
        ['PhonePe', `Rs ${totalPhonePe.toLocaleString('en-IN')}`],
        ['Fleet Card', `Rs ${totalFleetCard.toLocaleString('en-IN')}`],
        ['Total Collection', `Rs ${totalCollection.toLocaleString('en-IN')}`],
      ],
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
        ? (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable!.finalY + 12
        : 200,
      theme: 'grid',
      styles: { fontSize: 8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, cellPadding: 3 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      head: [['Employee', 'Shift', 'Speed (L)', 'MS (L)', 'HSD (L)', 'Cash', 'PhonePe', 'Fleet', 'Shift Total']],
      body: currentData.map((shift) => {
        const shiftTotal = shift.cash + shift.phonePe + shift.fleetCard;
        return [
          shift.employee || 'Unknown',
          shift.shift,
          shift.speed.toFixed(2),
          shift.ms.toFixed(2),
          shift.hsd.toFixed(2),
          `Rs ${shift.cash.toLocaleString('en-IN')}`,
          `Rs ${shift.phonePe.toLocaleString('en-IN')}`,
          `Rs ${shift.fleetCard.toLocaleString('en-IN')}`,
          `Rs ${shiftTotal.toLocaleString('en-IN')}`,
        ];
      }),
    });

    doc.save(fileName);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500 print:max-w-none print:space-y-2 print:pb-0 print:bg-white print:text-black print:text-[11px]">
      
      {/* Header section (Hidden in print) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Day End Report</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Shift-wise sales summary and employee data.
          </p>
        </div>
        <button 
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20 active:scale-95 w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block text-center mb-2 border-b border-black pb-2">
        <h1 className="text-base font-bold text-black uppercase tracking-wide">Day End Sales Report</h1>
        <p className="text-[11px] text-black mt-1 font-medium">Date: {reportDate} | Bunk No: {bunkNumber}</p>
      </div>

      {/* Controls Section (Hidden entirely in print, OR maybe keep values visible but not inputs? Custom print styling applied) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4 print:shadow-none print:border-none print:p-0 print:mb-2">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 print:hidden">
          Configuration
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5 print:hidden">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Select Bunk
            </label>
            <select 
              value={selectedBunk}
              onChange={(e) => setSelectedBunk(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {BUNKS.map(bunk => (
                <option key={bunk} value={bunk}>{bunk}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-400" /> Daily Testing Subtraction (Liters)
            </label>
            <div className="relative print:hidden">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">L</span>
              <input 
                type="number"
                value={testingValue}
                onChange={(e) => setTestingValue(e.target.value)}
                placeholder="0.00"
                className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all text-rose-700 dark:text-rose-400 font-bold"
              />
            </div>
            <div className="hidden print:block text-[11px] font-semibold text-black">
              Testing Liters Deducted: {testingNum.toFixed(2)} L
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-1">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-5 border border-blue-100 dark:border-blue-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2 print:text-black print:mb-1">
            <Fuel className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">Net Liters</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">{netTotalLiters.toFixed(2)} L</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">Gross: {grossTotalLiters.toFixed(2)} L</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 print:text-black print:mb-1">
            <Banknote className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">Total Cash</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalCash/1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalCash.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2 print:text-black print:mb-1">
            <Zap className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">PhonePe</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalPhonePe/1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalPhonePe.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2 print:text-black print:mb-1">
            <CreditCard className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">Fleet Card</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalFleetCard/1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalFleetCard.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-4 print:pt-1 print:px-0">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 print:text-sm print:text-black">
          <History className="w-5 h-5 text-blue-500 print:hidden" />
          Shift-wise Breakdown
        </h3>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full print:hidden">
          Total Collection: ₹{totalCollection.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Shift Employee Data Cards */}
      <div className="space-y-4 print:space-y-2 print:mt-1">
        {currentData.map((shift, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:break-inside-avoid print:border-black print:shadow-none print:rounded-none">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:bg-white print:border-black print:py-1.5 print:px-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold print:bg-white print:text-black print:border print:border-black print:w-5 print:h-5 print:text-[10px] print:rounded-sm">
                  {shift.shift}
                </span>
                <span className="font-bold text-lg text-slate-900 dark:text-white print:text-[11px] print:text-black">{shift.employee}</span>
              </div>
              <div className="text-sm font-semibold text-slate-500 print:text-[10px] print:text-black">
                Shift Total: ₹{(shift.cash + shift.phonePe + shift.fleetCard).toLocaleString('en-IN')}
              </div>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:p-2 print:gap-2">
              {/* Sales Column */}
              <div className="space-y-3 print:space-y-1">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 print:border-black print:text-black print:pb-1 print:text-[10px]">
                  Fuel Sales (Liters)
                </h4>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Speed</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">{shift.speed.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">MS</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">{shift.ms.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">HSD</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">{shift.hsd.toFixed(2)} L</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800 print:border-black print:pt-1 print:text-[10px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Total</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 print:text-black">{(shift.speed + shift.ms + shift.hsd).toFixed(2)} L</span>
                </div>
              </div>

              {/* Collections Column */}
              <div className="space-y-3 print:space-y-1">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 print:border-black print:text-black print:pb-1 print:text-[10px]">
                  Collections (INR)
                </h4>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Cash</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{shift.cash.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">PhonePe</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{shift.phonePe.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm print:text-[10px]">
                  <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Fleet Card</span>
                  <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{shift.fleetCard.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800 print:border-black print:pt-1 print:text-[10px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Total</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">₹{(shift.cash + shift.phonePe + shift.fleetCard).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
