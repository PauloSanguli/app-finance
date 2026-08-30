import React from 'react';
import {
  Layers,
  PieChart,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const QuickActions: React.FC = () => {
  const {
    openNewExpenseModal,
    openDistributeIncomeModal,
    setActiveTab,
  } = useFinance();

  const actions = [
    {
      id: 'quick-action-expense',
      label: 'Novo Gasto',
      sublabel: 'Registar saída',
      icon: ArrowDownLeft,
      iconColor: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20',
      onClick: () => openNewExpenseModal(),
    },
    {
      id: 'quick-action-income',
      label: 'Nova Entrada',
      sublabel: 'Distribuir renda',
      icon: ArrowUpRight,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20',
      onClick: () => openDistributeIncomeModal(),
    },
    {
      id: 'quick-action-subaccounts',
      label: 'Subcontas',
      sublabel: 'Ver envelopes',
      icon: Layers,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20',
      onClick: () => setActiveTab('subaccounts'),
    },
    {
      id: 'quick-action-reports',
      label: 'Relatórios',
      sublabel: 'Resumo mensal',
      icon: PieChart,
      iconColor: 'text-slate-700 dark:text-slate-300',
      iconBg: 'bg-slate-500/10 dark:bg-slate-500/20 border border-slate-500/20',
      onClick: () => setActiveTab('reports'),
    },
  ];

  return (
    <div className="px-5 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ações Rápidas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              id={action.id}
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-start p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-white dark:hover:bg-slate-850 transition-all active:scale-[0.97] text-left shadow-xs group hover:shadow-md"
            >
              <div
                className={`w-9 h-9 rounded-xl ${action.iconBg} ${action.iconColor} flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <Icon size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {action.label}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {action.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

