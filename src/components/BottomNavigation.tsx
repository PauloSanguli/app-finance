import React, { useState } from 'react';
import {
  Home,
  Layers,
  Wallet,
  PieChart,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types';

interface BottomNavigationProps {
  deviceViewMode?: 'desktop' | 'mobile-frame';
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  deviceViewMode = 'desktop',
}) => {
  const {
    activeTab,
    setActiveTab,
    openNewExpenseModal,
    openDistributeIncomeModal,
  } = useFinance();

  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'subaccounts', label: 'Subcontas', icon: Layers },
    { id: 'incomes', label: 'Rendas', icon: Wallet },
    { id: 'reports', label: 'Relatórios', icon: PieChart },
  ];

  return (
    <>
      {/* Floating Action Menu Popover */}
      <AnimatePresence>
        {isFabMenuOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-center pb-24 px-5">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsFabMenuOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="relative z-50 w-full max-w-xs bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-3 shadow-2xl border border-white/80 dark:border-slate-800 flex flex-col gap-2"
            >
              <button
                id="btn-fab-new-expense"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  openNewExpenseModal();
                }}
                className="w-full p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-900/50 backdrop-blur-md border border-rose-200/80 dark:border-rose-800/60 flex items-center gap-3 text-left transition-all active:scale-95 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ArrowDownLeft size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Registar Novo Gasto
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saída imediata de um envelope
                  </span>
                </div>
              </button>

              <button
                id="btn-fab-distribute-income"
                onClick={() => {
                  setIsFabMenuOpen(false);
                  openDistributeIncomeModal();
                }}
                className="w-full p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/90 dark:hover:bg-emerald-900/50 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-3 text-left transition-all active:scale-95 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ArrowUpRight size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Distribuir Nova Renda
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Repartir salário pelos envelopes
                  </span>
                </div>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Bottom Bar (Visible on mobile screens or in mobile-frame mode) */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none ${
          deviceViewMode === 'desktop' ? 'lg:hidden' : ''
        }`}
      >
        <div className="w-full max-w-md bg-white/85 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/90 shadow-2xl px-3 py-2 flex items-center justify-around pointer-events-auto rounded-t-3xl sm:rounded-[32px] sm:mb-3 sm:mx-3 sm:border sm:border-slate-200/80 dark:sm:border-slate-800/90 transition-colors">

          {/* Left Tabs (Home & Subaccounts) */}
          <button
            id="tab-btn-home"
            onClick={() => {
              setActiveTab('home');
              setIsFabMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'home'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-300 font-medium'
            }`}
          >
            <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-1">Início</span>
          </button>

          <button
            id="tab-btn-subaccounts"
            onClick={() => {
              setActiveTab('subaccounts');
              setIsFabMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'subaccounts'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-300 font-medium'
            }`}
          >
            <Layers size={20} className={activeTab === 'subaccounts' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-1">Subcontas</span>
          </button>

          {/* Center Floating Action Button (FAB) */}
          <div className="relative -top-4 flex items-center justify-center px-1">
            <button
              id="btn-center-fab"
              type="button"
              onClick={() => setIsFabMenuOpen((prev) => !prev)}
              aria-label="Ações rápidas"
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-90 ${
                isFabMenuOpen
                  ? 'bg-slate-900 dark:bg-slate-700 text-white rotate-45'
                  : 'bg-gradient-to-tr from-amber-600 to-amber-500 text-white hover:shadow-amber-500/25 ring-4 ring-white/90 dark:ring-slate-900/90 shadow-md'
              }`}
            >
              <Plus size={24} className="stroke-[3] transition-transform" />
            </button>
          </div>

          {/* Right Tabs (Incomes & Reports) */}
          <button
            id="tab-btn-incomes"
            onClick={() => {
              setActiveTab('incomes');
              setIsFabMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'incomes'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-300 font-medium'
            }`}
          >
            <Wallet size={20} className={activeTab === 'incomes' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-1">Rendas</span>
          </button>

          <button
            id="tab-btn-reports"
            onClick={() => {
              setActiveTab('reports');
              setIsFabMenuOpen(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              activeTab === 'reports'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-300 font-medium'
            }`}
          >
            <PieChart size={20} className={activeTab === 'reports' ? 'stroke-[2.5]' : ''} />
            <span className="text-[10px] mt-1">Relatórios</span>
          </button>
        </div>
      </nav>
    </>
  );
};
