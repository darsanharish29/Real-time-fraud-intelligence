import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FolderGit2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Inbox,
  User,
  ArrowRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { DashboardStats, FraudCase } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ConfirmFreezeModal from '../components/common/ConfirmFreezeModal';

interface InvestigatorDashboardProps {
  onNavigate: (tab: any, caseId?: string) => void;
}

export default function InvestigatorDashboard({ onNavigate }: InvestigatorDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [repeatedAccount, setRepeatedAccount] = useState<any>(null);
  const [recentCases, setRecentCases] = useState<FraudCase[]>([]);
  const [citizenGrievances, setCitizenGrievances] = useState<FraudCase[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isSenior = user?.role === 'SENIOR_INVESTIGATOR';

  const fetchDashboardData = async () => {
    try {
      const [statsRes, repeatedRes, casesRes, alertsRes] = await Promise.all([
        api.getDashboardStats(),
        api.getRepeatedAccount('DEMO-ACC-2048'),
        api.getCases(),
        api.getAlerts()
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (repeatedRes.success) setRepeatedAccount(repeatedRes.data);
      if (casesRes.success) {
        const all: FraudCase[] = casesRes.data || [];
        setRecentCases(all.slice(0, 6));
        // Filter citizen complaints
        const citizenCases = all.filter(c => !!c.complainantName || c.tags?.includes('Citizen-Dispute'));
        setCitizenGrievances(citizenCases);
      }
      if (alertsRes.success) setRecentAlerts(alertsRes.data.slice(0, 4));
    } catch (err) {
      console.error('Error fetching investigator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleConfirmFreeze = async (reason: string) => {
    if (!repeatedAccount?.accountNumber) return;
    await api.recommendAccountFreeze(repeatedAccount.accountNumber, reason);
    await fetchDashboardData();
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-950/80 text-red-300 border-red-800';
      case 'HIGH':
        return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isSenior ? 'bg-teal-950/80 text-teal-300 border-teal-700' : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
            }`}>
              {isSenior ? 'SUPERVISORY OVERSIGHT DESK' : 'LEAD FORENSIC DESK'}
            </span>
            <span className="text-xs text-zinc-400">
              Officer: <strong className="text-zinc-200">{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase">
            {isSenior ? 'Senior Supervisory Investigation Command' : 'Financial Cybercrime Command Dashboard'}
          </h2>
          <p className="text-xs text-zinc-400">
            {isSenior
              ? 'Supervisory oversight of all citizen grievances, fraud syndicate networks, and freeze authorizations'
              : 'Real-time financial intelligence telemetry, assigned citizen disputes, and forensic investigation pipelines'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('analytics')}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Fraud Analytics
          </button>
          <button
            onClick={() => onNavigate('transactions')}
            className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Live Monitoring Stream
          </button>
          <button
            onClick={() => onNavigate('cases')}
            className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1f1f1f] border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
          >
            Case Archive
          </button>
        </div>
      </div>

      {/* 8 Investigator Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Cases', value: stats?.totalCases || 20, color: 'border-zinc-800 text-zinc-100' },
          { label: 'Citizen Grievances', value: citizenGrievances.length || 1, color: 'border-emerald-800/80 text-emerald-400' },
          { label: 'Investigating', value: stats?.underInvestigation || 9, color: 'border-blue-900/60 text-blue-400' },
          { label: 'High Risk', value: stats?.highRisk || 8, color: 'border-orange-900/60 text-orange-400' },
          { label: 'Critical', value: stats?.critical || 6, color: 'border-red-900/80 text-red-400' },
          { label: 'Escalated', value: stats?.escalated || 3, color: 'border-purple-900/60 text-purple-400' },
          { label: 'Resolved', value: stats?.resolved || 3, color: 'border-zinc-700 text-zinc-300' },
          { label: 'Unassigned', value: stats?.unassigned || 0, color: 'border-amber-900/60 text-amber-400' },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl bg-[#111111] border ${item.color} shadow-sm flex flex-col justify-between`}
          >
            <div className="text-[11px] text-zinc-400 font-medium truncate">{item.label}</div>
            <div className="text-xl font-bold font-mono tracking-tight mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      {/* HIGHLIGHT: Dedicated Incoming Citizen Grievances In-Tray */}
      <div className="p-5 rounded-xl bg-[#0d1210] border border-emerald-800/70 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/90 border border-emerald-700 flex items-center justify-center text-emerald-400 shadow-md">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                  {isSenior ? 'Senior Supervisory In-Tray: Citizen Grievances & Freeze Desk' : 'Assigned Citizen Fraud Complaints (Live In-Tray)'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold animate-pulse">
                  {citizenGrievances.length} Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isSenior
                  ? 'Grievances lodged by consumers are routed here for Senior Investigator review, mandate sign-off, and freeze orders.'
                  : 'Consumer disputes filed via Citizen Portal assigned directly to Lead Investigator Vikram Sengupta for forensic tracing.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('cases')}
              className="px-3 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-xs text-zinc-300 font-medium flex items-center gap-1"
            >
              Filter in Cases &rarr;
            </button>
          </div>
        </div>

        {citizenGrievances.length === 0 ? (
          <div className="p-6 rounded-lg bg-zinc-900/40 border border-dashed border-zinc-800 text-center space-y-2">
            <div className="text-xs text-zinc-400">
              No citizen grievances in queue. Complaints filed via the Citizen Portal will automatically appear here with dual assignment to Lead Investigator &amp; Senior Supervisory Officer.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {citizenGrievances.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-[#151a17] border border-emerald-900/60 hover:border-emerald-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{c.caseNumber}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        Citizen: {c.complainantName}
                      </span>
                    </div>
                    <div className="font-medium text-xs text-zinc-200 mt-1 line-clamp-1">{c.title}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRiskColor(c.riskLevel)}`}>
                    {c.riskLevel} ({c.riskScore})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#0c100e] p-2.5 rounded-lg border border-zinc-850">
                  <div>
                    <span className="text-zinc-500">Complainant Acc:</span>
                    <div className="font-mono font-semibold text-zinc-300 truncate">{c.complainantAccount || 'Verified'}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Disputed Amount:</span>
                    <div className="font-mono font-bold text-emerald-400">
                      {c.disputedAmount ? `₹${c.disputedAmount.toLocaleString()}` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Suspect / Target:</span>
                    <div className="font-mono text-red-400 truncate">{c.suspectAccount || c.targetAccount}</div>
                  </div>
                  <div>
                    <span className="text-zinc-500">Status:</span>
                    <div className="font-semibold text-zinc-200">{c.status.replace('_', ' ')}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800">
                  <div>
                    <span>Lead: <strong className="text-zinc-300">{c.assignedToName?.split(' ')[0] || 'Vikram'}</strong></span>
                    <span className="mx-1.5">&bull;</span>
                    <span>Senior: <strong className="text-teal-300">{c.seniorReviewerName?.split(' ')[0] || 'Dr. Priya'}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('workspace', c.id)}
                    className="px-3 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Investigate Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlight Feature: Repeated Account Detection Alert Card */}
      {repeatedAccount && (
        <div className="p-5 rounded-xl bg-[#0f1411] border border-red-900/80 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-zinc-100 uppercase tracking-wide">
                    Syndicate Alert: Repeated Fraud Target Account Flagged
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-900/60 border border-red-700 text-red-300 text-[10px] font-mono font-bold">
                    CRITICAL WATCHLIST
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Account <span className="font-mono text-zinc-200 font-semibold">{repeatedAccount.accountNumber}</span> is linked across{' '}
                  <span className="text-red-400 font-semibold font-mono">{repeatedAccount.cases?.length || 3} separate active cases</span>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFreezeModalOpen(true)}
                disabled={repeatedAccount.isFreezeRecommended}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  repeatedAccount.isFreezeRecommended
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                    : 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-700'
                }`}
              >
                {repeatedAccount.isFreezeRecommended ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Freeze Review Recommended</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Recommend Account Freeze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Primary Account Holder:</div>
              <div className="font-semibold text-zinc-200 mt-0.5 text-xs truncate">
                {repeatedAccount.accountHolder || 'Rajesh K. / TechVentures'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Linked Aadhaar Hash:</div>
              <div className="font-mono text-zinc-300 mt-0.5 text-xs">
                {repeatedAccount.aadhaarNumber || 'XXXX-XXXX-9901'}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Aggregated Risk Score:</div>
              <div className="font-bold text-red-400 mt-0.5 font-mono">
                {repeatedAccount.riskScore || 94} / 100 (CRITICAL)
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800">
              <div className="text-zinc-400 text-[11px]">Cumulative Txn Outflow:</div>
              <div className="font-bold text-emerald-400 mt-0.5 font-mono">
                ₹{(repeatedAccount.totalTransactionVolume || 311500).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Cases & Live Security Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Table */}
        <div className="lg:col-span-7 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                Priority Cases Under Review
              </h3>
            </div>
            <button
              onClick={() => onNavigate('cases')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>View All Cases</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-850">
            {recentCases.map(c => (
              <div
                key={c.id}
                onClick={() => onNavigate('workspace', c.id)}
                className="py-3 px-2 rounded-lg hover:bg-[#161616] cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-emerald-400 group-hover:underline">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs font-medium text-zinc-200">{c.title}</span>
                    {c.complainantName && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        Citizen: {c.complainantName}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-400 flex items-center gap-3">
                    <span>Target: <span className="font-mono text-zinc-300">{c.targetAccount}</span></span>
                    {c.disputedAmount && (
                      <>
                        <span>&bull;</span>
                        <span className="text-emerald-400 font-mono font-medium">Disputed: ₹{c.disputedAmount.toLocaleString()}</span>
                      </>
                    )}
                    <span>&bull;</span>
                    <span>Lead: {c.assignedToName?.split(' ')[0] || 'Vikram'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getRiskColor(c.riskLevel)}`}>
                    {c.riskLevel} ({c.riskScore})
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Center Widget */}
        <div className="lg:col-span-5 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                Security Alerts Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-zinc-850">
            {recentAlerts.map(a => (
              <div key={a.id} className="py-2.5 px-2 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-zinc-400">{a.alertCode}</span>
                    <span className="text-xs font-medium text-zinc-200">{a.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-1">{a.triggerReason}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 ${getRiskColor(a.severity)}`}>
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmFreezeModal
        isOpen={freezeModalOpen}
        accountNumber={repeatedAccount?.accountNumber || ''}
        repeatedCount={repeatedAccount?.cases?.length || 3}
        onClose={() => setFreezeModalOpen(false)}
        onConfirm={handleConfirmFreeze}
      />
    </div>
  );
}
