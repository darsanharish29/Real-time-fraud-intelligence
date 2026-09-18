import React, { useState } from 'react';
import { Sliders, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export default function RiskSimulatorPage() {
  const [params, setParams] = useState({
    accountNumber: 'DEMO-ACC-2048',
    amount: 145000,
    location: 'International-Proxy',
    deviceId: 'DEV-ROOTED-88',
    channel: 'UPI',
    hasFailedLogins: true,
    historicalBaseline: 12000,
    timeSinceLastTxnMinutes: 3,
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.simulateTransaction(params);
      if (res.success) {
        setResult(res.data.transaction);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level: string) => {
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
      <div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          Fraud Risk Engine Simulator &amp; Sandbox
        </h2>
        <p className="text-xs text-zinc-400">
          Adjust behavioral attributes, geographic vectors and transaction weights to evaluate rule execution logic
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Controls */}
        <div className="lg:col-span-6 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
            Simulation Scenario Parameters
          </h3>

          <form onSubmit={handleSimulate} className="space-y-4 text-xs">
            <div>
              <label className="text-zinc-300 font-semibold">Target Account</label>
              <input
                type="text"
                value={params.accountNumber}
                onChange={(e) => setParams({ ...params, accountNumber: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-0.5">Use DEMO-ACC-2048 to trigger repeated account syndicate rules</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-300 font-semibold">Transaction Amount (₹)</label>
                <input
                  type="number"
                  value={params.amount}
                  onChange={(e) => setParams({ ...params, amount: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Historical Baseline (₹)</label>
                <input
                  type="number"
                  value={params.historicalBaseline}
                  onChange={(e) => setParams({ ...params, historicalBaseline: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-300 font-semibold">Geo Origin / Tunnel</label>
                <select
                  value={params.location}
                  onChange={(e) => setParams({ ...params, location: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200"
                >
                  <option value="International-Proxy">International-Proxy (TOR)</option>
                  <option value="Border-Cluster">Border-Cluster (High Risk)</option>
                  <option value="Mumbai, MH">Mumbai, MH (Normal)</option>
                  <option value="Bengaluru, KA">Bengaluru, KA (Normal)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Channel</label>
                <select
                  value={params.channel}
                  onChange={(e) => setParams({ ...params, channel: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200"
                >
                  <option value="UPI">UPI Payment</option>
                  <option value="IMPS">IMPS Instant</option>
                  <option value="NEFT">NEFT Batch</option>
                  <option value="RTGS">RTGS High-Value</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-zinc-300 font-semibold">Hardware Signature</label>
              <input
                type="text"
                value={params.deviceId}
                onChange={(e) => setParams({ ...params, deviceId: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-zinc-200 font-mono"
              />
              <p className="text-[10px] text-zinc-500 mt-0.5">Use string containing "ROOTED" or "EMULATOR" to test hardware integrity checks</p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="failedSim"
                checked={params.hasFailedLogins}
                onChange={(e) => setParams({ ...params, hasFailedLogins: e.target.checked })}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-600"
              />
              <label htmlFor="failedSim" className="text-zinc-300 cursor-pointer text-xs">
                Simulate multiple failed password/OTP attempts prior to transaction
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Evaluating Rules...' : 'Execute Risk Scoring Simulation'}
            </button>
          </form>
        </div>

        {/* Real-Time Calculation Result */}
        <div className="lg:col-span-6 space-y-4">
          {result ? (
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Simulation Output
                  </div>
                  <div className="font-mono text-base font-bold text-emerald-400">
                    {result.transactionRef}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded border text-xs font-mono font-bold ${getRiskBadge(result.riskLevel)}`}>
                  {result.riskLevel}
                </span>
              </div>

              {/* Big Score Card */}
              <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="text-zinc-400 text-xs">Composite Heuristic Score:</div>
                  <div className="text-3xl font-bold font-mono text-zinc-100 mt-1">
                    {result.riskScore} <span className="text-xs text-zinc-500 font-sans">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-zinc-400 text-xs">Recommended Action:</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    {result.riskScore >= 80 ? 'Recommend Freeze' :
                     result.riskScore >= 60 ? 'Escalate to Review' :
                     result.riskScore >= 30 ? 'Step-up MFA Auth' : 'Allow Transaction'}
                  </div>
                </div>
              </div>

              {/* Explanations & Contributing Factors */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Triggered Factor Explanations &amp; Breakdown:
                </div>
                <div className="space-y-2 text-xs">
                  {result.riskFactors?.map((factor: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#181818] border border-zinc-800 text-zinc-300 flex items-start gap-2.5"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance disclaimer */}
              <div className="p-3 rounded-lg bg-[#0e1611] border border-emerald-900/60 text-[11px] text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Safety Enforcement: High scores trigger investigator review tickets. In accordance with zero-trust safety rules, accounts are never locked automatically without human authorization.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-12 text-center text-xs text-zinc-500 shadow-xl space-y-2">
              <Sliders className="w-8 h-8 text-zinc-700 mx-auto" />
              <p>Configure parameters on the left and click "Execute Risk Scoring Simulation" to view the mathematical breakdown.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
