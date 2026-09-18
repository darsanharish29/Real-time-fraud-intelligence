import React, { useState, useEffect } from 'react';
import { Activity, Play, Pause, PlusCircle, AlertTriangle, ShieldCheck, ChevronRight, RefreshCw, X } from 'lucide-react';
import { api } from '../lib/api';
import { Transaction } from '../types';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Simulation form
  const [simForm, setSimForm] = useState({
    accountNumber: 'DEMO-ACC-2048',
    amount: '125000',
    location: 'International-Proxy',
    deviceId: 'DEV-ANOMALY-ROOTED-88',
    channel: 'UPI',
    hasFailedLogins: true,
  });

  const fetchTransactions = async () => {
    try {
      const res = await api.getTransactions(undefined, 60);
      if (res.success) {
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Periodic simulation timer
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(async () => {
      // Procedurally generate light simulation activity
      const isBurst = Math.random() > 0.65;
      const acc = isBurst ? 'DEMO-ACC-2048' : `DEMO10000${Math.floor(Math.random() * 3) + 1}`;
      const amt = isBurst ? Math.floor(45000 + Math.random() * 80000) : Math.floor(800 + Math.random() * 4000);
      const cities = ['Mumbai, MH', 'Delhi, DL', 'Bengaluru, KA', 'Hyderabad, TS', 'International-Proxy'];
      const loc = isBurst ? 'International-Proxy' : cities[Math.floor(Math.random() * (cities.length - 1))];

      try {
        const res = await api.simulateTransaction({
          accountNumber: acc,
          amount: amt,
          location: loc,
          deviceId: isBurst ? 'DEV-ANOMALY-ROOTED-88' : 'DEV-CLIENT-ANDROID-14',
          channel: 'UPI',
          hasFailedLogins: isBurst
        });
        if (res.success) {
          setTransactions(prev => [res.data.transaction, ...prev.slice(0, 59)]);
        }
      } catch (err) {
        console.error('Auto-simulation tick error:', err);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const handleManualSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.simulateTransaction({
        accountNumber: simForm.accountNumber,
        amount: Number(simForm.amount),
        location: simForm.location,
        deviceId: simForm.deviceId,
        channel: simForm.channel,
        hasFailedLogins: simForm.hasFailedLogins,
      });

      if (res.success) {
        setTransactions(prev => [res.data.transaction, ...prev]);
        setSelectedTxn(res.data.transaction);
        setIsSimModalOpen(false);
      }
    } catch (err) {
      console.error('Manual simulation error:', err);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'HIGH':
        return 'bg-orange-950 text-orange-300 border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Live Transaction Monitoring &amp; Telemetry
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time heuristic evaluation, behavioral anomaly scores, device fingerprinting &amp; velocity alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
              isLiveStreaming
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                : 'bg-zinc-850 text-zinc-400 border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Pause className="w-3.5 h-3.5" />
                <span>Streaming Live</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Stream Paused</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSimModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Simulate Custom Txn
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Area */}
        <div className={`transition-all ${selectedTxn ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3 font-semibold">Transaction ID</th>
                    <th className="py-3 px-3 font-semibold">Account</th>
                    <th className="py-3 px-3 font-semibold">Amount</th>
                    <th className="py-3 px-3 font-semibold">Location</th>
                    <th className="py-3 px-3 font-semibold">Timestamp</th>
                    <th className="py-3 px-3 font-semibold">Device</th>
                    <th className="py-3 px-3 font-semibold">Risk Score</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850 font-mono">
                  {transactions.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTxn(t)}
                      className={`hover:bg-[#181818] cursor-pointer transition-colors ${
                        selectedTxn?.id === t.id ? 'bg-[#181818] border-l-2 border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-emerald-400">{t.transactionRef}</td>
                      <td className="py-2.5 px-3 text-zinc-300">{t.accountNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-100">₹{t.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-zinc-400 font-sans">{t.location}</td>
                      <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3 text-zinc-400 text-[11px] truncate max-w-[120px]">{t.deviceId}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskColor(t.riskLevel)}`}>
                          {t.riskScore} &bull; {t.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          t.status === 'FLAGGED' ? 'bg-red-950 text-red-300' :
                          t.status === 'UNDER_REVIEW' ? 'bg-amber-950 text-amber-300' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Explainable Risk Details Drawer */}
        {selectedTxn && (
          <div className="lg:col-span-4 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  Explainable Risk Analysis
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {selectedTxn.transactionRef}
                </div>
              </div>

              <button
                onClick={() => setSelectedTxn(null)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Pill */}
            <div className={`p-3 rounded-lg border flex items-center justify-between ${getRiskColor(selectedTxn.riskLevel)}`}>
              <div>
                <div className="text-[10px] font-semibold uppercase">Fraud Probability Score</div>
                <div className="text-2xl font-bold font-mono">{selectedTxn.riskScore} / 100</div>
              </div>
              <div className="text-right font-bold text-xs font-mono">{selectedTxn.riskLevel}</div>
            </div>

            {/* Transaction Parameters */}
            <div className="p-3 rounded-lg bg-[#161616] border border-zinc-800 text-xs space-y-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Account Number:</span>
                <span className="font-mono text-zinc-200 font-semibold">{selectedTxn.accountNumber}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Transfer Amount:</span>
                <span className="font-mono text-emerald-400 font-bold">₹{selectedTxn.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Payment Channel:</span>
                <span className="font-mono text-zinc-200">{selectedTxn.channel}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>IP / Origin:</span>
                <span className="font-mono text-zinc-300">{selectedTxn.ipAddress} ({selectedTxn.location})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Device Signature:</span>
                <span className="font-mono text-zinc-300 truncate max-w-[160px]">{selectedTxn.deviceId}</span>
              </div>
            </div>

            {/* Explainable Reasons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Contributing Risk Factors
              </div>
              <div className="space-y-1.5">
                {selectedTxn.riskFactors?.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#181818] border border-zinc-800 text-xs text-zinc-300 flex items-start gap-2"
                  >
                    <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                    <span className="text-[11px] leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-3 rounded-lg bg-[#0d1410] border border-emerald-900/60 text-xs space-y-1">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Automated Recommendation</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-tight">
                {selectedTxn.riskScore >= 80
                  ? 'Urgent investigation advised. Cross-reference with repeated account watchlist and consider recommend freeze review.'
                  : selectedTxn.riskScore >= 60
                  ? 'Flag for investigator review. High anomaly factors detected on client origin.'
                  : 'Maintain background transaction telemetry.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Manual Simulation Modal */}
      {isSimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-100 uppercase">
                Simulate Real-Time Fraud Trigger
              </h3>
              <button onClick={() => setIsSimModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSimulate} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold">Target Account Number</label>
                <input
                  type="text"
                  value={simForm.accountNumber}
                  onChange={(e) => setSimForm({ ...simForm, accountNumber: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Transfer Amount (₹)</label>
                <input
                  type="number"
                  value={simForm.amount}
                  onChange={(e) => setSimForm({ ...simForm, amount: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Location</label>
                <select
                  value={simForm.location}
                  onChange={(e) => setSimForm({ ...simForm, location: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-100"
                >
                  <option value="International-Proxy">International-Proxy (TOR Relay)</option>
                  <option value="Border-Cluster">Border-Cluster (High Risk)</option>
                  <option value="Mumbai, MH">Mumbai, MH (Normal)</option>
                  <option value="Delhi, DL">Delhi, DL (Normal)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Hardware Fingerprint</label>
                <input
                  type="text"
                  value={simForm.deviceId}
                  onChange={(e) => setSimForm({ ...simForm, deviceId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="failedAuth"
                  checked={simForm.hasFailedLogins}
                  onChange={(e) => setSimForm({ ...simForm, hasFailedLogins: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-emerald-600"
                />
                <label htmlFor="failedAuth" className="text-zinc-400 cursor-pointer">
                  Preceded by multiple failed authentication attempts
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSimModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Evaluate &amp; Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
