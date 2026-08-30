import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Trash2,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BANK_STYLES, formatKwanza, getCategoryIcon } from '../utils/formatters';

export const CardDetailModal: React.FC = () => {
  const {
    cardDetailId,
    setCardDetailId,
    cards,
    getSubaccountsByCardId,
    getCardBalance,
    getSubaccountBalance,
    setSubaccountDetailId,
    openAddSubaccountModal,
    openNewExpenseModal,
    deleteCard,
    hideBalances,
  } = useFinance();

  if (!cardDetailId) return null;

  const card = cards.find((c) => c.id === cardDetailId);
  if (!card) return null;

  const bankStyle = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
  const balance = getCardBalance(card.id);
  const subaccounts = getSubaccountsByCardId(card.id);

  const handleDelete = () => {
    if (
      window.confirm(
        `Tens a certeza que desejas eliminar o cartão ${card.bankId}? Todas as suas ${subaccounts.length} subcontas e movimentos serão removidos.`
      )
    ) {
      deleteCard(card.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
        {/* Backdrop click */}
        <div
          className="absolute inset-0"
          onClick={() => setCardDetailId(null)}
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800"
        >
          {/* Top Header Card Background */}
          <div
            className={`p-6 text-white bg-gradient-to-br ${bankStyle.bgGradient} relative overflow-hidden border-b border-white/20`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                  {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.name}
                </span>
                <span className="text-xs text-white/90 font-medium">
                  {card.accountType}
                </span>
              </div>
              <button
                id="btn-close-card-detail"
                onClick={() => setCardDetailId(null)}
                className="p-2 rounded-full bg-black/25 hover:bg-black/40 text-white backdrop-blur-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 relative z-10">
              <span className="text-xs text-white/75 font-medium">
                Saldo Total do Cartão
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-sm font-mono">
                {hideBalances ? '•••••• Kz' : formatKwanza(balance)}
              </div>
              <div className="text-xs font-mono text-white/85 mt-1">
                {card.cardNumber} • {card.accountHolder}
              </div>
            </div>

            {/* Quick action buttons on card header */}
            <div className="mt-5 flex gap-2 relative z-10">
              <button
                id="btn-add-subaccount-from-card"
                onClick={() => openAddSubaccountModal(card.id)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white text-slate-900 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-transform"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>Nova Subconta</span>
              </button>
              <button
                id="btn-expense-from-card"
                onClick={() => {
                  setCardDetailId(null);
                  openNewExpenseModal();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/20 hover:bg-amber-100/10 backdrop-blur-md text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-white/30 active:scale-95 transition-transform"
              >
                <ArrowDownLeft size={15} className="stroke-[2.5]" />
                <span>Registar Gasto</span>
              </button>
            </div>
          </div>

          {/* Subaccounts List (Envelopes) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/95 dark:bg-slate-900/95">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Subcontas (Envelopes) deste Cartão
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Categorias com saldo disponível individual
                </p>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                {subaccounts.length} {subaccounts.length === 1 ? 'envelope' : 'envelopes'}
              </span>
            </div>

            {subaccounts.length === 0 ? (
              <div className="p-8 text-center bg-white/60 dark:bg-slate-850/60 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 shadow-xs">
                <Layers className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Nenhuma subconta criada neste cartão
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Cria envelopes como Fundo de Emergência, Alimentação, Luz ou Água.
                </p>
                <button
                  id="btn-create-first-subaccount"
                  onClick={() => openAddSubaccountModal(card.id)}
                  className="px-4 py-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
                >
                  Criar Primeira Subconta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subaccounts.map((sub) => {
                  const subBal = getSubaccountBalance(sub.id);
                  const Icon = getCategoryIcon(sub.icon);

                  // Estado de cor
                  let stateBg = 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60';
                  let stateDot = 'bg-emerald-500';
                  let stateLabel = 'Disponível';

                  if (subBal === 0) {
                    stateBg = 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700';
                    stateDot = 'bg-slate-400';
                    stateLabel = 'Vazio';
                  } else if (subBal < 0) {
                    stateBg = 'bg-rose-50/90 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60';
                    stateDot = 'bg-rose-500';
                    stateLabel = 'Negativo';
                  }

                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSubaccountDetailId(sub.id);
                      }}
                      className="group cursor-pointer p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850/80 backdrop-blur-md hover:border-amber-200 dark:hover:border-amber-500/40 hover:bg-amber-50/70 dark:hover:bg-slate-800 hover:shadow-md transition-all active:scale-[0.98] flex flex-col justify-between shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                            style={{ backgroundColor: sub.color || '#0284c7' }}
                          >
                            <Icon size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                              {sub.name}
                            </h4>
                            {sub.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                                {sub.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all mt-1"
                        />
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Saldo Disponível:
                        </span>
                        <div className="text-right">
                          <span
                            className={`text-sm font-black font-mono ${
                              subBal < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : subBal === 0
                                ? 'text-slate-500 dark:text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {hideBalances ? '•••••• Kz' : formatKwanza(subBal)}
                          </span>
                        </div>
                      </div>

                      {/* Health / Status tag */}
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-xs ${stateBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${stateDot}`} />
                          {stateLabel}
                        </span>

                        {sub.defaultIncomeShare ? (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            Meta: {formatKwanza(sub.defaultIncomeShare)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Delete card option */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                IBAN: {card.ibanSuffix}
              </span>
              <button
                id="btn-delete-card"
                onClick={handleDelete}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/50 transition-colors"
              >
                <Trash2 size={13} />
                <span>Remover Cartão</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
