import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatKwanza } from '../utils/formatters';

export const TotalBalanceSection: React.FC = () => {
  const { getTotalBalance, hideBalances, currentCard, getCardBalance } = useFinance();

  const totalBalance = getTotalBalance();
  const cardBalance = currentCard ? getCardBalance(currentCard.id) : 0;

  return (
    <div className="px-5 py-2">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-[24px] p-4.5 shadow-xs relative overflow-hidden transition-colors">
        {/* Subtle glowing specular gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/5 dark:bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Saldo Total Geral Disponível</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-xs" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            Todas as Contas
          </span>
        </div>

        {/* Big Balance Display */}
        <div className="mt-1.5 flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {hideBalances ? '•••••••• Kz' : formatKwanza(totalBalance)}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Distribuído em envelopes e subcontas bancárias
            </p>
          </div>
        </div>

        {/* Comparison pill */}
        {currentCard && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              No cartão selecionado ({currentCard.bankId === 'OUTRO' ? currentCard.customBankName || 'Outro' : currentCard.bankId}):
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
              {hideBalances ? '•••••• Kz' : formatKwanza(cardBalance)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

