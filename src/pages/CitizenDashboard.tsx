import React, { useState, useEffect } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Lock,
  FolderGit2,
  FileText,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Printer,
  Copy,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Activity,
  AlertTriangle,
  User,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import Header from '../components/common/Header';
import DemoBanner from '../components/common/DemoBanner';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'transactions' | 'security'>('library');
  
  // Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search for Complaints Library
  const [complaintSearch, setComplaintSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dispute / Complaint Modal State
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [disputeFormData, setDisputeFormData] = useState({
    title: '',
    category: 'UPI_PHISHING',
    disputedTxnRef: '',
    disputedAmount: '',
    suspectAccount: '',
    description: '',
    desiredOutcome: 'Immediate Account Freeze & Fund Reversal Request'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ success: boolean; caseNumber?: string; message?: string } | null>(null);

  // Detail Modal State
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [copiedCaseNum, setCopiedCaseNum] = useState<string | null>(null);

  const fetchCitizenData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [txnsRes, casesRes] = await Promise.all([
        api.getTransactions(user.accountNumber, 50),
        api.getCitizenComplaints()
      ]);

      if (txnsRes.success) setTransactions(txnsRes.data || []);
      if (casesRes.success) setComplaints(casesRes.data || []);
    } catch (err) {
      console.error('Error loading citizen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizenData();
  }, [user]);

  // Open modal with pre-filled transaction data
  const handleDisputeTransaction = (txn: any) => {
    setDisputeFormData({
      title: `Dispute on unauthorized transaction ${txn.transactionRef}`,
      category: txn.channel === 'UPI' ? 'UPI_PHISHING' : 'MULE_ACCOUNT',
      disputedTxnRef: txn.transactionRef,
      disputedAmount: txn.amount.toString(),
      suspectAccount: txn.recipientAccount || '',
      description: `I noticed an unauthorized charge of ₹${txn.amount.toLocaleString()} on ${new Date(txn.timestamp).toLocaleString()} at location ${txn.location}. I did not initiate or approve this transaction.`,
      desiredOutcome: 'Immediate Transaction Freeze & Fund Reversal'
    });
    setSubmissionResult(null);
    setComplaintModalOpen(true);
  };

  // Submit Complaint Form
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeFormData.description.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.submitComplaint({
        title: disputeFormData.title || `Citizen Dispute: ${disputeFormData.category.replace('_', ' ')}`,
        category: disputeFormData.category,
        disputedTxnRef: disputeFormData.disputedTxnRef || undefined,
        disputedAmount: disputeFormData.disputedAmount ? Number(disputeFormData.disputedAmount) : undefined,
        suspectAccount: disputeFormData.suspectAccount || undefined,
        desiredOutcome: disputeFormData.desiredOutcome,
        description: disputeFormData.description,
        citizenName: user?.name,
        citizenAccount: user?.accountNumber,
        citizenAadhaar: user?.aadhaarNumber,
        citizenPhone: user?.phone
      });

      if (res.success) {
        setSubmissionResult({
          success: true,
          caseNumber: res.data?.caseNumber,
          message: res.message || 'Complaint recorded successfully.'
        });
        // Reload complaints so it appears immediately in the library
        await fetchCitizenData();
        // Switch to library tab so user immediately sees their complaint
        setActiveTab('library');
      } else {
        setSubmissionResult({
          success: false,
          message: res.message || 'Failed to submit complaint'
        });
      }
    } catch (err: any) {
      setSubmissionResult({
        success: false,
        message: err.message || 'Network error while submitting complaint'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a follow-up statement to a case
  const handleAddFollowUpNote = async (caseId: string) => {
    if (!followUpNote.trim()) return;
    setIsAddingNote(true);
    try {
      await api.addCaseNote(caseId, `Citizen Follow-Up: ${followUpNote}`);
      setFollowUpNote('');
      // Refresh case details
      const updated = await api.getCaseById(caseId);
      if (updated.success) {
        setSelectedCase(updated.data);
      }
      await fetchCitizenData();
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaseNum(text);
    setTimeout(() => setCopiedCaseNum(null), 2000);
  };

  // Status badges & text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'NEW':
        return {
          label: 'Received & Queued for Review',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-850',
          step: 1,
          description: 'Your complaint has been acknowledged by the Cyber Financial Crime Cell and queued for investigator assignment.'
        };
      case 'ASSIGNED':
        return {
          label: 'Specialist Assigned',
          badgeClass: 'bg-blue-950 text-blue-300 border-blue-800',
          step: 2,
          description: 'An accredited financial fraud forensic officer has been assigned to investigate this transaction.'
        };
      case 'UNDER_INVESTIGATION':
        return {
          label: 'Forensic Investigation Active',
          badgeClass: 'bg-purple-950 text-purple-300 border-purple-850',
          step: 3,
          description: 'Transaction telemetry, IP address logs, and recipient beneficiary accounts are being analyzed.'
        };
      case 'ESCALATED':
        return {
          label: 'Escalated to Cyber Cell',
          badgeClass: 'bg-orange-950 text-orange-300 border-orange-850',
          step: 4,
          description: 'Account freeze recommendations or inter-bank stop-payment protocols are being executed.'
        };
      case 'RESOLVED':
        return {
          label: 'Resolved & Discharged',
          badgeClass: 'bg-emerald-900 text-emerald-200 border-emerald-700',
          step: 5,
          description: 'Investigation concluded. Restitution or account safeguards have been implemented.'
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          step: 1,
          description: 'Case update recorded.'
        };
    }
  };

  // Filtered complaints
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch =
      c.caseNumber.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      (c.disputedTxnRef && c.disputedTxnRef.toLowerCase().includes(complaintSearch.toLowerCase())) ||
      c.description.toLowerCase().includes(complaintSearch.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLodged = complaints.length;
  const activeCases = complaints.filter(c => c.status === 'NEW' || c.status === 'ASSIGNED' || c.status === 'UNDER_INVESTIGATION' || c.status === 'ESCALATED').length;
  const resolvedCases = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5]">
      <DemoBanner />
      <Header title="Citizen Banking & Consumer Protection Portal" />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Citizen Profile & KPI Banner */}
        <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-semibold uppercase tracking-wider">
                Verified Citizen Account
              </span>
              <span className="text-zinc-400 text-xs font-mono">ID: {user?.id}</span>
            </div>
            
            <h2 className="text-2xl font-bold text-zinc-100">{user?.name}</h2>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">Account Number:</span>
                <span className="font-mono text-zinc-200 font-bold bg-[#161616] px-2 py-0.5 rounded border border-zinc-800">
                  {user?.accountNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400">Aadhaar Ref:</span>
                <span className="font-mono text-zinc-300 bg-[#161616] px-2 py-0.5 rounded border border-zinc-800">
                  {user?.aadhaarNumber}
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>KYC Tier-3 Verified</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setDisputeFormData({
                  title: '',
                  category: 'UPI_PHISHING',
                  disputedTxnRef: '',
                  disputedAmount: '',
                  suspectAccount: '',
                  description: '',
                  desiredOutcome: 'Immediate Account Freeze & Fund Reversal Request'
                });
                setSubmissionResult(null);
                setComplaintModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Lodge New Fraud Complaint
            </button>
          </div>
        </div>

        {/* 3 Metric Cards for Citizen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase">My Total Grievances</div>
              <div className="text-2xl font-bold font-mono text-zinc-100">{totalLodged}</div>
              <div className="text-[11px] text-zinc-400">Registered in Cybercell Registry</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase">Active Cyber Investigations</div>
              <div className="text-2xl font-bold font-mono text-amber-400">{activeCases}</div>
              <div className="text-[11px] text-zinc-400">Under specialist forensic audit</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase">Resolved & Discharged</div>
              <div className="text-2xl font-bold font-mono text-emerald-400">{resolvedCases}</div>
              <div className="text-[11px] text-zinc-400">Claims settled or secured</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Portal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'library'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>My Complaints &amp; Disputes Library</span>
            {complaints.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-200 text-[10px] font-mono">
                {complaints.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'transactions'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Recent Account Transactions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-mono">
              {transactions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'security'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security &amp; Surveillance Feed</span>
          </button>
        </div>

        {/* TAB 1: COMPLAINTS LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  placeholder="Search complaints by Case Number, Reference, or statement..."
                  className="w-full bg-[#181818] border border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#181818] border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">Received (New)</option>
                  <option value="ASSIGNED">Specialist Assigned</option>
                  <option value="UNDER_INVESTIGATION">Under Investigation</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="RESOLVED">Resolved / Closed</option>
                </select>
              </div>
            </div>

            {/* Complaints List or Empty State */}
            {filteredComplaints.length === 0 ? (
              <div className="bg-[#111111] border border-zinc-800 rounded-xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mx-auto">
                  <FolderGit2 className="w-7 h-7 text-zinc-500" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-base font-bold text-zinc-200">
                    {complaints.length === 0 ? 'No Complaints Lodged Yet' : 'No Matching Complaints Found'}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {complaints.length === 0
                      ? 'You have not registered any financial disputes or unauthorized activity reports yet. If you suspect fraud or an unauthorized debit, lodge a grievance immediately.'
                      : 'Try clearing your search query or changing the status filter above.'}
                  </p>
                </div>
                {complaints.length === 0 && (
                  <button
                    onClick={() => {
                      setDisputeFormData({
                        title: '',
                        category: 'UPI_PHISHING',
                        disputedTxnRef: '',
                        disputedAmount: '',
                        suspectAccount: '',
                        description: '',
                        desiredOutcome: 'Immediate Account Freeze & Fund Reversal Request'
                      });
                      setSubmissionResult(null);
                      setComplaintModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Lodge First Complaint
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredComplaints.map((item) => {
                  const statusInfo = getStatusInfo(item.status);
                  return (
                    <div
                      key={item.id}
                      className="bg-[#111111] border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 shadow-lg transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-[#161616] px-2 py-0.5 rounded border border-zinc-800">
                              {item.caseNumber}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusInfo.badgeClass}`}>
                              {statusInfo.label}
                            </span>
                            <span className="text-[11px] text-zinc-400">
                              Lodged: {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(item.caseNumber)}
                            className="px-2.5 py-1 rounded bg-[#181818] hover:bg-[#222] border border-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1.5 transition-colors"
                            title="Copy Case Number"
                          >
                            {copiedCaseNum === item.caseNumber ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setSelectedCase(item)}
                            className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <span>View Full Case Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Complaint Highlights row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#161616] p-3 rounded-lg border border-zinc-800/80 text-xs">
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase">Category</span>
                          <span className="text-zinc-200 font-medium">{item.category.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase">Disputed Amount</span>
                          <span className="text-emerald-400 font-mono font-bold">
                            {item.disputedAmount ? `₹${item.disputedAmount.toLocaleString()}` : 'N/A (General Report)'}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase">Transaction Ref</span>
                          <span className="text-zinc-300 font-mono">{item.disputedTxnRef || 'None specified'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase">Assigned Cell</span>
                          <span className="text-zinc-200 font-medium">
                            {item.assignedToName || 'Cybercrime General Cell'}
                          </span>
                        </div>
                      </div>

                      {/* Statement synopsis */}
                      <p className="text-xs text-zinc-400 line-clamp-2 italic">
                        "{item.description}"
                      </p>

                      {/* Investigation Step Progress Bar */}
                      <div className="pt-2 border-t border-zinc-800/60">
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1">
                          <span>Progress Stage: {statusInfo.label}</span>
                          <span>Stage {statusInfo.step} of 5</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${(statusInfo.step / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RECENT TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="bg-[#111111] border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                  My Recent Account Transactions
                </h3>
                <p className="text-xs text-zinc-400">
                  Select "Dispute Transaction" to directly lodge a formal fraud claim with the Cybercell.
                </p>
              </div>
              <span className="text-xs text-zinc-400 font-mono">{transactions.length} recorded events</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-800 text-zinc-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Date / Time</th>
                    <th className="py-2.5 px-3">Channel</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-[#161616] transition-colors">
                      <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">{t.transactionRef}</td>
                      <td className="py-3 px-3 text-zinc-400">{new Date(t.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                          {t.channel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-300">{t.location}</td>
                      <td className="py-3 px-3 font-bold text-zinc-100 font-mono">₹{t.amount.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          t.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          t.status === 'FLAGGED' ? 'bg-red-950 text-red-300 border border-red-800' :
                          'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDisputeTransaction(t)}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 rounded text-[11px] font-semibold transition-colors"
                        >
                          Dispute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & SURVEILLANCE FEED */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#0e1610] border border-emerald-900/60 flex items-start gap-3.5 text-xs text-zinc-300 shadow-xl">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-emerald-300">Continuous 24/7 Anomaly Protection Active</div>
                <p className="text-zinc-400 leading-relaxed">
                  Your bank account <span className="font-mono text-zinc-200">{user?.accountNumber}</span> is actively protected by bank-grade behavioral velocity heuristics and geolocation drift surveillance. All complaints lodged through this portal are instantly routed to verified forensic investigators.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Bio-Metric &amp; Device Lock
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Hardware device fingerprint binding prevents unauthorized logins from rooted emulators or foreign proxies.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">Status: ENFORCED</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Velocity Surge Protection
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Unusual burst transfers (more than 3 high-value debits in 10 minutes) automatically trigger a provisional hold.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">Status: ACTIVE (Threshold: 3 Txn/10m)</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-zinc-800 space-y-2">
                <div className="text-xs font-bold text-zinc-200 uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Direct Cybercell Link
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Lodged complaints bypass branch bureaucracy and enter the central fraud inspector's queue in under 1 second.
                </p>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">Status: CONNECTED</div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: LODGE COMPLAINT / DISPUTE */}
        {complaintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl my-8">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                    Lodge Official Fraud Grievance
                  </h3>
                </div>
                <button
                  onClick={() => setComplaintModalOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submissionResult?.success ? (
                <div className="p-6 rounded-xl bg-emerald-950/50 border border-emerald-800 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-700 flex items-center justify-center text-emerald-300 mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-emerald-300">Complaint Successfully Registered!</h4>
                    <p className="text-xs text-zinc-300">
                      Your complaint has been lodged with the Central Cyber Financial Fraud Investigation Cell.
                    </p>
                  </div>

                  <div className="p-3 bg-[#161616] border border-zinc-800 rounded-lg text-xs space-y-1 font-mono">
                    <span className="text-zinc-400 text-[10px] uppercase block">Official Case Tracking Number:</span>
                    <span className="text-lg font-bold text-emerald-400">{submissionResult.caseNumber}</span>
                  </div>

                  <div className="pt-2 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setComplaintModalOpen(false);
                        setSubmissionResult(null);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow"
                    >
                      Go to Complaints Library
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  {submissionResult?.success === false && (
                    <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-xs">
                      {submissionResult.message}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Complaint Title / Subject</label>
                    <input
                      type="text"
                      value={disputeFormData.title}
                      onChange={(e) => setDisputeFormData({ ...disputeFormData, title: e.target.value })}
                      placeholder="e.g. Unauthorized UPI debit of ₹45,000 on Google Pay"
                      className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Fraud Typology / Category *</label>
                      <select
                        value={disputeFormData.category}
                        onChange={(e) => setDisputeFormData({ ...disputeFormData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="UPI_PHISHING">UPI Phishing / Social Engineering</option>
                        <option value="MULE_ACCOUNT">Mule Account / Money Laundering</option>
                        <option value="CARD_CLONING">ATM / Debit Card Cloning</option>
                        <option value="SIM_SWAP">SIM Swap / Account Takeover</option>
                        <option value="IDENTITY_THEFT">Aadhaar / Identity Theft</option>
                        <option value="SYNDICATE_LAUNDERING">Organized Cyber Syndicate Scam</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Disputed Amount (₹)</label>
                      <input
                        type="number"
                        value={disputeFormData.disputedAmount}
                        onChange={(e) => setDisputeFormData({ ...disputeFormData, disputedAmount: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Txn Reference (If Applicable)</label>
                      <input
                        type="text"
                        value={disputeFormData.disputedTxnRef}
                        onChange={(e) => setDisputeFormData({ ...disputeFormData, disputedTxnRef: e.target.value })}
                        placeholder="e.g. TXN-94812"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-300">Suspect / Recipient VPA or Account</label>
                      <input
                        type="text"
                        value={disputeFormData.suspectAccount}
                        onChange={(e) => setDisputeFormData({ ...disputeFormData, suspectAccount: e.target.value })}
                        placeholder="e.g. suspect@okhdfcbank or ACC-XXXX"
                        className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Detailed Statement / What Occurred *</label>
                    <textarea
                      rows={3}
                      required
                      value={disputeFormData.description}
                      onChange={(e) => setDisputeFormData({ ...disputeFormData, description: e.target.value })}
                      placeholder="Please explain in detail: what time did this occur, did anyone call you claiming to be bank staff, were any OTPs or QR codes shared..."
                      className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Desired Relief / Action Requested</label>
                    <select
                      value={disputeFormData.desiredOutcome}
                      onChange={(e) => setDisputeFormData({ ...disputeFormData, desiredOutcome: e.target.value })}
                      className="w-full px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Immediate Account Freeze & Fund Reversal Request">Immediate Account Freeze &amp; Fund Reversal Request</option>
                      <option value="Formal Cyber Financial Cell Police FIR Registration">Formal Cyber Financial Cell Police FIR Registration</option>
                      <option value="Transaction Trace & Device IP Forensic Audit">Transaction Trace &amp; Device IP Forensic Audit</option>
                      <option value="Account Quarantine & Credential Invalidation">Account Quarantine &amp; Credential Invalidation</option>
                    </select>
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setComplaintModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-[#181818] text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmitting to Cybercell...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Official Complaint</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* MODAL 2: COMPLAINT DETAILS & GRIEVANCE ACKNOWLEDGEMENT */}
        {selectedCase && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl my-8">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-[#161616] px-2 py-0.5 rounded border border-zinc-800">
                      {selectedCase.caseNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusInfo(selectedCase.status).badgeClass}`}>
                      {getStatusInfo(selectedCase.status).label}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{selectedCase.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-zinc-500 hover:text-zinc-300 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Official Grievance Acknowledgement Certificate */}
              <div className="p-4 rounded-xl bg-[#161616] border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Official Grievance Acknowledgement Slip
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Ref ID: {selectedCase.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Complainant Name</span>
                    <span className="text-zinc-200 font-semibold">{user?.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Protected Account</span>
                    <span className="text-zinc-200 font-mono">{user?.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Aadhaar Reference</span>
                    <span className="text-zinc-300 font-mono">{user?.aadhaarNumber}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Filing Date / Time</span>
                    <span className="text-zinc-300">{new Date(selectedCase.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Disputed Amount</span>
                    <span className="text-emerald-400 font-mono font-bold">
                      {selectedCase.disputedAmount ? `₹${selectedCase.disputedAmount.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Assigned Cell</span>
                    <span className="text-zinc-200 font-semibold">
                      {selectedCase.assignedToName || 'Cyber Financial Crime Cell'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Progress Tracker */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Case Investigation Progression
                </h4>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                  {[
                    { label: 'Lodged', desc: 'Complaint registered' },
                    { label: 'Screened', desc: 'Risk evaluated' },
                    { label: 'Assigned', desc: 'Inspector allocated' },
                    { label: 'Action', desc: 'Freeze / Recall' },
                    { label: 'Resolved', desc: 'Discharge / Recovery' }
                  ].map((s, idx) => {
                    const currentStep = getStatusInfo(selectedCase.status).step;
                    const isDone = idx + 1 <= currentStep;
                    const isCurrent = idx + 1 === currentStep;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border transition-colors ${
                          isCurrent
                            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                            : isDone
                            ? 'bg-[#161616] border-emerald-900/60 text-zinc-300'
                            : 'bg-[#141414] border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-center gap-1">
                          {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <span>{idx + 1}.</span>}
                          <span>{s.label}</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5">{s.desc}</div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-zinc-400 italic pt-1">
                  {getStatusInfo(selectedCase.status).description}
                </p>
              </div>

              {/* Statement text */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Citizen Statement
                </h4>
                <div className="p-3 rounded-lg bg-[#161616] border border-zinc-800 text-xs text-zinc-300 leading-relaxed">
                  {selectedCase.description}
                </div>
              </div>

              {/* Add Follow-Up Note to Inspector */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Transmit Additional Statement or Evidence Note to Inspector
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="Provide additional details (e.g. Received new SMS from fraudster, found transaction receipt...)"
                    className="flex-1 bg-[#181818] border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleAddFollowUpNote(selectedCase.id)}
                    disabled={isAddingNote || !followUpNote.trim()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isAddingNote ? 'Saving...' : 'Send Note'}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#181818] hover:bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Acknowledgment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors"
                >
                  Close Dossier
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
