import React, { useState, useEffect } from 'react';
import { FolderGit2, Search, Filter, ArrowUpDown, ChevronRight, UserPlus, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { FraudCase } from '../types';

interface CasesPageProps {
  onOpenWorkspace: (caseId: string) => void;
}

export default function CasesPage({ onOpenWorkspace }: CasesPageProps) {
  const [cases, setCases] = useState<FraudCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.getCases({
        riskLevel: riskFilter,
        status: statusFilter,
        category: categoryFilter,
        query: searchQuery
      });
      if (res.success) {
        setCases(res.data);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [riskFilter, statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'ASSIGNED':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'UNDER_INVESTIGATION':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'ESCALATED':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            Case Management Records
          </h2>
          <p className="text-xs text-zinc-400">
            Active investigations, evidence trails, cross-jurisdictional syndicate tracking &amp; status governance
          </p>
        </div>

        <button
          onClick={() => fetchCases()}
          className="p-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-emerald-400 text-xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, keyword, target account..."
              className="w-full pl-9 pr-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </form>

          {/* Risk Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-[#181818] border border-zinc-700/80 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical (80-100)</option>
              <option value="HIGH">High (60-79)</option>
              <option value="MEDIUM">Medium (30-59)</option>
              <option value="LOW">Low (0-29)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#181818] border border-zinc-700/80 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#181818] border border-zinc-700/80 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="MULE_ACCOUNT">Mule Account</option>
              <option value="IDENTITY_THEFT">Identity Theft</option>
              <option value="UPI_PHISHING">UPI Phishing</option>
              <option value="CARD_CLONING">Card Cloning</option>
              <option value="SYNDICATE_LAUNDERING">Syndicate Laundering</option>
              <option value="SIM_SWAP">SIM Swap</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Case ID</th>
                <th className="py-3 px-4 font-semibold">Title &amp; Target Account</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Risk Rating</th>
                <th className="py-3 px-4 font-semibold">Assigned Investigator</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Created / Updated</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {cases.map(c => (
                <tr
                  key={c.id}
                  onClick={() => onOpenWorkspace(c.id)}
                  className="hover:bg-[#161616] cursor-pointer group transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 group-hover:underline">
                    {c.caseNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      Target: <span className="font-mono text-zinc-300 font-semibold">{c.targetAccount}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                      {c.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${getRiskBadge(c.riskLevel)}`}>
                      {c.riskLevel} ({c.riskScore})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300 font-medium">
                    {c.assignedToName || <span className="text-zinc-500 italic">Unassigned</span>}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getStatusBadge(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 text-[11px] font-mono">
                    <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                    <div className="text-zinc-500 text-[10px]">{new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWorkspace(c.id);
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-semibold transition-colors"
                    >
                      Workspace &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {cases.length === 0 && !loading && (
          <div className="p-8 text-center text-xs text-zinc-400">
            No cases match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
