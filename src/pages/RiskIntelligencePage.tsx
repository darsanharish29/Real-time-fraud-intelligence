import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Cpu,
  Globe,
  Users,
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  Activity,
  Layers,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { api } from '../lib/api';

interface RiskIntelligencePageProps {
  onInvestigateAccount?: (account: string) => void;
  onOpenCase?: (caseId: string) => void;
}

export default function RiskIntelligencePage({
  onInvestigateAccount,
  onOpenCase
}: RiskIntelligencePageProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'citizen' | 'surveillance'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await api.getAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const summary = data?.summary || {
    totalCases: 20,
    newCases: 4,
    criticalCases: 4,
    highRiskCases: 8,
    resolvedCases: 6,
    resolutionRate: 30,
    citizenDisputesCount: 1,
    citizenDisputedAmount: 45000,
    totalMonitoredVolume: 12500000,
    flaggedVolume: 2450000,
    activeAlerts: 6,
    frozenAccounts: 2
  };

  const citizenData = data?.citizenAnalytics || {
    totalGrievances: summary.citizenDisputesCount || 1,
    totalDisputedAmount: summary.citizenDisputedAmount || 45000,
    resolvedGrievances: 0,
    pendingGrievances: 1,
    suspectAccounts: ['DEMO-ACC-2048'],
    recentGrievances: []
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Fraud Analytics &amp; Risk Intelligence Command</span>
          </h2>
          <p className="text-xs text-zinc-400">
            Real-time citizen grievance metrics, syndicate surveillance, macro behavioral telemetry &amp; hardware anomalies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-lg bg-[#141414] hover:bg-[#1e1e1e] border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('citizen')}
          className="p-4 rounded-xl bg-[#101713] border border-emerald-800/80 space-y-1 cursor-pointer hover:border-emerald-600 transition-all shadow-md"
        >
          <div className="text-[11px] font-semibold text-emerald-400 uppercase flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              Citizen Grievances
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded">Active</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {citizenData.totalGrievances}
          </div>
          <p className="text-[10px] text-zinc-400 font-mono">₹{citizenData.totalDisputedAmount.toLocaleString()} in dispute</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Surveillance Accounts
          </div>
          <div className="text-xl font-bold font-mono text-red-400">
            {data?.highRiskAccounts?.length || summary.criticalCases}
          </div>
          <p className="text-[10px] text-zinc-400">Score &ge; 70 Critical</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-orange-400" />
            Risk Corridors
          </div>
          <div className="text-xl font-bold font-mono text-orange-400">
            {data?.geoRisk?.length || 4} Hotspots
          </div>
          <p className="text-[10px] text-zinc-400">High velocity regions</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            Active Alerts
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {summary.activeAlerts}
          </div>
          <p className="text-[10px] text-zinc-400">Real-time triggers</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            Resolution Rate
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {summary.resolutionRate}%
          </div>
          <p className="text-[10px] text-zinc-400">{summary.resolvedCases} cases settled</p>
        </div>

        <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-1">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Frozen Accounts
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            {summary.frozenAccounts}
          </div>
          <p className="text-[10px] text-zinc-400">Mitigation locked</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Macro Trends &amp; Visual Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('citizen')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'citizen'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>Citizen Grievance Analytics</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-900/80 text-emerald-300 text-[10px] font-mono font-bold">
            {citizenData.totalGrievances}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('surveillance')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'surveillance'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Surveillance Watchlist &amp; Corridors</span>
        </button>
      </div>

      {/* TAB 1: MACRO TRENDS & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Row 1: Case Velocity Area Chart + Risk Score Severity Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Cases Over Time Area Chart */}
            <div className="lg:col-span-7 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Fraud Incident Velocity &amp; Resolution Trajectory
                  </h3>
                  <p className="text-[11px] text-zinc-400">Weekly case volume influx compared against closed/resolved dossiers</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Live Feed
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data?.casesOverTime || []}>
                    <defs>
                      <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181818', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Area type="monotone" dataKey="cases" name="Total Inflow Cases" stroke="#ef4444" fillOpacity={1} fill="url(#colorCases)" strokeWidth={2} />
                    <Area type="monotone" dataKey="resolved" name="Cases Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Distribution Bar Chart */}
            <div className="lg:col-span-5 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Risk Score Severity Distribution
                  </h3>
                  <p className="text-[11px] text-zinc-400">Total active transaction ledger partitioned by risk band</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.riskDist || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={11} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#181818', borderColor: '#3f3f46', borderRadius: '8px', fontSize: '11px', color: '#fff' }}
                    />
                    <Bar dataKey="count" name="Evaluated Transactions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Row 2: Channel Exposure Breakdown & Typology List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Channel Vulnerability */}
            <div className="lg:col-span-6 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Banking Channel Vulnerability Matrix
              </h3>
              <p className="text-[11px] text-zinc-400">
                Transaction volume distribution &amp; flagged anomaly percentage by channel
              </p>

              <div className="space-y-3 pt-2">
                {(data?.channelDist || [
                  { channel: 'UPI', count: 28, volume: 1450000, flagged: 7, flagRate: 25 },
                  { channel: 'NET_BANKING', count: 14, volume: 4800000, flagged: 3, flagRate: 21 },
                  { channel: 'ATM', count: 8, volume: 240000, flagged: 2, flagRate: 25 },
                  { channel: 'POS', count: 6, volume: 120000, flagged: 1, flagRate: 16 }
                ]).map((ch: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#161616] border border-zinc-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono font-bold">
                          {ch.channel}
                        </span>
                        <span className="text-zinc-400">{ch.count} transactions evaluated</span>
                      </div>
                      <span className="font-mono text-zinc-200 font-semibold">
                        ₹{ch.volume.toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-zinc-400">Flagged Risk Ratio</span>
                        <span className="font-mono text-red-400 font-semibold">{ch.flagRate}% ({ch.flagged} flagged)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full ${ch.flagRate > 20 ? 'bg-red-500' : 'bg-emerald-500'} rounded-full`}
                          style={{ width: `${Math.min(100, ch.flagRate * 2.5)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typology Breakdown */}
            <div className="lg:col-span-6 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Syndicate Typology &amp; Modus Operandi Breakdown
              </h3>
              <p className="text-[11px] text-zinc-400">
                Active investigation classifications across open cases
              </p>

              <div className="space-y-3 pt-1">
                {(data?.categoryDist || [
                  { name: 'MULE ACCOUNT', count: 7, pct: 35 },
                  { name: 'UPI PHISHING', count: 5, pct: 25 },
                  { name: 'IDENTITY THEFT', count: 4, pct: 20 },
                  { name: 'CARD CLONING', count: 2, pct: 10 },
                  { name: 'SIM SWAP', count: 2, pct: 10 }
                ]).map((cat: any, idx: number) => {
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-200 font-medium">{cat.name}</span>
                        <span className="font-mono text-zinc-400">{cat.count} cases ({cat.pct || 20}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1e1e1e] overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${cat.pct || 20}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: CITIZEN GRIEVANCE ANALYTICS */}
      {activeTab === 'citizen' && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#121a15] border border-emerald-800/60 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase">Total Filed Consumer Disputes</span>
              <div className="text-2xl font-bold font-mono text-emerald-300">{citizenData.totalGrievances}</div>
              <p className="text-[11px] text-zinc-400">Lodged via Citizen Grievance Portal</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121a15] border border-emerald-800/60 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase">Disputed Restitution Value</span>
              <div className="text-2xl font-bold font-mono text-emerald-300">₹{citizenData.totalDisputedAmount.toLocaleString()}</div>
              <p className="text-[11px] text-zinc-400">Total claimed unauthorized transfers</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121a15] border border-emerald-800/60 space-y-1">
              <span className="text-[11px] font-semibold text-amber-400 uppercase">Active Triage Pipeline</span>
              <div className="text-2xl font-bold font-mono text-amber-300">{citizenData.pendingGrievances}</div>
              <p className="text-[11px] text-zinc-400">Under Lead / Senior investigation review</p>
            </div>
            <div className="p-4 rounded-xl bg-[#121a15] border border-emerald-800/60 space-y-1">
              <span className="text-[11px] font-semibold text-red-400 uppercase">Suspect Destination Accounts</span>
              <div className="text-2xl font-bold font-mono text-red-400">{citizenData.suspectAccounts.length}</div>
              <p className="text-[11px] text-zinc-400">Flagged in citizen complaints</p>
            </div>
          </div>

          {/* Citizen Disputes Breakdown & Reported Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Suspect Accounts Flagged by Citizens */}
            <div className="lg:col-span-7 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>Citizen-Reported Suspect Accounts</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400">Target beneficiary accounts reported in consumer disputes</p>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Direct Lead Trace
                </span>
              </div>

              <div className="space-y-2.5">
                {citizenData.suspectAccounts.map((acc: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#161616] border border-zinc-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-400 font-bold">{acc}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800">
                          Mule / Phishing Recipient
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">Reported in citizen fraud dispute docket</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onInvestigateAccount && (
                        <button
                          onClick={() => onInvestigateAccount(acc)}
                          className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>Audit Ledger</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick SLA & Regulatory Timeline Card */}
            <div className="lg:col-span-5 bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Statutory Grievance Compliance &amp; SLAs</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                RBI Master Direction (Zero/Limited Liability in Unauthorized Electronic Transactions)
              </p>

              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 rounded-lg bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-200">Mandatory Initial Acknowledgment</span>
                    <span className="text-emerald-400 font-mono">Immediate (&lt; 1 hr)</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Auto-assigned to Lead Investigator Vikram Sengupta &amp; Senior Supervisor Dr. Priya Nambiar</p>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-200">Emergency Account Shadow Freeze</span>
                    <span className="text-amber-400 font-mono">Within 24 Hours</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Senior Investigator review required for Section 91 CrPC / LEA freeze orders</p>
                </div>

                <div className="p-3 rounded-lg bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-200">Formal Dispute Resolution &amp; Restitution</span>
                    <span className="text-blue-400 font-mono">Max 90 Calendar Days</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">Chargeback arbitration via NPCI UPI / Payment Network</p>
                </div>
              </div>
            </div>
          </div>

          {/* Citizen Complaints Roster in Analytics */}
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Incoming Citizen Grievances Ingested into Intelligence Stream</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Complaints filed by citizens with dual-investigator triage dispatch</p>
              </div>
            </div>

            <div className="space-y-2">
              {citizenData.recentGrievances && citizenData.recentGrievances.length > 0 ? (
                citizenData.recentGrievances.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg bg-[#161616] border border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{c.caseNumber}</span>
                        <span className="font-semibold text-zinc-200">{c.title}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                          c.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                          c.riskLevel === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {c.riskLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-3">
                        <span>Complainant: <strong className="text-zinc-300">{c.complainantName || 'Citizen'}</strong></span>
                        <span>Disputed Amount: <strong className="text-emerald-400 font-mono">₹{(c.disputedAmount || 0).toLocaleString()}</strong></span>
                        <span>Target Beneficiary: <strong className="text-red-400 font-mono">{c.targetAccount}</strong></span>
                        <span>Status: <strong className="text-zinc-200 font-mono">{c.status}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onOpenCase && (
                        <button
                          onClick={() => onOpenCase(c.id)}
                          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Open Dossier</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-400 text-xs bg-[#161616] rounded-lg border border-zinc-800">
                  No citizen complaints lodged yet. Citizens can lodge disputes via the Citizen Grievance Portal.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SURVEILLANCE & CORRIDORS */}
      {activeTab === 'surveillance' && (
        <div className="space-y-6">
          {/* High-Risk Watchlist */}
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  High-Risk Target Accounts Under Active Surveillance
                </h3>
                <p className="text-[11px] text-zinc-400">Accounts exhibiting rapid velocity spikes or multiple associated consumer fraud disputes</p>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">Ranked by Composite Risk Score</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(data?.highRiskAccounts || []).map((acc: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#161616] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-bold text-xs">{acc.account}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          acc.score >= 80 ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-orange-950 text-orange-300 border border-orange-800'
                        }`}>
                          Risk Score: {acc.score}/100
                        </span>
                      </div>
                      <div className="text-xs text-zinc-300 font-medium mt-1">{acc.holder}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        Triggered Heuristic: <span className="text-red-300">{acc.flag}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-400">{acc.cases} active cases</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">Action recommended: Freeze / Forensic Audit</span>
                    {onInvestigateAccount && (
                      <button
                        onClick={() => onInvestigateAccount(acc.account)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <span>Audit Transactions</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Corridors & Hardware Fingerprints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Geographic Risk Hotspots */}
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Geographic Threat Corridors</span>
              </h3>
              <div className="space-y-2.5">
                {(data?.geoRisk || []).map((geo: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#161616] border border-zinc-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-zinc-200">{geo.region}</div>
                      <div className="text-[11px] text-zinc-400">{geo.activeAnomalies} flagged transfer attempts</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      geo.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' :
                      geo.riskLevel === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {geo.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardware Fingerprint Anomalies */}
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Flagged Device Fingerprints &amp; Emulators</span>
              </h3>
              <div className="space-y-2.5">
                {(data?.deviceRisk || []).map((dev: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#161616] border border-zinc-800 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-mono text-red-300 font-semibold">{dev.deviceId}</div>
                      <div className="text-[11px] text-zinc-400">{dev.flagReason}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-amber-400">{dev.associatedAccounts} accounts linked</span>
                      <div className="text-[10px] text-zinc-400">Suspicious proxy profile</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
