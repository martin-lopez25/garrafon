import React, { useState } from 'react';
import { TlalocProvider } from './context/TlalocContext';
import { Navigation } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { CalendarView } from './views/CalendarView';
import { CompraView } from './views/CompraView';
import { PersonasView } from './views/PersonasView';
import { DisponibilidadView } from './views/DisponibilidadView';
import { HistorialView } from './views/HistorialView';
import { ConfiguracionView } from './views/ConfiguracionView';
import { AmbientRain } from './components/AmbientRain';
import { CodexBorder } from './components/CodexPattern';
import { NavigationTab } from './types';
import { Droplets } from 'lucide-react';
import logoImage from '../imagen/logo.jpg';

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  const renderView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentTab} />;
      case 'calendario':
        return <CalendarView />;
      case 'compra':
        return <CompraView />;
      case 'personas':
        return <PersonasView />;
      case 'disponibilidad':
        return <DisponibilidadView />;
      case 'historial':
        return <HistorialView />;
      case 'configuracion':
        return <ConfiguracionView />;
      default:
        return <DashboardView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#040f1a] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-slate-950 relative isolate overflow-x-hidden">
      <div id="tlaloc-screen-background" aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img src={logoImage} alt="" className="w-full h-full object-contain opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040f1a]/30 via-[#040f1a]/45 to-[#040f1a]/80" />
      </div>
      {/* Mesoamerican Codex Ambient Water Rain */}
      <AmbientRain />

      {/* Top Navigation */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 z-10">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className={`w-full mt-auto py-8 z-10 text-center ${currentTab === 'dashboard' ? '' : 'bg-[#030a12]/80 border-t border-cyan-950/80'}`}>
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <CodexBorder variant="subtle" />
          <div className="flex items-center justify-center gap-2 text-cyan-400/80 text-xs font-semibold">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-['Cinzel',serif] tracking-wider text-sm text-cyan-200">
              TLÁLOC
            </span>
            <span>•</span>
            <span>El agua es responsabilidad de todos</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            Sistema mesoamericano de justicia distributiva para el abasto y transporte de garrafones de agua entre 12 compañeros de trabajo.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TlalocProvider>
      <AppContent />
    </TlalocProvider>
  );
}
