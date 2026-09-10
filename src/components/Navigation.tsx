import React, { useRef, useState } from 'react';
import {
  Home,
  Calendar,
  ShoppingCart,
  Truck,
  UserX,
  History,
  Settings,
  Menu,
  X,
  Droplets,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { TlalocEmblem } from './TlalocEmblem';
import { useTlaloc } from '../context/TlalocContext';

interface NavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { todayAssignment } = useTlaloc();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: Home },
    { id: 'calendario', label: 'Calendario', icon: Calendar },
    { id: 'compra', label: 'Compra', icon: ShoppingCart },
    { id: 'cargado', label: 'Cargado', icon: Truck },
    { id: 'disponibilidad', label: 'Disponibilidad', icon: UserX },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  const handleSelect = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    logoClickCount.current += 1;

    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);

    if (logoClickCount.current === 5) {
      logoClickCount.current = 0;
      handleSelect('personas');
      return;
    }

    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 2000);
    handleSelect('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#081b2e]/95 backdrop-blur-md border-b border-cyan-900/60 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo & Mesoamerican Brand */}
          <div
            id="nav-brand-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <TlalocEmblem size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Cinzel',serif] text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300">
                  TLÁLOC
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  {todayAssignment.garrafonesCount} Garrafón{todayAssignment.garrafonesCount > 1 ? 'es' : ''} Hoy
                </span>
              </div>
              <p className="text-[11px] text-cyan-400/80 tracking-wide font-medium hidden md:block">
                El agua es responsabilidad de todos
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-200 bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 lg:hidden">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              <Droplets className="w-3 h-3 text-cyan-400" />
              {todayAssignment.garrafonesCount} G.
            </span>
            <button
              id="nav-mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-cyan-950 border border-cyan-900/50 focus:outline-none"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-cyan-300" />
              ) : (
                <Menu className="w-6 h-6 text-cyan-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="nav-mobile-drawer"
          className="lg:hidden bg-[#061626] border-b border-cyan-900/80 px-4 pt-3 pb-5 space-y-1 shadow-2xl"
        >
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-mobile-tab-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950 to-teal-950 text-cyan-200 border border-cyan-500/60 shadow-md'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 border border-slate-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-cyan-300' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-[10px] text-cyan-500/70 pt-3 italic">
            Tláloc: El agua es responsabilidad de todos
          </p>
        </div>
      )}
    </header>
  );
};
