import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Sliders, Activity, Server, FileText, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

export default function AdminDashboard() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'AUDIT' | 'USERS' | 'RULES'>('AUDIT');

  // Rule settings state
  const [rules, setRules] = useState({
    criticalThreshold: 80,
    highThreshold: 60,
    mediumThreshold: 30,
    autoAlertVelocity: true,
    torExitNodeBlock: true,
    requireSeniorApprovalForFreeze: true,
  });
  const [ruleSavedNotice, setRuleSavedNotice] = useState(false);

  useEffect(() => {
    api.getAuditLogs().then(res => {
      if (res.success) setAuditLogs(res.data);
    });

    // Mock active system users for demo
    setUsers([
      { id: 'usr-1', name: 'Vikram Aditya (Lead)', account: 'DEMO200001', role: 'INVESTIGATOR', status: 'ACTIVE', lastLogin: '10 mins ago' },
      { id: 'usr-2', name: 'Dr. Ananya Roy (Senior)', account: 'DEMO300001', role: 'SENIOR_INVESTIGATOR', status: 'ACTIVE', lastLogin: '1 hour ago' },
      { id: 'usr-3', name: 'System Root Admin', account: 'DEMO900001', role: 'ADMIN', status: 'ACTIVE', lastLogin: 'Just now' },
      { id: 'usr-4', name: 'Ramesh Chandra (Citizen)', account: 'DEMO100001', role: 'CITIZEN', status: 'ACTIVE', lastLogin: 'Yesterday' },
    ]);
  }, []);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleSavedNotice(true);
    setTimeout(() => setRuleSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            Platform Administration &amp; Governance
          </h2>
          <p className="text-xs text-zinc-400">
            System audit trail, role-based access governance, and heuristic fraud threshold parameterization
          </p>
        </div>

        <div className="flex gap-2 bg-[#141414] p-1 rounded-lg border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'AUDIT' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Audit Log Ledger
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'USERS' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            User Roles &amp; RBAC
          </button>
          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'RULES' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Engine Rule Thresholds
          </button>
        </div>
      </div>

      {ruleSavedNotice && (
        <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Fraud heuristic parameters successfully synchronized with runtime engine.</span>
        </div>
      )}

      {/* TAB 1: AUDIT LOG */}
      {activeTab === 'AUDIT' && (
        <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-[#141414] border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              Cryptographic Audit Log Ledger
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">Immutable append-only events</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#181818] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4 font-sans">Details / Justification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-[#161616] transition-colors">
                    <td className="py-3 px-4 text-zinc-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-purple-400">
                      {log.performedByName} ({log.performedByRole})
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{log.targetEntity}</td>
                    <td className="py-3 px-4 font-sans text-zinc-300 text-xs max-w-sm">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC */}
      {activeTab === 'USERS' && (
        <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 bg-[#141414] border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Role-Based Access Control (RBAC) Registry
            </h3>
            <span className="text-[11px] text-zinc-400">4 system tiers enforced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181818] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Account ID</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Permissions Scope</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-[#161616]">
                    <td className="py-3 px-4 font-semibold text-zinc-100">{u.name}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{u.account}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        u.role === 'ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        u.role === 'SENIOR_INVESTIGATOR' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        u.role === 'INVESTIGATOR' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-[11px]">
                      {u.role === 'ADMIN' ? 'Full System Configuration & Logs' :
                       u.role === 'SENIOR_INVESTIGATOR' ? 'All Cases, Reopen, Audit, Approve Freeze' :
                       u.role === 'INVESTIGATOR' ? 'Active Cases, Evidence, Recommend Freeze' :
                       'Self Account & Dispute Reporting Only'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 font-semibold text-[10px]">ACTIVE</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-[11px] text-zinc-400 hover:text-purple-400 underline">
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RULE THRESHOLDS */}
      {activeTab === 'RULES' && (
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl max-w-2xl mx-auto space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
            <Sliders className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100 uppercase">
                Heuristic Engine Thresholds &amp; Sensitivity
              </h3>
              <p className="text-xs text-zinc-400">Configure cutoff ratings for automated triage and alert grouping</p>
            </div>
          </div>

          <form onSubmit={handleSaveRules} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex justify-between">
                <span>Critical Risk Cutoff (Points):</span>
                <span className="font-mono text-red-400 font-bold">{rules.criticalThreshold}+</span>
              </label>
              <input
                type="range"
                min="70"
                max="95"
                value={rules.criticalThreshold}
                onChange={(e) => setRules({ ...rules, criticalThreshold: Number(e.target.value) })}
                className="w-full accent-red-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold flex justify-between">
                <span>High Risk Cutoff (Points):</span>
                <span className="font-mono text-orange-400 font-bold">{rules.highThreshold} - {rules.criticalThreshold - 1}</span>
              </label>
              <input
                type="range"
                min="50"
                max="75"
                value={rules.highThreshold}
                onChange={(e) => setRules({ ...rules, highThreshold: Number(e.target.value) })}
                className="w-full accent-orange-500"
              />
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rules.autoAlertVelocity}
                  onChange={(e) => setRules({ ...rules, autoAlertVelocity: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-purple-600"
                />
                <span className="text-zinc-300 font-medium">Auto-dispatch Alert on &gt;300% Velocity Spikes</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rules.torExitNodeBlock}
                  onChange={(e) => setRules({ ...rules, torExitNodeBlock: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-purple-600"
                />
                <span className="text-zinc-300 font-medium">Mandatory +25 pts for Tor Exit Nodes &amp; Public Proxies</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rules.requireSeniorApprovalForFreeze}
                  onChange={(e) => setRules({ ...rules, requireSeniorApprovalForFreeze: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-900 text-purple-600"
                />
                <span className="text-zinc-300 font-medium">Require Senior Investigator Counter-Approval for Freeze Orders</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg shadow-md transition-colors"
            >
              Update Engine Policy Parameters
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
