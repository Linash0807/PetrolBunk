import { useState } from 'react';
import { MapPin, Printer, Fuel, CreditCard, Banknote, History, Zap, Pencil, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ShiftEntry, DailyEntry } from '../types';

const BUNKS = ['All', 'Bunk 1', 'Bunk 2', 'Bunk 3', 'Bunk 4', 'Bunk 5', 'Bunk 6', 'Bunk 7'];

interface ReportsProps {
  entries: ShiftEntry[];
  dailyEntries?: DailyEntry[];
  onEditEntry?: (entry: ShiftEntry) => void;
  onDeleteEntry?: (id: string) => void;
  onEditDailyEntry?: (entry: DailyEntry) => void;
  onDeleteDailyEntry?: (id: string) => void;
  onNavigateTo24Hrs?: (date?: string) => void;
}

export function Reports({
  entries,
  dailyEntries = [],
  onEditEntry,
  onDeleteEntry,
  onEditDailyEntry,
  onDeleteDailyEntry,
  onNavigateTo24Hrs
}: ReportsProps) {
  const [selectedBunk, setSelectedBunk] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const [show24Hrs, setShow24Hrs] = useState(false);
  const [reportType, setReportType] = useState<'shift' | 'daily'>('shift');

  const todayDate = new Date();
  const localToday = new Date(todayDate.getTime() - todayDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  const yesterdayDate = new Date(todayDate.getTime() - 24 * 60 * 60 * 1000);
  const localYesterday = new Date(yesterdayDate.getTime() - yesterdayDate.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];

  let activeDate = localToday;
  if (dateFilter === 'yesterday') activeDate = localYesterday;
  if (dateFilter === 'custom') activeDate = customDate;

  const activeDailyEntry = dailyEntries.find(e => {
    if (!e.date) return false;
    return e.date.split('T')[0] === activeDate.split('T')[0];
  });

  const bunkEntries = selectedBunk === 'All' ? entries : entries.filter(e => e.bunk === selectedBunk);

  const reportDateISO = activeDate;
  const reportDate = reportDateISO ? new Date(reportDateISO).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
  const bunkNumber = selectedBunk === 'All' ? 'All' : selectedBunk.replace(/\D+/g, '') || selectedBunk;

  const currentData = dateFilter === 'custom' && !customDate
    ? []
    : bunkEntries.filter(e => {
      if (!e.date) return false;
      return e.date.split('T')[0] === activeDate.split('T')[0];
    });

  // Calculate Totals based on reportType
  const totalSpeed = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.speed, 0)
    : (activeDailyEntry ? activeDailyEntry.speed : 0);

  const totalMS = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.ms, 0)
    : (activeDailyEntry ? activeDailyEntry.ms : 0);

  const totalHSD = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.hsd, 0)
    : (activeDailyEntry ? activeDailyEntry.hsd : 0);

  const grossTotalLiters = totalSpeed + totalMS + totalHSD;
  const netTotalLiters = grossTotalLiters;

  const totalCash = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.cash, 0)
    : (activeDailyEntry ? activeDailyEntry.cash : 0);

  const totalPhonePe = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.phonePe, 0)
    : (activeDailyEntry ? activeDailyEntry.phonePe : 0);

  const totalFleetCard = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + curr.fleetCard, 0)
    : (activeDailyEntry ? activeDailyEntry.fleetCard : 0);

  const totalLubricant = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + (curr.lubricant || 0), 0)
    : (activeDailyEntry ? (activeDailyEntry.lubricant || 0) : 0);

  const totalExpense = reportType === 'shift'
    ? currentData.reduce((acc, curr) => acc + (curr.expense || 0), 0)
    : (activeDailyEntry ? (activeDailyEntry.expense || 0) : 0);
