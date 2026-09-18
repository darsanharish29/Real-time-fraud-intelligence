import React, { useState, useEffect } from 'react';
import { FileCheck2, Plus, Search, ShieldCheck, Download, ExternalLink, Filter } from 'lucide-react';
import { api } from '../lib/api';

export default function EvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    // Fetch cases and compile evidence
    api.getCases().then(res => {
      if (res.success) {
        const allEv = res.data.flatMap((c: any) =>
          (c.evidence || []).map((e: any) => ({ ...e, caseNumber: c.caseNumber, caseTitle: c.title }))
        );
        setEvidenceList(allEv);
      }
      setLoading(false);
    });
  }, []);

  const filtered = evidenceList.filter(e => {
    const matchesSearch = !search ||
      e.evidenceRef.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.caseNumber.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'ALL' || e.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            Digital Forensics &amp; Evidence Repository
          </h2>
          <p className="text-xs text-zinc-400">
            Immutable cryptographically-hashed artifacts, transaction logs, device extracts &amp; legal evidence chains
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono">
            SHA-256 Chain of Custody Verified
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search evidence ref, case ID, description..."
            className="w-full pl-9 pr-3 py-2 bg-[#181818] border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-[#181818] border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Classifications</option>
          <option value="TRANSACTION_RECORD">Transaction Record</option>
          <option value="DEVICE_INFO">Device Telemetry</option>
          <option value="LOGIN_EVENT">Login / WAF Event</option>
          <option value="GEO_EVENT">Geo / Cell Match</option>
          <option value="SYSTEM_ALERT">Alert Trigger</option>
        </select>
      </div>

      {/* Evidence Cards / List */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161616] border-b border-zinc-800 text-zinc-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-semibold">Evidence Ref</th>
                <th className="py-3 px-4 font-semibold">Associated Case</th>
                <th className="py-3 px-4 font-semibold">Classification</th>
                <th className="py-3 px-4 font-semibold">Description &amp; Findings</th>
                <th className="py-3 px-4 font-semibold">SHA-256 Digest</th>
                <th className="py-3 px-4 font-semibold">Logged By / Timestamp</th>
                <th className="py-3 px-4 font-semibold text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 font-mono">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-[#161616] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{e.evidenceRef}</td>
                  <td className="py-3.5 px-4 font-bold text-zinc-200">{e.caseNumber}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                      {e.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-sans text-zinc-300 max-w-xs">{e.description}</td>
                  <td className="py-3.5 px-4 text-zinc-500 text-[11px] truncate max-w-[140px]">{e.fileHash}</td>
                  <td className="py-3.5 px-4 font-sans text-zinc-400 text-[11px]">
                    <div>{e.uploadedBy}</div>
                    <div className="text-zinc-500 text-[10px]">{new Date(e.timestamp).toLocaleString()}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-sans font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{e.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="p-8 text-center text-xs text-zinc-400 font-sans">
            No evidence artifacts found matching your filter criteria.
          </div>
        )}
      </div>
    </div>
  );
}
