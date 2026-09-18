import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle, Search, RefreshCw, Filter, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { SystemAlert } from '../types';

interface AlertsPageProps {
  onInvestigateAccount: (acc: string) => void;
}

export default function AlertsPage({ onInvestigateAccount }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts();
      if (res.success) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpdateStatus = (id: string, newStatus: any) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filtered = alerts.filter(a => {
    const matchesSev = severityFilter === 'ALL' || a.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSev && matchesStatus;
  });

  const getSeverityBadge = (s: string) => {
    switch (s) {
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 uppercase flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            Security Anomaly &amp; Alert Center
          </h2>
          <p className="text-xs text-zinc-400">
            Deduplicated real-time threat signals, recurring account alerts &amp; heuristic anomaly dispatches
          </p>
        </div>

        <button
          onClick={() => fetchAlerts()}
          className="p-2 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] border border-zinc-800 text-zinc-400 hover:text-emerald-400 text-xs flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111111] border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#181818] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#181818] border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INVESTIGATING">Investigating</option>
            <option value="RESOLVED">Resolved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map(alert => (
          <div
            key={alert.id}
            className="bg-[#111111] border border-zinc-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-red-400">{alert.alertCode}</span>
                <span className={`px-2 py-0.2 rounded border font-mono text-[10px] font-semibold ${getSeverityBadge(alert.severity)}`}>
                  {alert.severity}
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">
                  {alert.occurrenceCount > 1 ? `Grouped ${alert.occurrenceCount} recurring events` : 'Single event'}
                </span>
              </div>

              <h3 className="font-bold text-zinc-100 text-sm">{alert.title}</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">{alert.triggerReason}</p>

              <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1 font-mono">
                <span>Target: <strong className="text-emerald-400">{alert.relatedAccount}</strong></span>
                <span>Detected: {new Date(alert.timestamp || alert.createdAt || '').toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
              <select
                value={alert.status}
                onChange={(e) => handleUpdateStatus(alert.id, e.target.value)}
                className="bg-[#181818] border border-zinc-700 rounded-md px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="OPEN">Status: OPEN</option>
                <option value="INVESTIGATING">Status: INVESTIGATING</option>
                <option value="RESOLVED">Status: RESOLVED</option>
                <option value="DISMISSED">Status: DISMISSED</option>
              </select>

              <button
                onClick={() => onInvestigateAccount(alert.relatedAccount)}
                className="px-3 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Investigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="p-8 text-center text-xs text-zinc-400 bg-[#111111] border border-zinc-800 rounded-xl">
            No security alerts found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
