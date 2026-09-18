import React, { useState, useEffect } from 'react';
import { Search, X, FolderGit2, Activity, Bell, FileText, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseId: string) => void;
  onSelectAccount?: (acc: string) => void;
}

export default function GlobalSearchModal({ isOpen, onClose, onSelectCase }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ cases: any[]; txns: any[]; alerts: any[] }>({
    cases: [],
    txns: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ cases: [], txns: [], alerts: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ cases: [], txns: [], alerts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [caseRes, txnRes, alertRes] = await Promise.all([
          api.getCases({ query }),
          api.getTransactions(undefined, 20),
          api.getAlerts()
        ]);

        const q = query.toLowerCase();
        const filteredTxns = (txnRes.data || []).filter(t =>
          t.transactionRef.toLowerCase().includes(q) ||
          t.accountNumber.toLowerCase().includes(q) ||
          t.deviceId.toLowerCase().includes(q)
        );

        const filteredAlerts = (alertRes.data || []).filter(a =>
          a.alertCode.toLowerCase().includes(q) ||
          a.relatedAccount.toLowerCase().includes(q) ||
          a.title.toLowerCase().includes(q)
        );

        setResults({
          cases: caseRes.data || [],
          txns: filteredTxns,
          alerts: filteredAlerts,
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-zinc-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-3 border-b border-zinc-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-emerald-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Case ID (CASE-1044), Account (DEMO-ACC-2048), Txn (TXN-89201)..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-6 text-xs text-zinc-500">Searching records...</div>
          )}

          {!loading && !query && (
            <div className="text-center py-8 text-xs text-zinc-500">
              Type an identifier, device, or keyword to query intelligence database.
            </div>
          )}

          {!loading && query && results.cases.length === 0 && results.txns.length === 0 && results.alerts.length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-400">
              No matching cases, transactions, or alerts found for "{query}".
            </div>
          )}

          {/* Cases */}
          {results.cases.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                Fraud Cases ({results.cases.length})
              </div>
              <div className="space-y-1.5">
                {results.cases.slice(0, 5).map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      if (onSelectCase) onSelectCase(c.id);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-[#161616] hover:bg-[#1f1f1f] border border-zinc-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-emerald-400 font-semibold">{c.caseNumber}</span>
                        <span className="text-xs text-zinc-200">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Target Account: <span className="font-mono text-zinc-400">{c.targetAccount}</span> &bull; Status: {c.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {results.txns.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                Transactions ({results.txns.length})
              </div>
              <div className="space-y-1.5">
                {results.txns.slice(0, 4).map(t => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-medium">{t.transactionRef}</span>
                        <span className="text-zinc-200 font-semibold">₹{t.amount.toLocaleString()}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                          t.riskLevel === 'CRITICAL' ? 'bg-red-950 text-red-300' : 'bg-zinc-800 text-zinc-300'
                        }`}>
                          {t.riskLevel}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Account: <span className="font-mono text-zinc-400">{t.accountNumber}</span> &bull; {t.location} &bull; {t.channel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts */}
          {results.alerts.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                Security Alerts ({results.alerts.length})
              </div>
              <div className="space-y-1.5">
                {results.alerts.slice(0, 3).map(a => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-[#161616] border border-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-400 font-medium">{a.alertCode}</span>
                        <span className="text-zinc-200 font-medium">{a.title}</span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Account: <span className="font-mono text-zinc-400">{a.relatedAccount}</span> &bull; Occurrences: {a.occurrenceCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
