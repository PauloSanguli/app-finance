import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/Header';
import { CardCarousel } from './components/CardCarousel';
import { TotalBalanceSection } from './components/TotalBalanceSection';
import { QuickActions } from './components/QuickActions';
import { CardDetailModal } from './components/CardDetailModal';
import { SubaccountDetailModal } from './components/SubaccountDetailModal';
import { NewExpenseModal } from './components/NewExpenseModal';
import { DistributeIncomeModal } from './components/DistributeIncomeModal';
import { AddCardModal } from './components/AddCardModal';
import { AddSubaccountModal } from './components/AddSubaccountModal';
import { AddIncomeSourceModal } from './components/AddIncomeSourceModal';
import { SubaccountsListScreen } from './components/SubaccountsListScreen';
import { IncomeSourcesScreen } from './components/IncomeSourcesScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import {
  Layers,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Smartphone,
  Maximize2,
  Clock,
} from 'lucide-react';
import {
  formatKwanza,
  formatDatePT,
  getCategoryIcon,
} from './utils/formatters';

const HomeScreenContent: React.FC = () => {
  const {
    currentCard,
    getSubaccountsByCardId,
    getSubaccountBalance,
    setSubaccountDetailId,
    setCardDetailId,
    openAddSubaccountModal,
    setIsAddCardOpen,
    transactions,
    subaccounts,
    hideBalances,
  } = useFinance();

  const cardSubaccounts = currentCard ? getSubaccountsByCardId(currentCard.id) : [];
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="pb-28">
      {/* 1. Bank Card Carousel with Pagination Dots */}
      <CardCarousel />

      {/* 2. Total Balance Highlight */}
      <TotalBalanceSection />

      {/* 3. Quick Action Shortcuts Grid */}
      <QuickActions />

      {/* 4. Subaccounts of Selected Card Preview */}
      {currentCard && (
        <div className="px-5 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Envelopes do {currentCard.bankId === 'OUTRO' ? currentCard.customBankName || 'Banco' : currentCard.bankId}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Subcontas com saldo disponível neste banco
              </p>
            </div>
            <button
              id="btn-add-subaccount-home"
              onClick={() => openAddSubaccountModal(currentCard.id)}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus size={14} className="stroke-[3]" />
              <span>+ Subconta</span>
            </button>
          </div>

          {cardSubaccounts.length === 0 ? (
            <div className="p-5 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 shadow-xs">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sem subcontas neste cartão</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 mb-2">
                Cria subcontas para separar o teu dinheiro.
              </p>
              <button
                onClick={() => openAddSubaccountModal(currentCard.id)}
                className="px-3 py-1.5 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                + Criar Subconta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {cardSubaccounts.map((sub) => {
                const subBal = getSubaccountBalance(sub.id);
                const Icon = getCategoryIcon(sub.icon);

                let stateDot = 'bg-emerald-500';
                if (subBal === 0) stateDot = 'bg-slate-400';
                if (subBal < 0) stateDot = 'bg-rose-500';

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSubaccountDetailId(sub.id)}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md text-left transition-all active:scale-[0.97] flex flex-col justify-between shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-xs"
                        style={{ backgroundColor: sub.color || '#0284c7' }}
                      >
                        <Icon size={16} />
                      </div>
                      <span className={`w-2 h-2 rounded-full ${stateDot}`} />
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                        {sub.name}
                      </span>
                      <span
                        className={`text-xs font-black mt-0.5 block font-mono ${
                          subBal < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : subBal === 0
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {hideBalances ? '•••• Kz' : formatKwanza(subBal)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Button to view all card details */}
          <button
            onClick={() => setCardDetailId(currentCard.id)}
            className="w-full py-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-850 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-[0.99]"
          >
            <Layers size={14} />
            <span>Gerir Todas as Subcontas do {currentCard.bankId === 'OUTRO' ? currentCard.customBankName || 'Banco' : currentCard.bankId}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* 5. Recent Movements Section */}
      <div className="px-5 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Últimos Movimentos
          </span>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Tempo real
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-4 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Nenhum movimento registado ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isExpense = tx.type === 'EXPENSE';
              const sub = subaccounts.find((s) => s.id === tx.subaccountId);

              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    if (tx.subaccountId) setSubaccountDetailId(tx.subaccountId);
                  }}
                  className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-850 hover:shadow-xs transition-all flex items-center justify-between cursor-pointer shadow-2xs group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isExpense
                          ? 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/60'
                          : 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60'
                      }`}
                    >
                      {isExpense ? (
                        <ArrowDownLeft size={18} className="stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight size={18} className="stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {tx.description}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {sub?.name || 'Subconta'} • {formatDatePT(tx.date)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs sm:text-sm font-black font-mono tracking-tight ${
                      isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {hideBalances ? '•••• Kz' : formatKwanza(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Bottom Add Card Prompt */}
      <div className="px-5 pt-3">
        <button
          id="btn-add-card-bottom"
          onClick={() => setIsAddCardOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-white/60 dark:bg-slate-900/60 hover:bg-white/90 dark:hover:bg-slate-850 backdrop-blur-md text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-2xs"
        >
          <Plus size={16} className="stroke-[3] text-amber-600 dark:text-amber-400" />
          <span>+ Adicionar Novo Cartão Bancário (BAI, BFA, BCI, etc.)</span>
        </button>
      </div>
    </div>
  );
};

const MainAppContainer: React.FC = () => {
  const { activeTab } = useFinance();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200/70 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col justify-start font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-white relative overflow-hidden transition-colors duration-300">
      {/* Frosted ambient background glowing lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <Header />

        <main className="flex-1 bg-transparent">
          {activeTab === 'home' && <HomeScreenContent />}
          {activeTab === 'subaccounts' && <SubaccountsListScreen />}
          {activeTab === 'incomes' && <IncomeSourcesScreen />}
          {activeTab === 'reports' && <ReportsScreen />}
        </main>

        <BottomNavigation />

        <CardDetailModal />
        <SubaccountDetailModal />
        <NewExpenseModal />
        <DistributeIncomeModal />
        <AddCardModal />
        <AddSubaccountModal />
        <AddIncomeSourceModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainAppContainer />
    </FinanceProvider>
  );
}
