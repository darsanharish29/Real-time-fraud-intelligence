import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Activity,
  Workflow,
  TrendingUp,
  Share2,
  FileCheck2,
  FileSpreadsheet,
  BarChart3,
  Bell,
  SlidersHorizontal,
  AlertTriangle,
  Users,
  ScrollText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavItem =
  | 'dashboard'
  | 'cases'
  | 'transactions'
  | 'workspace'
  | 'risk'
  | 'network'
  | 'evidence'
  | 'reports'
  | 'analytics'
  | 'alerts'
  | 'simulator'
  | 'admin'
  | 'users'
  | 'audit';

interface SidebarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: any) => void;
  onTabChange?: (tab: string) => void;
  badgeCounts?: {
    alerts?: number;
    highRiskCases?: number;
  };
}

export default function Sidebar({ currentTab, activeTab, onSelectTab, onTabChange, badgeCounts }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const selectedTab = activeTab || currentTab || 'dashboard';
  const handleSelect = (tab: string) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab as any);
  };

  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'cases' as NavItem, label: 'My Cases', icon: FolderGit2, badge: badgeCounts?.highRiskCases },
    { id: 'transactions' as NavItem, label: 'Live Transactions', icon: Activity, live: true },
    { id: 'workspace' as NavItem, label: 'Investigator Workspace', icon: Workflow },
    { id: 'risk' as NavItem, label: 'Risk Intelligence', icon: TrendingUp },
    { id: 'network' as NavItem, label: 'Network Analysis', icon: Share2 },
    { id: 'evidence' as NavItem, label: 'Evidence', icon: FileCheck2 },
    { id: 'reports' as NavItem, label: 'Reports', icon: FileSpreadsheet },
    { id: 'analytics' as NavItem, label: 'Analytics', icon: BarChart3 },
    { id: 'alerts' as NavItem, label: 'Alerts', icon: Bell, badge: badgeCounts?.alerts, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'simulator' as NavItem, label: 'Risk Simulator', icon: SlidersHorizontal }
  ];

  const adminItems = [
    { id: 'admin' as NavItem, label: 'Platform Admin', icon: Users },
    { id: 'admin' as NavItem, label: 'System Audit Logs', icon: ScrollText }
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/80 flex flex-col justify-between shrink-0 min-h-[calc(100vh-80px)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">
            Investigation Suite
          </div>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = selectedTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.live && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          item.badgeColor || 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {isAdmin && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-3 mb-2">
              Administration
            </div>
            <nav className="space-y-1">
              {adminItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = selectedTab === 'admin';
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect('admin')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-zinc-500'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Repeated Account Quick Alert Widget in Sidebar */}
      <div className="p-4 border-t border-zinc-800/80 bg-[#0d0d0d]">
        <div className="p-2.5 rounded-md bg-[#141414] border border-zinc-800 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-300 font-semibold">
            <span className="flex items-center gap-1 text-emerald-400">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              Watchlist Anomaly
            </span>
            <span className="text-[9px] bg-red-950 text-red-300 px-1 py-0.5 rounded border border-red-800">
              3 Cases
            </span>
          </div>
          <p className="text-zinc-400 text-[10px] leading-tight">
            Account <span className="text-zinc-200 font-mono font-medium">DEMO-ACC-2048</span> linked to 7 active alerts.
          </p>
          <button
            onClick={() => handleSelect('workspace')}
            className="w-full text-center py-1 text-[10px] bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-800 rounded font-medium transition-colors"
          >
            Review Watchlist Case &rarr;
          </button>
        </div>
      </div>
    </aside>
  );
}
