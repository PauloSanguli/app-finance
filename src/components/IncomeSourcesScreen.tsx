import React from 'react';
import {
  Plus,
  ArrowUpRight,
  Calendar,
  Wallet,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  Edit2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatKwanza } from '../utils/formatters';
import { IncomeSource } from '../types';

export const IncomeSourcesScreen: React.FC = () => {
  const {
    incomeSources,
    openAddIncomeSourceModal,
    openDistributeIncomeModal,
    toggleIncomeSourceActive,
    deleteIncomeSource,
    hideBalances,
  } = useFinance();

  const totalMonthlyIncomes = incomeSources
    .filter((s) => s.active)
    .reduce((acc, s) => acc + s.defaultAmount, 0);

  return (
    <div className="px-4 sm:px-6 py-4 pb-28 space-y-4 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Fontes de Renda & Rendimentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Regista de onde vem o teu dinheiro para distribuir nos envelopes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-distribute-income-screen"
            onClick={() => openDistributeIncomeModal()}
            className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          >
            <ArrowUpRight size={15} className="stroke-[2.5] text-emerald-400" />
            <span>Distribuir Salário</span>
          </button>
          <button
            id="btn-add-income-source-main"
            onClick={() => openAddIncomeSourceModal()}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition-transform"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>Nova Renda</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary Banner */}
      <div className="p-5 sm:p-6 rounded-[24px] bg-gradient-to-br from-emerald-950/95 via-teal-950/90 to-slate-950/95 backdrop-blur-xl text-white shadow-lg border border-emerald-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-semibold text-emerald-300">
            Previsão Total de Rendas Ativas (Mês)
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-xs self-start sm:self-auto">
            {incomeSources.filter((s) => s.active).length} Fontes Ativas
          </span>
        </div>
        <div className="text-2xl sm:text-4xl font-black mt-2 tracking-tight text-white font-mono">
          {hideBalances ? '•••••••• Kz' : formatKwanza(totalMonthlyIncomes)}
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-300/80 mt-1 max-w-xl">
          Ao receberes qualquer uma destas quantias, clica em "Distribuir" para repartir automaticamente pelas subcontas e envelopes.
        </p>
      </div>

      {/* Sources Responsive Grid */}
      <div className="space-y-3">
        {incomeSources.length === 0 ? (
          <div className="p-8 text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800">
            <Wallet className="mx-auto text-slate-400 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma renda cadastrada</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">
              Cadastra o teu salário, consultorias, aluguéis recebidos ou vendas.
            </p>
            <button
              onClick={() => openAddIncomeSourceModal()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Adicionar Primeira Renda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {incomeSources.map((source) => (
              <div
                key={source.id}
                className={`p-4.5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                  source.active
                    ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200/80 dark:border-slate-800 hover:bg-amber-50/70 dark:hover:bg-slate-850 hover:border-amber-200 dark:hover:border-amber-500/30 hover:shadow-md'
                    : 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-slate-200/40 dark:border-slate-850 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-2xs border ${
                          source.active
                            ? 'bg-emerald-100/90 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60'
                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300/80 dark:border-slate-700'
                        }`}
                      >
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {source.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-medium px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200/60 dark:border-slate-700">
                            {source.frequency}
                          </span>
                          {source.receivingDay && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                              <Calendar size={12} />
                              Dia habitual: {source.receivingDay}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block font-mono">
                        {hideBalances ? '•••• Kz' : formatKwanza(source.defaultAmount)}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Valor Habitual
                      </span>
                    </div>
                  </div>

                  {source.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 pt-2 border-t border-slate-100/80 dark:border-slate-800 line-clamp-2">
                      {source.notes}
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => toggleIncomeSourceActive(source.id)}
                    className={`text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all ${
                      source.active
                        ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100/80 border border-emerald-200/60 dark:border-emerald-800/60'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-amber-50/80 dark:hover:bg-slate-800'
                    }`}
                  >
                    {source.active ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Ativa</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>Pausada</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openAddIncomeSourceModal(source)}
                      title="Editar Renda"
                      className="p-1.5 text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Tens a certeza que desejas remover a renda "${source.name}"?`)) {
                          deleteIncomeSource(source.id);
                        }
                      }}
                      title="Eliminar Renda"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50/80 dark:hover:bg-rose-950/50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      id={`btn-distribute-source-${source.id}`}
                      onClick={() => openDistributeIncomeModal(source.id)}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition-transform"
                    >
                      <ArrowUpRight size={13} className="stroke-[3]" />
                      <span>Distribuir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
