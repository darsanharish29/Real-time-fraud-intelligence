import React, { useState } from 'react';
import { Shield, Search, LogOut, UserCircle, Bell, RefreshCw, ChevronDown, Check, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface HeaderProps {
  onOpenSearch?: () => void;
  title?: string;
}

export default function Header({ onOpenSearch, title }: HeaderProps) {
  const { user, logout, health, checkHealth, quickSwitchRole } = useAuth();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'SENIOR_INVESTIGATOR':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'INVESTIGATOR':
        return 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50';
      case 'CITIZEN':
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  const handleQuickSwitch = async (role: Role) => {
    setSwitching(true);
    setSwitcherOpen(false);
    await quickSwitchRole(role);
    setSwitching(false);
  };

  const personas = [
    {
      role: 'CITIZEN' as Role,
      title: 'Citizen Portal',
      subtitle: localStorage.getItem('last_citizen_name') ? `${localStorage.getItem('last_citizen_name')} (Your Account)` : 'Ramesh Chandra (Citizen)',
      badge: 'CITIZEN',
      badgeColor: 'text-zinc-300 border-zinc-700 bg-zinc-800/60'
    },
    {
      role: 'INVESTIGATOR' as Role,
      title: 'Lead Forensic Investigator',
      subtitle: 'Vikram Sengupta (FCU Assigned Lead)',
      badge: 'INVESTIGATOR',
      badgeColor: 'text-emerald-400 border-emerald-800/60 bg-emerald-950/50'
    },
    {
      role: 'SENIOR_INVESTIGATOR' as Role,
      title: 'Senior Supervisory Investigator',
      subtitle: 'Dr. Priya Nambiar (Freeze Authority)',
      badge: 'SENIOR_INVESTIGATOR',
      badgeColor: 'text-teal-300 border-teal-700/60 bg-teal-950/50'
    },
    {
      role: 'ADMIN' as Role,
      title: 'System Root Administrator',
      subtitle: 'Rajeshwer Mehra (Audit & Governance)',
      badge: 'ADMIN',
      badgeColor: 'text-purple-300 border-purple-700/60 bg-purple-950/50'
    }
  ];

  return (
    <header className="bg-[#0a0a0a] border-b border-zinc-800/80 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center border border-emerald-500/40 shadow-sm shadow-emerald-950">
            <Shield className="w-4 h-4 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
              Fraud Intelligence &amp; Investigation Platform
            </h1>
            <p className="text-[11px] text-zinc-400">
              {title || 'Financial Cybercrime & Risk Intelligence System'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Role / Persona Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setSwitcherOpen(!switcherOpen)}
            disabled={switching}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 text-xs text-zinc-200 transition-colors shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-[11px]">
              View as: <span className="text-emerald-300">{user?.role?.replace('_', ' ')}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {switcherOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#131313] border border-zinc-700 shadow-2xl p-2 z-50 divide-y divide-zinc-800">
              <div className="px-3 py-2 text-[11px] text-zinc-400 font-medium">
                Test Complaint Flow (Switch Perspectives):
              </div>
              <div className="py-1 space-y-1">
                {personas.map(p => {
                  const isActive = user?.role === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleQuickSwitch(p.role)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-emerald-950/40 border border-emerald-800/60 text-zinc-100'
                          : 'hover:bg-zinc-800/70 text-zinc-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold flex items-center gap-1.5 text-zinc-200">
                          {p.title}
                          {isActive && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-mono truncate max-w-[190px]">
                          {p.subtitle}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                        {p.role === 'SENIOR_INVESTIGATOR' ? 'SENIOR' : p.role}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#141414] border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500" />
            <span>Search Case, Account, Txn...</span>
            <kbd className="text-[10px] bg-zinc-800 px-1 py-0.5 rounded text-zinc-400 font-mono">⌘K</kbd>
          </button>
        )}

        <button
          onClick={() => checkHealth()}
          title="Refresh backend status"
          className="p-1.5 rounded-md text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${health.checking ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
            <div className="text-right">
              <div className="text-xs font-medium text-zinc-200">{user.name}</div>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {user.accountNumber}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-2 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-950 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
