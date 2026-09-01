import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Check,
  Sparkles,
  ArrowUpRight,
  Calculator,
  Layers,
  Wand2,
  Calendar,
  AlertCircle,
  HelpCircle,
  Percent,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatKwanza,
  getTodayDateString,
  getCategoryIcon,
  BANK_STYLES,
  normalizeMoneyInput,
} from '../utils/formatters';

export const DistributeIncomeModal: React.FC = () => {
  const {
    isDistributeIncomeOpen,
    setIsDistributeIncomeOpen,
    preselectedIncomeSourceId,
    incomeSources,
    subaccounts,
    cards,
    currentCard: contextCurrentCard,
    distributeIncome,
    hideBalances,
  } = useFinance();

  const [selectedSourceId, setSelectedSourceId] = useState<string>('custom');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [totalAmountStr, setTotalAmountStr] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [distributions, setDistributions] = useState<Record<string, number>>({});
  const [confettiFired, setConfettiFired] = useState(false);

  // Initialize on open
  useEffect(() => {
    if (isDistributeIncomeOpen) {
      setConfettiFired(false);
      setDate(getTodayDateString());

      const initialCardId =
        (contextCurrentCard && contextCurrentCard.id) ||
        (cards.length > 0 ? cards[0].id : '');

      setSelectedCardId(initialCardId);

      if (preselectedIncomeSourceId) {
        const src = incomeSources.find((s) => s.id === preselectedIncomeSourceId);
        if (src) {
          setSelectedSourceId(src.id);
          setTotalAmountStr(String(src.defaultAmount));
          setDescription(`Distribuição: ${src.name}`);
        }
      } else if (incomeSources.length > 0) {
        const first = incomeSources[0];
        setSelectedSourceId(first.id);
        setTotalAmountStr(String(first.defaultAmount));
        setDescription(`Distribuição: ${first.name}`);
      } else {
        setSelectedSourceId('custom');
        setTotalAmountStr('500000');
        setDescription('Nova Entrada de Renda');
      }

      const initialDist: Record<string, number> = {};
      subaccounts
        .filter((sub) => sub.cardId === initialCardId)
        .forEach((sub) => {
          initialDist[sub.id] = sub.defaultIncomeShare || 0;
        });
      setDistributions(initialDist);
    }
  }, [isDistributeIncomeOpen, preselectedIncomeSourceId, incomeSources, subaccounts, cards, contextCurrentCard]);

  useEffect(() => {
    if (!isDistributeIncomeOpen || !selectedCardId) return;

    setDistributions((prev) => {
      const next: Record<string, number> = {};
      subaccounts
        .filter((sub) => sub.cardId === selectedCardId)
        .forEach((sub) => {
          next[sub.id] = prev[sub.id] ?? sub.defaultIncomeShare ?? 0;
        });
      return next;
    });
  }, [selectedCardId, isDistributeIncomeOpen, subaccounts]);

  // Handle source switch
  const handleSelectSource = (srcId: string) => {
    setSelectedSourceId(srcId);
    if (srcId === 'custom') {
      setDescription('Entrada Avulsa');
    } else {
      const src = incomeSources.find((s) => s.id === srcId);
      if (src) {
        setTotalAmountStr(String(src.defaultAmount));
        setDescription(`Distribuição: ${src.name}`);
      }
    }
  };

  const totalReceived = Number(normalizeMoneyInput(totalAmountStr)) || 0;
  const selectedCard = cards.find((card) => card.id === selectedCardId);
  const filteredSubaccounts = subaccounts.filter((sub) => sub.cardId === selectedCardId);

  // Sum of distributed amounts for the selected card only
  const totalDistributed: number = filteredSubaccounts.reduce((acc, sub) => {
    return acc + (Number(distributions[sub.id]) || 0);
  }, 0);
  const remainingToDistribute: number = totalReceived - totalDistributed;

  // Check if exactly zero and trigger confetti
  useEffect(() => {
    if (
      totalReceived > 0 &&
      remainingToDistribute === 0 &&
      !confettiFired &&
      isDistributeIncomeOpen
    ) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
      setConfettiFired(true);
    } else if (remainingToDistribute !== 0) {
      setConfettiFired(false);
    }
  }, [remainingToDistribute, totalReceived, confettiFired, isDistributeIncomeOpen]);

  const handleSubaccountAmountChange = (subId: string, valStr: string) => {
    const normalized = normalizeMoneyInput(valStr);
    const cleanNum = normalized === '' ? 0 : Number(normalized) || 0;
    setDistributions((prev) => ({
      ...prev,
      [subId]: cleanNum,
    }));
  };

  // Auto-fill suggested shares
  const handleAutoFillSuggested = () => {
    const newDist: Record<string, number> = {};
    filteredSubaccounts.forEach((sub) => {
      newDist[sub.id] = sub.defaultIncomeShare || 0;
    });
    setDistributions((prev) => ({ ...prev, ...newDist }));
  };

  // Distribute remaining evenly across the subaccounts of the selected card
  const handleDistributeRemainingEvenly = () => {
    if (remainingToDistribute <= 0 || filteredSubaccounts.length === 0) return;
    const share = Math.floor(remainingToDistribute / filteredSubaccounts.length);
    const remainder = remainingToDistribute % filteredSubaccounts.length;

    setDistributions((prev) => {
      const next = { ...prev };
      filteredSubaccounts.forEach((sub, idx) => {
        next[sub.id] = (Number(next[sub.id]) || 0) + share + (idx === 0 ? remainder : 0);
      });
      return next;
    });
  };

  // Clear all fields for the selected card
  const handleClearAll = () => {
    const empty: Record<string, number> = { ...distributions };
    filteredSubaccounts.forEach((sub) => {
      empty[sub.id] = 0;
    });
    setDistributions(empty);
  };

  const handleConfirm = () => {
    if (totalReceived <= 0) {
      alert('Por favor, introduz o valor total recebido.');
      return;
    }
    if (totalDistributed <= 0) {
      alert('Por favor, atribui algum valor às subcontas.');
      return;
    }

    const distList = filteredSubaccounts
      .filter((sub) => Number(distributions[sub.id]) > 0)
      .map((sub) => ({
        subaccountId: sub.id,
        amount: Number(distributions[sub.id]) || 0,
      }));

    distributeIncome({
      totalAmount: totalReceived,
      date: date || getTodayDateString(),
      description: description.trim(),
      incomeSourceId: selectedSourceId !== 'custom' ? selectedSourceId : undefined,
      distributions: distList,
    });

    setIsDistributeIncomeOpen(false);
  };

  if (!isDistributeIncomeOpen) return null;

  const percentDistributed =
    totalReceived > 0
      ? Math.min(100, Math.max(0, Math.round((totalDistributed / totalReceived) * 100)))
      : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          onClick={() => setIsDistributeIncomeOpen(false)}
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-t border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-emerald-900/40 flex items-center justify-between bg-emerald-950/90 text-white backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-2xs">
                <ArrowUpRight size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">
                  Nova Entrada / Distribuir Renda
                </h3>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  Distribui o dinheiro recebido pelos teus envelopes
                </p>
              </div>
            </div>
            <button
              id="btn-close-distribute-income"
              onClick={() => setIsDistributeIncomeOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-amber-100/15 dark:hover:bg-slate-700/80 text-white backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Income Source Selector */}
            {incomeSources.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Fonte da Renda
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {incomeSources.map((src) => {
                    const isSelected = selectedSourceId === src.id;
                    return (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => handleSelectSource(src.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800/90 hover:border-emerald-200 dark:hover:border-emerald-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {src.name}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => handleSelectSource('custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedSourceId === 'custom'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800/90 hover:border-emerald-200 dark:hover:border-emerald-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    + Outra Entrada
                  </button>
                </div>
              </div>
            )}

            {/* Card Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cartão que recebe a renda
              </label>
              {cards.length === 0 ? (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
                  Adiciona primeiro um cartão para receber a renda.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {cards.map((card) => {
                    const style = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
                    const isSelected = selectedCardId === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setSelectedCardId(card.id)}
                        className={`px-3 py-2 rounded-xl border text-left text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800/90'
                        }`}
                      >
                        {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : style.shortName}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Received Amount Input */}
            <div className="bg-white/70 dark:bg-slate-850/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Valor Total Recebido (Kz)
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 850000 ou 2728354,52"
                  value={totalAmountStr}
                  onChange={(e) => setTotalAmountStr(normalizeMoneyInput(e.target.value) || '')}
                  className="w-full text-2xl font-black px-3.5 py-2.5 rounded-xl bg-white/90 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-inner"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-slate-500">
                  Kz
                </span>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Valor em extenso:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  {formatKwanza(totalReceived)}
                </span>
              </div>
            </div>

            {/* Indicator: "Falta Distribuir: X Kz" */}
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md transition-all shadow-xs ${
                remainingToDistribute === 0 && totalReceived > 0
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : remainingToDistribute < 0
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {remainingToDistribute === 0 && totalReceived > 0
                      ? 'Distribuição Completa! Perfeito'
                      : remainingToDistribute < 0
                      ? 'Excesso atribuído!'
                      : 'Falta Distribuir'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black mt-0.5 font-mono">
                    {remainingToDistribute === 0 && totalReceived > 0
                      ? '0 Kz (100% Alocado)'
                      : remainingToDistribute < 0
                      ? `-${formatKwanza(Math.abs(remainingToDistribute))}`
                      : formatKwanza(remainingToDistribute)}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold block">
                    {percentDistributed}% distribuído
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {formatKwanza(totalDistributed)} de {formatKwanza(totalReceived)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    remainingToDistribute === 0
                      ? 'bg-emerald-500'
                      : remainingToDistribute < 0
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${percentDistributed}%` }}
                />
              </div>
            </div>

            {/* Quick Helper Tools */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-400">Preenchimento rápido:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={handleAutoFillSuggested}
                  className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:border-amber-200 dark:hover:border-amber-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <Wand2 size={12} />
                  <span>Sugeridos</span>
                </button>
                <button
                  type="button"
                  onClick={handleDistributeRemainingEvenly}
                  className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:border-amber-200 dark:hover:border-amber-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 active:scale-95 shadow-2xs"
                >
                  <Percent size={12} />
                  <span>Dividir Resto</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2.5 py-1 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-slate-800/90 hover:border-rose-200 dark:hover:border-rose-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold active:scale-95 shadow-2xs"
                >
                  Zerar
                </button>
              </div>
            </div>

            {/* Subaccounts Breakdown Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Atribuição por Subconta ({filteredSubaccounts.length} envelopes)
              </label>

              {filteredSubaccounts.length === 0 ? (
                <div className="p-4 bg-white/70 dark:bg-slate-850/70 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center text-xs text-slate-600 dark:text-slate-300">
                  Não há subcontas neste cartão. Seleciona um cartão com envelopes criados.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredSubaccounts.map((sub) => {
                    const Icon = getCategoryIcon(sub.icon);
                    const card = cards.find((c) => c.id === sub.cardId);

                    return (
                      <div
                        key={sub.id}
                        className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/75 dark:bg-slate-850/75 backdrop-blur-md hover:bg-amber-50/70 dark:hover:bg-slate-800 transition-all flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: sub.color || '#0284c7' }}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block">
                              {card ? (card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : card.bankId) : 'Conta'} • Sugerido:{' '}
                              {formatKwanza(sub.defaultIncomeShare || 0)}
                            </span>
                          </div>
                        </div>

                        <div className="w-32 shrink-0">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={distributions[sub.id] ?? ''}
                              onChange={(e) =>
                                handleSubaccountAmountChange(sub.id, e.target.value)
                              }
                              className="w-full text-right font-bold text-xs px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-2xs"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date & Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Data da Entrada
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Nota / Descrição
                </label>
                <input
                  type="text"
                  placeholder="Ex: Salário de Agosto..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Bottom Confirm */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <button
              id="btn-confirm-distribute"
              type="button"
              onClick={handleConfirm}
              disabled={totalReceived <= 0 || totalDistributed <= 0 || filteredSubaccounts.length === 0}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
                totalReceived > 0 && totalDistributed > 0 && filteredSubaccounts.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-amber-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check size={18} className="stroke-[3]" />
              <span>
                Confirmar Distribuição de {formatKwanza(totalDistributed)}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
