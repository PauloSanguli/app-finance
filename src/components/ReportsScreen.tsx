import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatKwanza, getCategoryIcon, BANK_STYLES } from '../utils/formatters';

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const ReportsScreen: React.FC = () => {
  const { getMonthStats, hideBalances, cards, subaccounts } = useFinance();

  const [selectedMonth, setSelectedMonth] = useState<number>(7); // Agosto (0-indexed: 7)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [chartType, setChartType] = useState<'BAR' | 'PIE'>('BAR');

  const stats = getMonthStats(selectedMonth, selectedYear);
  const netSavings = stats.totalIncomes - stats.totalExpenses;

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const barChartData = stats.expensesBySubaccount.map((item) => ({
    name: item.name.length > 12 ? `${item.name.substring(0, 12)}...` : item.name,
    fullName: item.name,
    amount: item.amount,
    color: item.color,
  }));

  return (
    <div className="px-4 sm:px-6 py-4 pb-28 space-y-5 max-w-7xl mx-auto">
      {/* Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Relatórios & Resumo Financeiro
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Análise visual de gastos por envelope e saldos por instituição bancária
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-1 bg-white/75 dark:bg-slate-900/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            aria-label="Mês anterior"
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 min-w-[110px] text-center">
            {MONTH_NAMES_PT[selectedMonth]} {selectedYear}
          </span>
          <button
            onClick={handleNextMonth}
            aria-label="Próximo mês"
            className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Month Totals Overview Cards (3-column on tablet and desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 backdrop-blur-md border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
            <ArrowUpRight size={16} className="stroke-[3]" />
            <span>Total Recebido no Mês</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1.5 font-mono">
            {hideBalances ? '•••• Kz' : formatKwanza(stats.totalIncomes)}
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 backdrop-blur-md border border-rose-200/80 dark:border-rose-800/60 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-400">
            <ArrowDownLeft size={16} className="stroke-[3]" />
            <span>Total Gasto no Mês</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-200 mt-1.5 font-mono">
            {hideBalances ? '•••• Kz' : formatKwanza(stats.totalExpenses)}
          </div>
        </div>

        <div className="p-4.5 rounded-2xl bg-slate-900/90 dark:bg-slate-850/90 backdrop-blur-xl text-white shadow-md border border-white/10 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Balanço Líquido do Mês
            </span>
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-200 border border-white/15">
              {stats.expensesBySubaccount.length} envelopes
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono mt-1.5">
            {hideBalances ? '•••• Kz' : `${netSavings >= 0 ? '+' : ''}${formatKwanza(netSavings)}`}
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid (2 Columns on Large Screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Gastos por Subconta no Mês */}
        <div className="p-5 rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Gastos por Subconta no Mês
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Distribuição das despesas em {MONTH_NAMES_PT[selectedMonth]}
                </p>
              </div>

              <div className="flex bg-slate-100/80 dark:bg-slate-800 p-0.5 rounded-xl text-xs border border-slate-200/60 dark:border-slate-700">
                <button
                  onClick={() => setChartType('BAR')}
                  className={`p-1.5 rounded-lg transition-all ${
                    chartType === 'BAR' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  title="Gráfico de Barras"
                >
                  <BarChart3 size={14} />
                </button>
                <button
                  onClick={() => setChartType('PIE')}
                  className={`p-1.5 rounded-lg transition-all ${
                    chartType === 'PIE' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}
                  title="Gráfico Circular"
                >
                  <PieIcon size={14} />
                </button>
              </div>
            </div>

            {stats.expensesBySubaccount.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-semibold">
                Nenhum gasto registado em {MONTH_NAMES_PT[selectedMonth]} {selectedYear}
              </div>
            ) : (
              <div className="h-64 w-full pt-3">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'BAR' ? (
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#94a3b8' }}
                        tickFormatter={(v) => `${v / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value: any) => [formatKwanza(Number(value)), 'Gasto']}
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            return payload[0].payload.fullName;
                          }
                          return label;
                        }}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          borderRadius: '16px',
                          fontSize: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      />
                      <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#f43f5e'} />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <PieChart>
                      <Pie
                        data={barChartData}
                        dataKey="amount"
                        nameKey="fullName"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        paddingAngle={3}
                      >
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-pie-${index}`} fill={entry.color || '#f43f5e'} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [formatKwanza(Number(value)), 'Gasto']}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff',
                          borderRadius: '16px',
                          fontSize: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                      />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Saldo por Cartão Bancário */}
        <div className="p-5 rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Saldo Atual por Cartão / Banco
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Montante acumulado nas subcontas de cada instituição
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            {stats.balanceByCard.map((cardItem) => {
              const cardObj = cards.find((c) => c.id === cardItem.cardId);
              const style = cardObj ? BANK_STYLES[cardObj.bankId] || BANK_STYLES.OUTRO : BANK_STYLES.OUTRO;
              const totalSysBalance = stats.balanceByCard.reduce((a, b) => a + Math.max(0, b.balance), 0);
              const percentOfTotal =
                totalSysBalance > 0
                  ? Math.round((Math.max(0, cardItem.balance) / totalSysBalance) * 100)
                  : 0;

              return (
                <div
                  key={cardItem.cardId}
                  className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-md space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white uppercase shadow-2xs">
                        {cardItem.bankName}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {cardObj?.accountType}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono">
                      {hideBalances ? '•••• Kz' : formatKwanza(cardItem.balance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${percentOfTotal}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-9 text-right">
                      {percentOfTotal}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Expense Categories Breakdown List */}
      <div className="p-5 rounded-[24px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          Detalhamento de Saídas por Categoria
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {stats.expensesBySubaccount.map((item) => {
            const Icon = getCategoryIcon(item.icon);
            const pct =
              stats.totalExpenses > 0
                ? Math.round((item.amount / stats.totalExpenses) * 100)
                : 0;

            return (
              <div
                key={item.subaccountId}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-850/70 backdrop-blur-md shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-2xs"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[140px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {pct}% do total gasto
                    </span>
                  </div>
                </div>

                <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                  -{hideBalances ? '•••• Kz' : formatKwanza(item.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