/* gurthu petuko ra
*/ 
  const totalCollection = totalCash + totalPhonePe + totalFleetCard + totalLubricant + totalExpense;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const fileDate = reportDateISO || new Date().toISOString().split('T')[0];

    if (reportType === 'daily') {
      if (!activeDailyEntry) {
        alert('No daily entry data available for this date to generate PDF.');
        return;
      }
      const fileName = `daily-report-${fileDate}.pdf`;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('24 HRS BUNK DAILY SALES REPORT', 40, 40);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Date: ${reportDate}`, 40, 58);

      autoTable(doc, {
        startY: 72,
        theme: 'grid',
        styles: { fontSize: 9, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, cellPadding: 4 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
        body: [
          ['Total MS sold', `${totalMS.toFixed(2)} L`],
          ['Total HSD sold', `${totalHSD.toFixed(2)} L`],
          ['Total Speed sold', `${totalSpeed.toFixed(2)} L`],
          ['Total Liters sold', `${netTotalLiters.toFixed(2)} L`],
          ['Total Cash Collection', `Rs ${totalCash.toLocaleString('en-IN')}`],
          ['PhonePe Collection', `Rs ${totalPhonePe.toLocaleString('en-IN')}`],
          ['Fleet Card Collection', `Rs ${totalFleetCard.toLocaleString('en-IN')}`],
          ['Lubricant Collection', `Rs ${totalLubricant.toLocaleString('en-IN')}`],
          ['Expenses', `Rs ${totalExpense.toLocaleString('en-IN')}`],
          ['Total Collection', `Rs ${totalCollection.toLocaleString('en-IN')}`],
        ],
      });

      if (activeDailyEntry.nozzleReadings && activeDailyEntry.nozzleReadings.length > 0) {
        autoTable(doc, {
          startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 15 : 240,
          theme: 'grid',
          styles: { fontSize: 8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.5, cellPadding: 3 },
          headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
          head: [['Nozzle', 'OMR', 'CMR', 'Testing', 'Net Sales (L)']],
          body: activeDailyEntry.nozzleReadings.map((nozzle) => [
            nozzle.nozzleName,
            nozzle.omr.toString(),
            nozzle.cmr.toString(),
            nozzle.testing.toString(),
            `${nozzle.writtenNet.toFixed(2)} L`
          ])
        });
      }

      doc.save(fileName);
      return;
    }

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
        ['Total Speed', `${totalSpeed.toFixed(2)} L`],
        ['Total MS', `${totalMS.toFixed(2)} L`],
        ['Total HSD', `${totalHSD.toFixed(2)} L`],
        ['Total Cash', `Rs ${totalCash.toLocaleString('en-IN')}`],
        ['PhonePe', `Rs ${totalPhonePe.toLocaleString('en-IN')}`],
        ['Fleet Card', `Rs ${totalFleetCard.toLocaleString('en-IN')}`],
        ['Lubricant', `Rs ${totalLubricant.toLocaleString('en-IN')}`],
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
      head: [['Employee', 'Shift', 'Pump', 'Speed (L)', 'MS (L)', 'HSD (L)', 'Cash', 'PhonePe', 'Fleet', 'Lubricant', 'Shift Total']],
      body: currentData.map((shift) => {
        const shiftTotal = shift.cash + shift.phonePe + shift.fleetCard + (shift.lubricant || 0);
        return [
          shift.employee || 'Unknown',
          `Shift ${shift.shift}`,
          `Pump ${shift.pump || '-'}`,
          shift.speed.toFixed(2),
          shift.ms.toFixed(2),
          shift.hsd.toFixed(2),
          `Rs ${shift.cash.toLocaleString('en-IN')}`,
          `Rs ${shift.phonePe.toLocaleString('en-IN')}`,
          `Rs ${shift.fleetCard.toLocaleString('en-IN')}`,
          `Rs ${(shift.lubricant || 0).toLocaleString('en-IN')}`,
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
            {reportType === 'shift'
              ? 'Shift-wise sales summary and employee data.'
              : '24 Hrs daily bunk reports summary and meter readings.'}
          </p>
        </div>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20 active:scale-95 w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Report Type Toggle (Tabs) */}
      <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1.5 rounded-2xl w-full sm:w-fit print:hidden border border-slate-200/50 dark:border-slate-850/30">
        <button
          onClick={() => setReportType('shift')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${reportType === 'shift'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          Shift Entries
        </button>
        <button
          onClick={() => setReportType('daily')}
          className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${reportType === 'daily'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
        >
          Daily Bunk (24h) Reports
        </button>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block text-center mb-2 border-b border-black pb-2">
        <h1 className="text-base font-bold text-black uppercase tracking-wide">
          {reportType === 'shift' ? 'Day End Sales Report' : '24 Hrs Bunk Daily Sales Report'}
        </h1>
        <p className="text-[11px] text-black mt-1 font-medium">Date: {reportDate} {reportType === 'shift' && `| Bunk No: ${bunkNumber}`}</p>
      </div>

      {/* Controls Section (Hidden entirely in print) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-4 print:shadow-none print:border-none print:p-0 print:mb-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-2 print:hidden gap-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Configuration
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {reportType === 'shift' && (
            <div className="flex-1 space-y-1.5 print:hidden">
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
          )}

          <div className="flex-1 space-y-1.5 print:hidden">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" /> Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value as any);
                if (e.target.value !== 'custom') setCustomDate('');
              }}
              className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium"
            >
              <option value="today">Today ({new Date(localToday).toLocaleDateString('en-GB')})</option>
              <option value="yesterday">Yesterday ({new Date(localYesterday).toLocaleDateString('en-GB')})</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>

          {dateFilter === 'custom' && (
            <div className="flex-1 space-y-1.5 print:hidden animate-in fade-in zoom-in-95 duration-200">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" /> Select Date
              </label>
              <input
                type="date"
                value={customDate}
                max={localToday}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          )}
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
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalCash / 1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalCash.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20 rounded-2xl p-5 border border-purple-100 dark:border-purple-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2 print:text-black print:mb-1">
            <Zap className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">PhonePe</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalPhonePe / 1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalPhonePe.toLocaleString('en-IN')}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-100 dark:border-amber-800/50 print:break-inside-avoid print:bg-white print:border-black print:p-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2 print:text-black print:mb-1">
            <CreditCard className="w-5 h-5 print:hidden" />
            <span className="text-sm font-bold uppercase tracking-wider print:text-[10px]">Fleet Card</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white print:text-sm print:text-black">₹{(totalFleetCard / 1000).toFixed(1)}k</div>
          <div className="text-xs text-slate-500 mt-1 print:text-[10px] print:text-black print:mt-0.5">₹{totalFleetCard.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {reportType === 'shift' ? (
        <>
          <div className="flex items-center justify-between px-2 pt-4 print:pt-1 print:px-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 print:text-sm print:text-black">
              <History className="w-5 h-5 text-blue-500 print:hidden" />
              {show24Hrs ? '24 Hrs Bunk Report Details' : 'Shift-wise Breakdown'}
            </h3>
            <div className="flex items-center gap-3 print:hidden">
              {activeDailyEntry && (
                <button
                  onClick={() => setShow24Hrs(!show24Hrs)}
                  className="text-sm font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-3 py-1.5 rounded-lg transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-800/50"
                >
                  {show24Hrs ? 'Show Shift Entries' : 'View 24 Hrs Report'}
                </button>
              )}
              {!show24Hrs && (
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  Total Collection: ₹{totalCollection.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {show24Hrs && activeDailyEntry ? (
            <div className="space-y-4 print:space-y-2 print:mt-1 animate-in fade-in duration-300">
              {activeDailyEntry.nozzleReadings && activeDailyEntry.nozzleReadings.length > 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-black print:shadow-none print:rounded-none">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:bg-white print:border-black print:py-1.5 print:px-2">
                    <span className="font-bold text-lg text-slate-900 dark:text-white print:text-[11px] print:text-black">All Nozzles Report</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-3 print:p-2 print:gap-2">
                    {activeDailyEntry.nozzleReadings.map((nozzle, idx) => {
                      if (nozzle.cmr === 0 && nozzle.omr === 0) return null;
                      return (
                        <div key={idx} className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-1 print:border-black print:text-black">{nozzle.nozzleName}</h4>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">OMR</span><span className="font-medium">{nozzle.omr}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">CMR</span><span className="font-medium">{nozzle.cmr}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Testing</span><span className="font-medium">{nozzle.testing}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-slate-500">Net Sales</span><span className="font-bold text-blue-600">{nozzle.writtenNet} L</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-slate-500">No nozzle data available for this report.</div>
              )}
            </div>
          ) : (
            <div className="space-y-4 print:space-y-2 print:mt-1 animate-in fade-in duration-300">
              {currentData.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
                  No shift entries logged for {reportDate}.
                </div>
              ) : (
                currentData.map((shift, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:break-inside-avoid print:border-black print:shadow-none print:rounded-none">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:bg-white print:border-black print:py-1.5 print:px-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold print:bg-white print:text-black print:border print:border-black print:w-5 print:h-5 print:text-[10px] print:rounded-sm">
                          {`S${shift.shift}`}
                        </span>
                        <span className="font-bold text-lg text-slate-900 dark:text-white print:text-[11px] print:text-black">{shift.employee} {shift.pump ? `(Pump ${shift.pump})` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-500 print:text-[10px] print:text-black mr-2">
                          Shift Total: ₹{(shift.cash + shift.phonePe + shift.fleetCard + (shift.lubricant || 0)).toLocaleString('en-IN')}
                        </div>
                        {onEditEntry && (
                          <button
                            onClick={() => onEditEntry(shift)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors print:hidden"
                            title="Edit Entry"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteEntry && shift._id && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this shift entry? This action cannot be undone.')) {
                                onDeleteEntry(shift._id!);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors print:hidden"
                            title="Delete Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
                        {(shift.lubricant || 0) > 0 && (
                          <div className="flex justify-between items-center text-sm print:text-[10px]">
                            <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Lubricant</span>
                            <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{shift.lubricant.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800 print:border-black print:pt-1 print:text-[10px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Total</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">₹{(shift.cash + shift.phonePe + shift.fleetCard + (shift.lubricant || 0)).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4 print:space-y-2 print:mt-1 animate-in fade-in duration-300">
          {activeDailyEntry ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden print:border-black print:shadow-none print:rounded-none">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:bg-white print:border-black print:py-1.5 print:px-2">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-bold print:bg-white print:text-black print:border print:border-black print:w-5 print:h-5 print:text-[10px] print:rounded-sm">
                    24H
                  </span>
                  <span className="font-bold text-lg text-slate-900 dark:text-white print:text-[11px] print:text-black">
                    24 Hrs Bunk Report for {new Date(activeDailyEntry.date).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onEditDailyEntry && (
                    <button
                      onClick={() => onEditDailyEntry(activeDailyEntry)}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all print:hidden flex items-center gap-1.5 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
                      title="Edit Daily Report"
                    >
                      <Pencil className="w-4 h-4" /> Edit Report
                    </button>
                  )}
                  {onDeleteDailyEntry && activeDailyEntry._id && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this 24 Hrs Report? This action cannot be undone.')) {
                          onDeleteDailyEntry(activeDailyEntry._id!);
                        }
                      }}
                      className="p-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all print:hidden flex items-center gap-1.5 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
                      title="Delete Daily Report"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Report
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 print:p-2 print:gap-2">
                <div className="space-y-6">
                  {/* Fuel Sales Summary */}
                  <div className="space-y-3 print:space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 print:border-black print:text-black print:pb-1 print:text-[10px]">
                      Fuel Sales (Liters)
                    </h4>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">MS Sales</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">{activeDailyEntry.ms.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">HSD Sales</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">{activeDailyEntry.hsd.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Speed Sales</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">{activeDailyEntry.speed.toFixed(2)} L</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800 print:border-black print:pt-1 print:text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Total Liters</span>
                      <span className="font-bold text-blue-600 dark:text-blue-450 print:text-black">{(activeDailyEntry.ms + activeDailyEntry.hsd + activeDailyEntry.speed).toFixed(2)} L</span>
                    </div>
                  </div>

                  {/* Collections Summary */}
                  <div className="space-y-3 print:space-y-1">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 print:border-black print:text-black print:pb-1 print:text-[10px]">
                      Collections Breakdown (INR)
                    </h4>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Cash</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{activeDailyEntry.cash.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">PhonePe</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{activeDailyEntry.phonePe.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm print:text-[10px]">
                      <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Fleet Card</span>
                      <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{activeDailyEntry.fleetCard.toLocaleString('en-IN')}</span>
                    </div>
                    {(activeDailyEntry.lubricant || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm print:text-[10px]">
                        <span className="font-medium text-slate-600 dark:text-slate-300 print:text-black">Lubricant</span>
                        <span className="font-semibold text-slate-900 dark:text-white print:text-black">₹{(activeDailyEntry.lubricant || 0).toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {(activeDailyEntry.expense || 0) > 0 && (
                      <div className="flex justify-between items-center text-sm print:text-[10px]">
                        <span className="font-medium text-rose-600 dark:text-rose-450 print:text-black">Expense Deduction</span>
                        <span className="font-semibold text-rose-650 dark:text-rose-400 print:text-black">- ₹{activeDailyEntry.expense.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100 dark:border-slate-800 print:border-black print:pt-1 print:text-[10px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 print:text-black">Net Collection</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-black">₹{totalCollection.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Nozzles Readings */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 print:border-black print:text-black print:pb-1 print:text-[10px]">
                    Nozzle Meter Readings (OMR / CMR)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                    {activeDailyEntry.nozzleReadings.map((nozzle, idx) => {
                      if (nozzle.cmr === 0 && nozzle.omr === 0) return null;
                      return (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-250 dark:border-slate-850 space-y-1 text-xs">
                          <div className="font-bold text-slate-850 dark:text-slate-150 border-b border-slate-200/50 dark:border-slate-800 pb-1 mb-1">{nozzle.nozzleName}</div>
                          <div className="flex justify-between"><span className="text-slate-450">OMR:</span><span className="font-medium">{nozzle.omr}</span></div>
                          <div className="flex justify-between"><span className="text-slate-450">CMR:</span><span className="font-medium">{nozzle.cmr}</span></div>
                          {nozzle.testing > 0 && <div className="flex justify-between"><span className="text-slate-450">Test:</span><span className="font-medium">{nozzle.testing} L</span></div>}
                          <div className="flex justify-between border-t border-slate-200/30 dark:border-slate-800/30 pt-1 mt-1 font-bold"><span className="text-slate-500">Net:</span><span className="text-blue-600 dark:text-blue-400">{nozzle.writtenNet} L</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-center">
                <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full">
                  <History className="w-8 h-8" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No 24 Hrs Bunk Report</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  There is no 24 Hrs report recorded for {reportDate}.
                </p>
              </div>
              {onNavigateTo24Hrs && (
                <button
                  onClick={() => onNavigateTo24Hrs(activeDate)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-600/20 active:scale-95"
                >
                  Create 24 Hrs Report
                </button>
              )}
            </div>
          )}

          {/* History List of Daily Bunk Reports */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mt-6 print:hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-lg text-slate-900 dark:text-white">24 Hrs Reports History</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                Total: {dailyEntries.length} records
              </span>
            </div>

            {dailyEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No 24 Hrs reports recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/20 text-slate-500 dark:text-slate-450 text-xs font-bold uppercase tracking-wider">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">MS (L)</th>
                      <th className="px-5 py-3">HSD (L)</th>
                      <th className="px-5 py-3">Speed (L)</th>
                      <th className="px-5 py-3 text-right">Cash</th>
                      <th className="px-5 py-3 text-right">PhonePe</th>
                      <th className="px-5 py-3 text-right">Fleet</th>
                      <th className="px-5 py-3 text-right">Lubes</th>
                      <th className="px-5 py-3 text-right text-rose-600 dark:text-rose-400">Expense</th>
                      <th className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400">Net Collection</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {dailyEntries.map((entry) => {
                      const entryDate = new Date(entry.date).toLocaleDateString('en-GB');
                      const entryNetCollection = (entry.cash || 0) + (entry.phonePe || 0) + (entry.fleetCard || 0) + (entry.lubricant || 0) - (entry.expense || 0);

                      return (
                        <tr
                          key={entry._id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all ${activeDate.split('T')[0] === entry.date.split('T')[0] ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                            }`}
                        >
                          <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                            <button
                              onClick={() => {
                                setDateFilter('custom');
                                setCustomDate(entry.date.split('T')[0]);
                              }}
                              className="hover:underline text-blue-600 dark:text-blue-400 hover:text-blue-700 text-left font-bold"
                            >
                              {entryDate}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-350 font-medium">{(entry.ms || 0).toFixed(2)}</td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-350 font-medium">{(entry.hsd || 0).toFixed(2)}</td>
                          <td className="px-5 py-3 text-slate-600 dark:text-slate-350 font-medium">{(entry.speed || 0).toFixed(2)}</td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-350 font-medium">₹{entry.cash.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-350 font-medium">₹{entry.phonePe.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-350 font-medium">₹{entry.fleetCard.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-slate-600 dark:text-slate-350 font-medium">₹{(entry.lubricant || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-rose-600 dark:text-rose-400 font-bold">-₹{(entry.expense || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">₹{entryNetCollection.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {onEditDailyEntry && (
                                <button
                                  onClick={() => onEditDailyEntry(entry)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit Report"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteDailyEntry && entry._id && (
                                <button
                                  onClick={() => {
                                    onDeleteDailyEntry(entry._id!);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                                  title="Delete Report"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
