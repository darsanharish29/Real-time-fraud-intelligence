import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import CitizenDashboard from './pages/CitizenDashboard';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import CasesPage from './pages/CasesPage';
import TransactionsPage from './pages/TransactionsPage';
import WorkspacePage from './pages/WorkspacePage';
import RiskIntelligencePage from './pages/RiskIntelligencePage';
import NetworkAnalysisPage from './pages/NetworkAnalysisPage';
import EvidencePage from './pages/EvidencePage';
import ReportsPage from './pages/ReportsPage';
import AlertsPage from './pages/AlertsPage';
import RiskSimulatorPage from './pages/RiskSimulatorPage';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import DemoBanner from './components/common/DemoBanner';
import GlobalSearchModal from './components/common/GlobalSearchModal';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-1044');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 text-xs font-mono">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Session with Central Intelligence Engine...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login
  if (!user) {
    return <Login />;
  }

  // Citizen role -> Citizen Portal
  if (user.role === 'CITIZEN') {
    return <CitizenDashboard />;
  }

  // Investigator / Admin Main Workspace
  const handleNavigate = (tab: string, caseId?: string) => {
    if (caseId) setSelectedCaseId(caseId);
    setActiveTab(tab);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <InvestigatorDashboard onNavigate={handleNavigate} />;
      case 'cases':
        return (
          <CasesPage
            onOpenWorkspace={(caseId) => {
              setSelectedCaseId(caseId);
              setActiveTab('workspace');
            }}
          />
        );
      case 'transactions':
        return <TransactionsPage />;
      case 'workspace':
        return <WorkspacePage initialCaseId={selectedCaseId} />;
      case 'risk':
      case 'analytics':
        return (
          <RiskIntelligencePage
            onInvestigateAccount={(acc) => {
              setActiveTab('transactions');
            }}
            onOpenCase={(caseId) => {
              setSelectedCaseId(caseId);
              setActiveTab('workspace');
            }}
          />
        );
      case 'network':
        return <NetworkAnalysisPage />;
      case 'evidence':
        return <EvidencePage />;
      case 'reports':
        return <ReportsPage />;
      case 'alerts':
        return (
          <AlertsPage
            onInvestigateAccount={(acc) => {
              setActiveTab('transactions');
            }}
          />
        );
      case 'simulator':
        return <RiskSimulatorPage />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <InvestigatorDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#f5f5f5] flex flex-col selection:bg-emerald-900 selection:text-emerald-200">
      <DemoBanner />
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 overflow-y-auto p-6 bg-[#080808]">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectCase={(caseId) => {
          setSelectedCaseId(caseId);
          setActiveTab('workspace');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
