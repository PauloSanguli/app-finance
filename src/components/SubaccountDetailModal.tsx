import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  Calendar,
  Layers,
  CreditCard,
  Plus,
  ArrowRightLeft,
  Filter,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatKwanza,
  formatDatePT,
  getCategoryIcon,
  BANK_STYLES,
} from '../utils/formatters';

export const SubaccountDetailModal: React.FC = () => {
  const {
    subaccountDetailId,
    setSubaccountDetailId,
    subaccounts,
    cards,
    getSubaccountBalance,
    getSubaccountTransactions,
    openNewExpenseModal,
    openDistributeIncomeModal,
    deleteSubaccount,
    deleteTransaction,
    hideBalances,
  } = useFinance();

  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');

  if (!subaccountDetailId) return null;

  const subaccount = subaccounts.find((s) => s.id === subaccountDetailId);
  if (!subaccount) return null;

  const card = cards.find((c) => c.id === subaccount.cardId);
  const bankStyle = card ? BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO : BANK_STYLES.OUTRO;
  const balance = getSubaccountBalance(subaccount.id);
  const transactions = getSubaccountTransactions(subaccount.id);
  const Icon = getCategoryIcon(subaccount.icon);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'EXPENSE') return t.type === 'EXPENSE';
    if (filterType === 'INCOME') return t.type === 'INCOME';
    return true;
  });

  const handleDeleteSubaccount = () => {
    if (
      window.confirm(
        `Tens a certeza que desejas eliminar a subconta "${subaccount.name}"? O saldo atual e todos os movimentos serão apagados.`
      )
    ) {
      deleteSubaccount(subaccount.id);
    }
  };

  // Status styling
  let statusColor = 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200/80 dark:border-emerald-800/60';
  let statusDot = 'bg-emerald-500';
  let statusText = 'Saldo Disponível';

  if (balance === 0) {
    statusColor = 'text-slate-600 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700';
    statusDot = 'bg-slate-400';
    statusText = 'Envelope Vazio';
  } else if (balance < 0) {
    statusColor = 'text-rose-700 dark:text-rose-300 bg-rose-50/90 dark:bg-rose-950/50 border-rose-200/80 dark:border-rose-800/60';
    statusDot = 'bg-rose-500';
    statusText = 'Saldo Negativo';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          onClick={() => setSubaccountDetailId(null)}
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: subaccount.color || '#0284c7' }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {subaccount.name}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-xs ${statusColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                      {statusText}
                    </span>
                  </div>
                  {card && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                      <CreditCard size={12} className="text-slate-400 dark:text-slate-500" />
                      Vinculado ao {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.name} ({card.cardNumber})
                    </p>
                  )}
                </div>
              </div>

              <button
                id="btn-close-subaccount-detail"
                onClick={() => setSubaccountDetailId(null)}
                className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Saldo Disponível em Destaque */}
            <div className="mt-4 p-4 rounded-2xl bg-white/80 dark:bg-slate-850/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                  Saldo Disponível
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
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

              <div className="text-right">
                {subaccount.defaultIncomeShare ? (
                  <div>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">
                      Renda Prevista
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {formatKwanza(subaccount.defaultIncomeShare)} / mês
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 flex gap-2">
              <button
                id="btn-subaccount-expense"
                onClick={() => {
                  setSubaccountDetailId(null);
                  openNewExpenseModal(subaccount.id);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <ArrowDownLeft size={16} className="stroke-[2.5]" />
                <span>Registar Gasto</span>
              </button>

              <button
                id="btn-subaccount-income"
                onClick={() => {
                  setSubaccountDetailId(null);
                  openDistributeIncomeModal();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              >
                <ArrowUpRight size={16} className="stroke-[2.5]" />
                <span>Adicionar Saldo</span>
              </button>
            </div>
          </div>

          {/* Transactions History Header & Filters */}
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Histórico de Movimentos ({filteredTransactions.length})
            </h4>

            {/* Filter tabs */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-xs p-0.5 rounded-xl text-xs font-semibold border border-slate-200/60 dark:border-slate-700">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('EXPENSE')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'EXPENSE'
                    ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Saídas
              </button>
              <button
                onClick={() => setFilterType('INCOME')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'INCOME'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Entradas
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="flex-1 overflow-y-auto px-5 py-2 space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-white/60 dark:bg-slate-850/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 my-2 shadow-xs">
                <Calendar className="mx-auto text-slate-400 mb-1" size={28} />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sem movimentos registados</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Os gastos e distribuições associados a esta subconta aparecerão aqui.
                </p>
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isExpense = tx.type === 'EXPENSE';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-2xs ${
                          isExpense
                            ? 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60'
                            : 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowDownLeft size={18} className="stroke-[2.5]" />
                        ) : (
                          <ArrowUpRight size={18} className="stroke-[2.5]" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          {tx.description}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {formatDatePT(tx.date)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs sm:text-sm font-black tracking-tight font-mono ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {hideBalances ? '•••• Kz' : formatKwanza(tx.amount)}
                      </span>

                      <button
                        onClick={() => {
                          if (window.confirm('Desejas apagar este movimento?')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        title="Apagar movimento"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with subaccount removal */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Criada em: {subaccount.createdAt}
            </span>
            <button
              id="btn-delete-subaccount"
              onClick={handleDeleteSubaccount}
              className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-semibold flex items-center gap-1 hover:underline"
            >
              <Trash2 size={13} />
              <span>Remover Subconta</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
