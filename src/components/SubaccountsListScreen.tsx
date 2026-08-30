import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  CreditCard,
  ChevronRight,
  ArrowDownLeft,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatKwanza,
  getCategoryIcon,
  BANK_STYLES,
} from '../utils/formatters';

export const SubaccountsListScreen: React.FC = () => {
  const {
    cards,
    subaccounts,
    getSubaccountBalance,
    getCardBalance,
    setSubaccountDetailId,
    openAddSubaccountModal,
    openNewExpenseModal,
    hideBalances,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardFilter, setSelectedCardFilter] = useState<string>('ALL');

  const filteredSubaccounts = subaccounts.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCard =
      selectedCardFilter === 'ALL' || sub.cardId === selectedCardFilter;
    return matchesSearch && matchesCard;
  });

  return (
    <div className="px-4 sm:px-6 py-4 pb-28 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Subcontas & Envelopes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Categorias de dinheiro organizadas por cartão bancário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-add-subaccount-main"
            onClick={() => openAddSubaccountModal()}
            className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>Nova Subconta</span>
          </button>
        </div>
      </div>

      {/* Search and Card Filter Chips */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Pesquisar por nome ou nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 text-xs rounded-2xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>

        {/* Bank filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCardFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedCardFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-200 dark:hover:border-amber-500/30 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            Todos os Bancos ({subaccounts.length})
          </button>

          {cards.map((card) => {
            const count = subaccounts.filter((s) => s.cardId === card.id).length;
            const isSelected = selectedCardFilter === card.id;
            return (
              <button
                key={card.id}
                onClick={() => setSelectedCardFilter(card.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-600 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:text-amber-700 dark:hover:text-amber-300 hover:border-amber-200 dark:hover:border-amber-500/30 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : card.bankId} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid of Subaccounts */}
      <div className="space-y-4">
        {filteredSubaccounts.length === 0 ? (
          <div className="p-8 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800">
            <Layers className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nenhuma subconta encontrada
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
              Tenta mudar a pesquisa ou cria uma nova subconta.
            </p>
            <button
              onClick={() => openAddSubaccountModal()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Criar Subconta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredSubaccounts.map((sub) => {
              const balance = getSubaccountBalance(sub.id);
              const Icon = getCategoryIcon(sub.icon);
              const card = cards.find((c) => c.id === sub.cardId);
              const bankStyle = card
                ? BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO
                : BANK_STYLES.OUTRO;

              let stateBg = 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
              let stateDot = 'bg-emerald-500';
              let stateLabel = 'Disponível';

              if (balance === 0) {
                stateBg = 'bg-amber-50/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border-amber-200/80 dark:border-slate-700';
                stateDot = 'bg-slate-400';
                stateLabel = 'Vazio';
              } else if (balance < 0) {
                stateBg = 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
                stateDot = 'bg-rose-500';
                stateLabel = 'Negativo';
              }

              return (
                <div
                  key={sub.id}
                  onClick={() => setSubaccountDetailId(sub.id)}
                  className="group cursor-pointer p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:border-amber-200 dark:hover:border-amber-500/40 hover:bg-amber-50/70 dark:hover:bg-slate-850 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                          style={{ backgroundColor: sub.color || '#0284c7' }}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                            {sub.name}
                          </h4>
                          {card && (
                            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <CreditCard size={11} />
                              {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all mt-1"
                      />
                    </div>

                    {sub.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
                        {sub.notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Saldo Disponível:
                    </span>
                    <span
                      className={`text-sm font-black font-mono ${
                        balance < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : balance === 0
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {hideBalances ? '•••••• Kz' : formatKwanza(balance)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-xs ${stateBg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${stateDot}`} />
                      {stateLabel}
                    </span>

                    {sub.defaultIncomeShare ? (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Meta: {formatKwanza(sub.defaultIncomeShare)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
