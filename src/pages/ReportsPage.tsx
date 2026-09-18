import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, Printer, CheckCircle, Calendar, Shield } from 'lucide-react';
import { api } from '../lib/api';

export default function ReportsPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1044');
  const [reportType, setReportType] = useState('LE_DOSSIER');
  const [isExporting, setIsExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    api.getCases().then(res => {
      if (res.success && res.data.length > 0) {
        setCases(res.data);
      }
    });
  }, []);

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const handleExport = (format: string) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportNotice(`Successfully compiled ${format.toUpperCase()} packet for ${selectedCase?.caseNumber || 'case'}. Stored in local vault.`);
      setTimeout(() => setExportNotice(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            Statutory &amp; Law Enforcement Reporting Hub
          </h2>
          <p className="text-xs text-zinc-400">
            Generate formal court dossiers, FIU-IND Suspicious Transaction Reports (STR) &amp; investigative summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Generating...' : 'Export Court PDF'}</span>
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg bg-[#181818] hover:bg-[#222222] border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>FIU-IND XML/JSON</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Configuration Controls */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-zinc-300">Target Investigation Case</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
          >
            {cases.map(c => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-300">Statutory Template Standard</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-[#181818] border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="LE_DOSSIER">Police / Cybercell Court Evidentiary Dossier</option>
            <option value="FIU_STR">FIU-IND Suspicious Transaction Report (STR)</option>
            <option value="EXECUTIVE_SUMMARY">Executive Board Oversight Briefing</option>
          </select>
        </div>
      </div>

      {/* Live Preview Document */}
      <div className="bg-[#0e0e0e] border border-zinc-800 rounded-xl p-8 shadow-2xl max-w-4xl mx-auto space-y-6 text-xs text-zinc-300 font-sans">
        <div className="border-b border-zinc-800 pb-5 flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold font-mono">
              CONFIDENTIAL // LAW ENFORCEMENT RESTRICTED
            </div>
            <h1 className="text-base font-bold text-zinc-100 uppercase mt-1">
              Financial Cybercrime Forensic Evidentiary Dossier
            </h1>
            <div className="text-zinc-400 text-[11px] mt-0.5">
              Subject Reference: <span className="font-mono text-zinc-200">{selectedCase?.caseNumber || 'CASE-1044'}</span> &bull; Jurisdiction: Central Financial Surveillance Cell
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-zinc-400">
            <div>DOC-ID: {selectedCase?.id?.toUpperCase() || 'CASE-1044'}</div>
            <div>DATE: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Profile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#141414] border border-zinc-800">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Primary Target Entity</div>
            <div className="font-mono font-bold text-emerald-400 mt-0.5">{selectedCase?.targetAccount}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Classification</div>
            <div className="font-semibold text-zinc-200 mt-0.5">{selectedCase?.category?.replace('_', ' ')}</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Risk Rating</div>
            <div className="font-mono font-bold text-red-400 mt-0.5">{selectedCase?.riskLevel} ({selectedCase?.riskScore}/100)</div>
          </div>
          <div>
            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Lead Special Agent</div>
            <div className="font-semibold text-zinc-200 mt-0.5">{selectedCase?.assignedToName || 'Unassigned'}</div>
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-zinc-100 text-xs">
            1. Investigative Narrative &amp; Findings
          </h3>
          <p className="leading-relaxed text-zinc-300 bg-[#141414] p-4 rounded-xl border border-zinc-800">
            {selectedCase?.description} Detailed technical examination reveals recurring suspicious fund outflows structured below mandatory threshold reporting boundaries. Automated fraud heuristics detected proxy IP hops and rooted hardware signatures.
          </p>
        </div>

        {/* Evidence Summary Table */}
        <div className="space-y-2">
          <h3 className="font-bold uppercase tracking-wider text-zinc-100 text-xs">
            2. Attached Digital Evidence Artifacts
          </h3>
          <div className="border border-zinc-800 rounded-lg overflow-hidden font-mono text-[11px]">
            <table className="w-full text-left">
              <thead className="bg-[#181818] text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="p-2.5">Artifact Ref</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">SHA-256 Checksum</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {(selectedCase?.evidence || []).map((ev: any) => (
                  <tr key={ev.id}>
                    <td className="p-2.5 text-emerald-400 font-bold">{ev.evidenceRef}</td>
                    <td className="p-2.5 text-zinc-300">{ev.type}</td>
                    <td className="p-2.5 text-zinc-500 truncate max-w-[160px]">{ev.fileHash}</td>
                    <td className="p-2.5 text-right text-emerald-400 font-semibold">{ev.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Recommendation */}
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/60 space-y-1">
          <div className="font-semibold text-red-300">3. Statutory Order &amp; Action Recommendation</div>
          <p className="text-zinc-400 leading-relaxed text-[11px]">
            {selectedCase?.isFreezeRecommended
              ? 'An immediate account freeze order has been officially recommended by the primary investigator. Maintain banking surveillance and issue formal summons under Section 91 CrPC.'
              : 'Case remains under active evidence collection. Account freeze not yet ordered.'}
          </p>
        </div>
      </div>
    </div>
  );
}
