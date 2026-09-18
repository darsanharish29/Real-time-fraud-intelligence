import React, { useState, useEffect } from 'react';
import {
  Workflow,
  FolderGit2,
  Activity,
  TrendingUp,
  Share2,
  FileCheck2,
  Clock,
  FileText,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  Plus,
  Send,
  Download,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { api } from '../lib/api';
import { FraudCase } from '../types';
import ConfirmFreezeModal from '../components/common/ConfirmFreezeModal';

interface WorkspacePageProps {
  initialCaseId?: string;
}

type WorkspaceTab =
  | 'overview'
  | 'transactions'
  | 'risk'
  | 'behavior'
  | 'network'
  | 'evidence'
  | 'timeline'
  | 'notes'
  | 'report';

export default function WorkspacePage({ initialCaseId = 'case-1044' }: WorkspacePageProps) {
  const [caseId, setCaseId] = useState<string>(initialCaseId);
  const [casesList, setCasesList] = useState<any[]>([]);
  const [caseData, setCaseData] = useState<FraudCase | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('overview');
  const [loading, setLoading] = useState(true);

  // Notes state
  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Evidence state
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState('TRANSACTION_RECORD');
  const [evidenceDesc, setEvidenceDesc] = useState('');

  // Freeze action state
  const [freezeModalOpen, setFreezeModalOpen] = useState(false);

  const fetchCaseDetails = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.getCaseById(id);
      if (res.success) {
        setCaseData(res.data);
      }
    } catch (err) {
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load all cases for selector
    api.getCases().then(res => {
      if (res.success) setCasesList(res.data);
    });
  }, []);

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails(caseId);
    }
  }, [caseId]);

  const handleStatusChange = async (newStatus: any) => {
    if (!caseData) return;
    try {
      await api.updateCaseStatus(caseData.id, newStatus);
      fetchCaseDetails(caseData.id);
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !caseData) return;
    setIsSubmittingNote(true);
    try {
      await api.addCaseNote(caseData.id, newNote);
      setNewNote('');
      fetchCaseDetails(caseData.id);
    } catch (err) {
      console.error('Add note error:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceDesc.trim() || !caseData) return;
    try {
      await api.addEvidence(caseData.id, {
        type: evidenceType as any,
        description: evidenceDesc
      });
      setEvidenceDesc('');
      setIsEvidenceModalOpen(false);
      fetchCaseDetails(caseData.id);
    } catch (err) {
      console.error('Add evidence error:', err);
    }
  };

  const handleConfirmFreeze = async (reason: string) => {
    if (!caseData?.targetAccount) return;
    await api.recommendAccountFreeze(caseData.targetAccount, reason);
    fetchCaseDetails(caseData.id);
  };

  const tabs: { id: WorkspaceTab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: FolderGit2 },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'risk', label: 'Risk Analysis', icon: TrendingUp },
    { id: 'behavior', label: 'Behavior', icon: Workflow },
    { id: 'network', label: 'Network', icon: Share2 },
    { id: 'evidence', label: 'Evidence', icon: FileCheck2 },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'report', label: 'Report', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Case Selector */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">{caseData?.caseNumber || 'CASE-1044'}</span>
                <h2 className="text-base font-bold text-zinc-100">{caseData?.title || 'Case Investigation Workspace'}</h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Target Account: <span className="font-mono text-zinc-200 font-semibold">{caseData?.targetAccount}</span> &bull; Category: {caseData?.category.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Case Selector Dropdown */}
            <select
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              className="bg-[#181818] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              {casesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title.substring(0, 30)}...
                </option>
              ))}
            </select>

            {/* Status Selector */}
            <select
              value={caseData?.status || 'UNDER_INVESTIGATION'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-[#181818] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
            >
              <option value="NEW">Status: NEW</option>
              <option value="ASSIGNED">Status: ASSIGNED</option>
              <option value="UNDER_INVESTIGATION">Status: UNDER INVESTIGATION</option>
              <option value="ESCALATED">Status: ESCALATED</option>
              <option value="RESOLVED">Status: RESOLVED</option>
              <option value="CLOSED">Status: CLOSED</option>
            </select>
          </div>
        </div>

        {/* Repeated Account Alert Ribbon in Workspace if flagged */}
        {caseData?.isRepeatedAccount && (
          <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-200 font-medium">
                Watchlist Trigger: Account {caseData.targetAccount} is linked to {caseData.repeatedCaseCount} open syndicate investigations.
              </span>
            </div>
            <button
              onClick={() => setFreezeModalOpen(true)}
              disabled={caseData.isFreezeRecommended}
              className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
                caseData.isFreezeRecommended
                  ? 'bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed'
                  : 'bg-red-950 hover:bg-red-900 text-red-200 border border-red-700'
              }`}
            >
              {caseData.isFreezeRecommended ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Freeze Review Recommended</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Recommend Freeze</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 9 Workspace Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-zinc-800 pt-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors shrink-0 ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels */}
      {caseData && (
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl min-h-[400px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400 uppercase font-semibold">Risk Evaluation</div>
                  <div className="text-xl font-bold font-mono text-red-400">{caseData.riskScore} / 100 ({caseData.riskLevel})</div>
                  <p className="text-[11px] text-zinc-400">Calculated by automated heuristic rules</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400 uppercase font-semibold">Assigned Specialist</div>
                  <div className="text-sm font-bold text-zinc-200">{caseData.assignedToName || 'Unassigned'}</div>
                  <p className="text-[11px] text-zinc-400">Financial Cybercrime Unit</p>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-1">
                  <div className="text-[11px] text-zinc-400 uppercase font-semibold">Incident Timestamps</div>
                  <div className="text-xs font-mono text-zinc-300">Opened: {new Date(caseData.createdAt).toLocaleDateString()}</div>
                  <p className="text-[11px] text-zinc-400 font-mono">Last Active: {new Date(caseData.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Complainant Dossier if citizen complaint */}
              {caseData.complainantName && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-850/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Citizen Complainant Dossier
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700">
                      Grievance Portal Entry
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">Complainant Name</span>
                      <span className="text-zinc-200 font-semibold">{caseData.complainantName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">Victim Account</span>
                      <span className="text-zinc-200 font-mono">{caseData.complainantAccount || caseData.targetAccount}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">Disputed Amount</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        {caseData.disputedAmount ? `₹${caseData.disputedAmount.toLocaleString()}` : 'General Grievance'}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block text-[10px] uppercase">Txn Reference</span>
                      <span className="text-amber-300 font-mono">{caseData.disputedTxnRef || 'None specified'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Case Synopsis &amp; Modus Operandi
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed bg-[#161616] p-4 rounded-xl border border-zinc-800">
                  {caseData.description}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Intelligence Classification Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {caseData.tags?.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-zinc-800 text-emerald-400 font-mono text-xs border border-zinc-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Associated Transactions for {caseData.targetAccount}
                </h3>
                <span className="text-xs text-zinc-400">{caseData.transactions?.length || 0} transactions linked</span>
              </div>

              <div className="overflow-x-auto border border-zinc-800 rounded-lg">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#161616] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Txn ID</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Origin / IP</th>
                      <th className="py-2.5 px-3">Hardware Signature</th>
                      <th className="py-2.5 px-3">Risk Score</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {(caseData.transactions || []).map(t => (
                      <tr key={t.id} className="hover:bg-[#181818]">
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{t.transactionRef}</td>
                        <td className="py-2.5 px-3 font-semibold text-zinc-100">₹{t.amount.toLocaleString()}</td>
                        <td className="py-2.5 px-3">{t.channel}</td>
                        <td className="py-2.5 px-3 text-zinc-400">{t.location}</td>
                        <td className="py-2.5 px-3 text-zinc-500 text-[11px] truncate max-w-[130px]">{t.deviceId}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-red-400 font-bold">{t.riskScore} ({t.riskLevel})</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300">{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RISK ANALYSIS */}
          {activeTab === 'risk' && (
            <div className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Rule-Based Fraud Engine Explanations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-3">
                  <div className="text-xs font-semibold text-emerald-400">Triggered Rules &amp; Weightings</div>
                  <div className="space-y-2 text-xs text-zinc-300">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <span>Rule 1: Unusual Transfer Outliers</span>
                      <span className="font-mono font-bold text-red-400">+35 pts</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <span>Rule 3: Geographic Proxy / Evasion</span>
                      <span className="font-mono font-bold text-orange-400">+28 pts</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                      <span>Rule 4: Rooted / Spoofed Hardware</span>
                      <span className="font-mono font-bold text-orange-400">+20 pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Rule 7: Repeated Account Association</span>
                      <span className="font-mono font-bold text-red-400">+24 pts</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-3">
                  <div className="text-xs font-semibold text-emerald-400">Investigator Recommendation Logic</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Composite score <span className="font-mono text-red-400 font-bold">89/100</span> denotes CRITICAL fraud syndicate velocity. The transaction structuring behavior (amounts split across linked accounts within minutes) matches known mule harvesting rings.
                  </p>
                  <div className="p-3 rounded bg-red-950/40 border border-red-900/60 text-[11px] text-red-300">
                    Recommended Next Action: Requisition bank statement for DEMO-ACC-2048, lodge FIR under Section 66D IT Act, and execute safe freeze review recommendation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BEHAVIOR */}
          {activeTab === 'behavior' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Behavioral Anomaly &amp; Velocity Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-2">
                  <div className="text-zinc-400">Median Monthly Velocity:</div>
                  <div className="text-lg font-mono font-bold text-zinc-200">₹8,500 / mo</div>
                  <div className="text-[11px] text-zinc-500">Historical benchmark across past 12 months</div>
                </div>
                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-2">
                  <div className="text-zinc-400">Burst Inflow Spike:</div>
                  <div className="text-lg font-mono font-bold text-red-400">₹3,11,500 in 48 hrs</div>
                  <div className="text-[11px] text-red-400">3,560% deviation from baseline</div>
                </div>
                <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-2">
                  <div className="text-zinc-400">Active Device Signatures:</div>
                  <div className="text-lg font-mono font-bold text-amber-400">4 Hardware IDs</div>
                  <div className="text-[11px] text-zinc-500">3 unverified mobile footprints</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NETWORK */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Entity Linkage &amp; Relational Topology
                </h3>
                <span className="text-[11px] text-zinc-400 font-mono">Target: {caseData.targetAccount}</span>
              </div>

              <div className="p-6 rounded-xl bg-[#161616] border border-zinc-800 text-xs space-y-3 font-mono">
                <div className="text-zinc-400">Directly Linked Entity Graph:</div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-[#1c1c1c] border border-zinc-700 flex items-center justify-between">
                    <span className="text-emerald-400">Account: DEMO-ACC-2048</span>
                    <span className="text-zinc-500">&rarr; Outbound ₹1,48,500 &rarr;</span>
                    <span className="text-zinc-300">Mule: DEMO-MULE-9901</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#1c1c1c] border border-zinc-700 flex items-center justify-between">
                    <span className="text-emerald-400">Account: DEMO-ACC-2048</span>
                    <span className="text-zinc-500">&rarr; Outbound ₹98,000 &rarr;</span>
                    <span className="text-zinc-300">Mule: DEMO-MULE-9902</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#1c1c1c] border border-zinc-700 flex items-center justify-between">
                    <span className="text-emerald-400">Account: DEMO-ACC-2048</span>
                    <span className="text-zinc-500">&rarr; Rooted Device &rarr;</span>
                    <span className="text-red-400">DEV-ANOMALY-ROOTED-88</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#1c1c1c] border border-zinc-700 flex items-center justify-between">
                    <span className="text-red-400">DEV-ANOMALY-ROOTED-88</span>
                    <span className="text-zinc-500">&rarr; Tor Relay IP &rarr;</span>
                    <span className="text-purple-400">198.51.100.42</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: EVIDENCE */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Forensic Evidence Ledger ({caseData.evidence?.length || 0})
                </h3>
                <button
                  onClick={() => setIsEvidenceModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Attach Evidence
                </button>
              </div>

              <div className="space-y-2.5">
                {(caseData.evidence || []).map(e => (
                  <div key={e.id} className="p-3.5 rounded-xl bg-[#161616] border border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-semibold">{e.evidenceRef}</span>
                        <span className="text-zinc-200 font-medium">{e.type.replace('_', ' ')}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                        {e.status}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-[11px]">{e.description}</p>
                    <div className="flex flex-wrap items-center justify-between pt-1 text-[10px] text-zinc-500 font-mono">
                      <span>SHA-256: {e.fileHash}</span>
                      <span>Uploaded by {e.uploadedBy} on {new Date(e.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                Investigation Milestone Sequence
              </h3>
              <div className="space-y-4 border-l-2 border-zinc-800 pl-4 ml-2 text-xs">
                {[
                  { title: 'Case Created in Surveillance Engine', time: caseData.createdAt, actor: 'System Anomaly Detector' },
                  { title: 'Investigator Assigned & Primary Dossier Initialized', time: '2026-09-18T08:30:00Z', actor: caseData.assignedToName || 'Investigator' },
                  { title: 'Repeated Account Linkage Triggered', time: '2026-09-18T10:10:00Z', actor: 'Heuristic Rule 7' },
                  { title: 'Forensic Hardware Telemetry Extracted', time: '2026-09-18T11:00:00Z', actor: 'Forensic Lab Unit' },
                  { title: 'Supervisor Case Review & Escalation Notice Sent', time: caseData.updatedAt, actor: 'Lead Investigator' },
                ].map((ev, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -left-[21px] top-1" />
                    <div className="font-semibold text-zinc-200">{ev.title}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      {new Date(ev.time).toLocaleString()} &bull; {ev.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Case Notes &amp; Collaborative Logs ({caseData.notes?.length || 0})
                </h3>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  required
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record investigation finding, suspect interviews, IP ISP subpoena update..."
                  className="w-full bg-[#181818] border border-zinc-700/80 rounded-lg p-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingNote || !newNote.trim()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {(caseData.notes || []).map(n => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-[#161616] border border-zinc-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400">{n.authorName} ({n.authorRole})</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: REPORT */}
          {activeTab === 'report' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                    Comprehensive Forensic Case Report
                  </h3>
                  <p className="text-xs text-zinc-400">Formal law enforcement briefing packet</p>
                </div>

                <button
                  onClick={() => alert(`Forensic Case Report for ${caseData.caseNumber} exported as PDF/JSON archive.`)}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download / Export Packet
                </button>
              </div>

              <div className="p-6 rounded-xl bg-[#161616] border border-zinc-800 space-y-4 text-xs font-sans">
                <div className="border-b border-zinc-800 pb-3 flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm font-bold text-emerald-400">REPORT REF: REP-{caseData.caseNumber}</div>
                    <div className="text-zinc-400 text-[11px]">Financial Cybercrime Surveillance Directorate</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">CONFIDENTIAL</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>Target Subject: <span className="font-mono text-zinc-200 font-semibold">{caseData.targetAccount}</span></div>
                  <div>Status: <span className="font-semibold text-emerald-400">{caseData.status}</span></div>
                  <div>Risk Assessment: <span className="font-mono text-red-400 font-semibold">{caseData.riskLevel} ({caseData.riskScore}/100)</span></div>
                  <div>Investigator: <span className="text-zinc-200">{caseData.assignedToName || 'Unassigned'}</span></div>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="font-semibold text-zinc-200">Executive Summary:</div>
                  <p className="text-zinc-400 leading-relaxed">
                    {caseData.description} Target entity demonstrates persistent recurring illicit transaction layering across multiple mule accounts. Rooted hardware signatures and proxy IP tunnels confirm coordinated cybercrime syndicate operations.
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="font-semibold text-zinc-200">Statutory Action Recommendation:</div>
                  <p className="text-zinc-400 leading-relaxed">
                    {caseData.isFreezeRecommended
                      ? 'Formal account freeze recommended by primary investigator. Awaiting judiciary compliance verification.'
                      : 'Recommend immediate account freeze and inter-bank freezing orders under Section 91 CrPC.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Attach Evidence Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-100 uppercase">Attach Forensic Evidence</h3>
            <form onSubmit={handleAddEvidence} className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold">Evidence Classification</label>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-200"
                >
                  <option value="TRANSACTION_RECORD">Transaction Payload Record</option>
                  <option value="DEVICE_INFO">Device / Hardware Telemetry</option>
                  <option value="LOGIN_EVENT">WAF / Network Access Log</option>
                  <option value="GEO_EVENT">CCTV / Geo-Coordinate Match</option>
                  <option value="SYSTEM_ALERT">Automated Intelligence Snapshot</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold">Description &amp; Findings</label>
                <textarea
                  rows={3}
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Document the technical details, source, or forensic extraction method..."
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-md text-zinc-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Sign &amp; Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Freeze Safety Confirmation Modal */}
      {caseData && (
        <ConfirmFreezeModal
          accountNumber={caseData.targetAccount}
          isOpen={freezeModalOpen}
          onClose={() => setFreezeModalOpen(false)}
          onConfirm={handleConfirmFreeze}
        />
      )}
    </div>
  );
}
