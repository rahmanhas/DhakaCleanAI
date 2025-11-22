import React, { useState } from 'react';
import { LayoutDashboard, ScanLine, MessageCircle, Map } from 'lucide-react';
import WasteScanner from './components/WasteScanner';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SCANNER);

  // Navigation Item Helper
  const NavItem = ({ targetView, icon: Icon, label }: { targetView: AppView, icon: any, label: string }) => (
    <button
      onClick={() => setView(targetView)}
      className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
        view === targetView 
          ? 'text-emerald-600 scale-105' 
          : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon size={24} strokeWidth={view === targetView ? 2.5 : 2} />
      <span className="text-[10px] font-medium mt-1">{label}</span>
      {view === targetView && (
        <span className="absolute top-0 w-8 h-1 bg-emerald-600 rounded-b-lg shadow-[0_0_8px_rgba(5,150,105,0.5)]"></span>
      )}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 w-full max-w-5xl mx-auto shadow-2xl overflow-hidden">
      
      {/* Header (Mobile & Desktop) */}
      <header className="h-14 bg-white border-b flex items-center justify-center px-6 shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                D
            </div>
            <h1 className="font-bold text-xl text-slate-800 tracking-tight">
                Dhaka<span className="text-emerald-600">CleanAI</span>
            </h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === AppView.SCANNER ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <WasteScanner />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === AppView.DASHBOARD ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <Dashboard />
        </div>
        <div className={`absolute inset-0 transition-opacity duration-300 ${view === AppView.CHAT ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
            <ChatAssistant />
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="h-20 bg-white border-t shrink-0 grid grid-cols-3 pb-4 pt-1 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <NavItem targetView={AppView.SCANNER} icon={ScanLine} label="Scanner" />
        <NavItem targetView={AppView.DASHBOARD} icon={LayoutDashboard} label="City Data" />
        <NavItem targetView={AppView.CHAT} icon={MessageCircle} label="Assistant" />
      </nav>

    </div>
  );
};

export default App;