import React from 'react';
import {
  Eye,
  EyeOff,
  RotateCcw,
  Moon,
  Sun,
  Home,
  Layers,
  Wallet,
  PieChart,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';

interface HeaderProps {
  deviceViewMode?: 'desktop' | 'mobile-frame';
  setDeviceViewMode?: (mode: 'desktop' | 'mobile-frame') => void;
}

export const Header: React.FC<HeaderProps> = ({
  deviceViewMode = 'desktop',
  setDeviceViewMode,
}) => {
  const {
    activeTab,
    setActiveTab,
    hideBalances,
    setHideBalances,
    resetToDemoData,
    isDarkMode,
    toggleDarkMode,
    openNewExpenseModal,
    openDistributeIncomeModal,
    subaccounts,
    incomeSources,
  } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: typeof Home; count?: number }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'subaccounts', label: 'Subcontas & Envelopes', icon: Layers, count: subaccounts.length },
    { id: 'incomes', label: 'Fontes de Renda', icon: Wallet, count: incomeSources.filter((s) => s.active).length },
    { id: 'reports', label: 'Relatórios', icon: PieChart },
  ];

  return (
    <header className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white px-4 sm:px-6 py-3.5 sm:py-4 rounded-b-[24px] sm:rounded-2xl shadow-lg border border-white/10 dark:border-white/5 relative z-20 transition-all">
      {/* Specular top highlight line */}
      <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-between gap-4">
        {/* User Info & Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/90 to-amber-400 p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-amber-400 text-xs tracking-wider border border-white/10">
                PS
              </div>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-xs"
              title="Conta Ativa"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span>Olá,</span>
              <span className="text-white font-bold">Paulo Sanguli</span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Finanças
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                AO
              </span>
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on desktop when not in mobile-frame) */}
        {deviceViewMode === 'desktop' && (
          <nav className="hidden lg:flex items-center gap-1 bg-white/10 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-white/10">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-200 hover:text-amber-200 hover:bg-amber-500/10'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-white/15 text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          {/* Quick CTA Buttons for Desktop */}
          {deviceViewMode === 'desktop' && (
            <div className="hidden xl:flex items-center gap-2 mr-2">
              <button
                id="btn-desktop-new-expense"
                onClick={() => openNewExpenseModal()}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <ArrowDownLeft size={15} className="stroke-[2.5]" />
                <span>+ Novo Gasto</span>
              </button>

              <button
                id="btn-desktop-distribute-income"
                onClick={() => openDistributeIncomeModal()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
              >
                <ArrowUpRight size={15} className="stroke-[2.5]" />
                <span>+ Distribuir Renda</span>
              </button>
            </div>
          )}

          {/* Device View Mode Switcher (Desktop vs Mobile Frame) */}
          {setDeviceViewMode && (
            <div className="hidden sm:flex items-center bg-white/10 dark:bg-slate-900/80 p-0.5 rounded-xl border border-white/15">
              <button
                type="button"
                onClick={() => setDeviceModeTo('desktop')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  deviceViewMode === 'desktop'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
                title="Modo Computador / Desktop Completo"
              >
                <Monitor size={15} />
              </button>
              <button
                type="button"
                onClick={() => setDeviceModeTo('mobile-frame')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  deviceViewMode === 'mobile-frame'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-amber-500/10'
                }`}
                title="Simulador de Telemóvel"
              >
                <Smartphone size={15} />
              </button>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            id="btn-toggle-dark-mode"
            type="button"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={isDarkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/15 backdrop-blur-md active:scale-95 shadow-xs"
          >
            {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>

          {/* Balance Visibility Toggle */}
          <button
            id="btn-toggle-visibility"
            type="button"
            onClick={() => setHideBalances((prev) => !prev)}
            aria-label={hideBalances ? 'Mostrar saldos' : 'Ocultar saldos'}
            title={hideBalances ? 'Mostrar saldos' : 'Ocultar saldos'}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/15 backdrop-blur-md active:scale-95 shadow-xs"
          >
            {hideBalances ? <EyeOff size={17} className="text-amber-400" /> : <Eye size={17} />}
          </button>

          {/* Reset Demo Data */}
          <button
            id="btn-reset-demo"
            type="button"
            onClick={() => {
              if (window.confirm('Desejas restaurar os dados de demonstração iniciais?')) {
                resetToDemoData();
              }
            }}
            aria-label="Restaurar dados de teste"
            title="Restaurar dados de demonstração"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all border border-white/15 backdrop-blur-md active:scale-95 shadow-xs"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
    </header>
  );

  function setDeviceModeTo(mode: 'desktop' | 'mobile-frame') {
    if (setDeviceViewMode) {
      setDeviceViewMode(mode);
    }
  }
};

