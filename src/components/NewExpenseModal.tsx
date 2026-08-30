import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Calendar,
  Layers,
  Check,
  Delete,
  AlertTriangle,
  CreditCard,
  Tag,
  Sparkles,
  ArrowDownLeft,
  Plus,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import {
  formatKwanza,
  getTodayDateString,
  getCategoryIcon,
  BANK_STYLES,
} from '../utils/formatters';

export const NewExpenseModal: React.FC = () => {
  const {
    isNewExpenseOpen,
    setIsNewExpenseOpen,
    preselectedExpenseSubaccountId,
    subaccounts,
    cards,
    currentCard: contextCurrentCard,
    getSubaccountBalance,
    getCardBalance,
    addExpense,
    openAddSubaccountModal,
    hideBalances,
  } = useFinance();

  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Initialize selected card and subaccount on modal open
  useEffect(() => {
    if (isNewExpenseOpen) {
      setAmountStr('');
      setDate(getTodayDateString());
      setDescription('');

      if (preselectedExpenseSubaccountId) {
        const foundSub = subaccounts.find((s) => s.id === preselectedExpenseSubaccountId);
        if (foundSub) {
          setSelectedCardId(foundSub.cardId);
          setSelectedSubId(foundSub.id);
          return;
        }
      }

      // Default card to context currentCard or first card
      const initialCardId =
        (contextCurrentCard && contextCurrentCard.id) ||
        (cards.length > 0 ? cards[0].id : '');

      setSelectedCardId(initialCardId);

      // Default subaccount to the first subaccount of this card
      if (initialCardId) {
        const cardSubs = subaccounts.filter((s) => s.cardId === initialCardId);
        setSelectedSubId(cardSubs.length > 0 ? cardSubs[0].id : '');
      } else {
        setSelectedSubId('');
      }
    }
  }, [isNewExpenseOpen, preselectedExpenseSubaccountId, subaccounts, cards, contextCurrentCard]);

  // Handle card change by user
  const handleCardChange = (cardId: string) => {
    setSelectedCardId(cardId);
    const cardSubs = subaccounts.filter((s) => s.cardId === cardId);
    if (cardSubs.length > 0) {
      // Check if current selected sub is already in this card
      const isAlreadyInCard = cardSubs.some((s) => s.id === selectedSubId);
      if (!isAlreadyInCard) {
        setSelectedSubId(cardSubs[0].id);
      }
    } else {
      setSelectedSubId('');
    }
  };

  if (!isNewExpenseOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;
  const currentCard = cards.find((c) => c.id === selectedCardId);
  const cardSubaccounts = subaccounts.filter((s) => s.cardId === selectedCardId);
  const currentSub = cardSubaccounts.find((s) => s.id === selectedSubId);
  const currentSubBalance = currentSub ? getSubaccountBalance(currentSub.id) : 0;
  const remainingBalanceAfter = currentSubBalance - numericAmount;
  const bankStyle = currentCard ? BANK_STYLES[currentCard.bankId] || BANK_STYLES.OUTRO : null;

  // Numeric keypad handlers
  const handleDigit = (digit: string) => {
    if (amountStr.length >= 9) return; // Prevent overflow
    if (digit === '00' && (amountStr === '' || amountStr === '0')) return;
    if (amountStr === '0') {
      setAmountStr(digit);
    } else {
      setAmountStr((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmountStr('');
  };

  const handleQuickAdd = (value: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) {
      alert('Por favor, introduz um valor válido para a despesa.');
      return;
    }
    if (!selectedSubId) {
      alert('Por favor, seleciona uma subconta.');
      return;
    }

    addExpense({
      subaccountId: selectedSubId,
      amount: numericAmount,
      date: date || getTodayDateString(),
      description: description.trim(),
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      setIsNewExpenseOpen(false);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
        {/* Backdrop click */}
        <div
          className="absolute inset-0"
          onClick={() => setIsNewExpenseOpen(false)}
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-t border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
                <ArrowDownLeft size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                  Registar Novo Gasto
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Seleciona o cartão e a subconta de onde sai o valor
                </p>
              </div>
            </div>
            <button
              id="btn-close-new-expense"
              onClick={() => setIsNewExpenseOpen(false)}
              className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Display de Valor Grande */}
            <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 dark:from-slate-950/95 dark:to-slate-900/95 backdrop-blur-xl border border-white/10 dark:border-slate-800 rounded-3xl p-5 text-center text-white shadow-lg">
              <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
                Valor do Gasto
              </span>
              <div className="flex items-center justify-center gap-1 font-mono">
                <span className="text-3xl sm:text-4xl font-black text-rose-400 tracking-tight drop-shadow-xs">
                  {amountStr ? formatKwanza(numericAmount) : '0 Kz'}
                </span>
              </div>

              {/* Cartão e Subconta selecionados + saldo restante preview */}
              <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Origem:</span>
                  <span className="font-semibold text-white">
                    {currentCard ? (currentCard.bankId === 'OUTRO' ? currentCard.customBankName || 'Outro' : currentCard.bankId) : 'Nenhum'}
                    {currentSub ? ` • ${currentSub.name}` : ''}
                  </span>
                </div>

                {currentSub && (
                  <div className="flex items-center justify-between">
                    <span>
                      Saldo em {currentSub.name}:{' '}
                      <strong className="text-white font-mono">
                        {hideBalances ? '•••• Kz' : formatKwanza(currentSubBalance)}
                      </strong>
                    </span>
                    {numericAmount > 0 && (
                      <span
                        className={`font-semibold font-mono ${
                          remainingBalanceAfter < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        Ficará: {hideBalances ? '•••• Kz' : formatKwanza(remainingBalanceAfter)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick value buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[2000, 5000, 10000, 25000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="py-2 px-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition-all active:scale-95 text-center shadow-xs"
                >
                  +{val / 1000}k Kz
                </button>
              ))}
            </div>

            {/* Passo 1: Seleção do Cartão Bancário */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  1. Seleciona o Cartão Bancário
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
                </span>
              </div>

              {cards.length === 0 ? (
                <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 backdrop-blur-md rounded-2xl text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Adiciona primeiro um cartão para registar gastos.
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                  {cards.map((card) => {
                    const isSelected = selectedCardId === card.id;
                    const bStyle = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
                    const cardBal = getCardBalance(card.id);
                    const subCount = subaccounts.filter((s) => s.cardId === card.id).length;

                    return (
                      <button
                        type="button"
                        key={card.id}
                        onClick={() => handleCardChange(card.id)}
                        className={`flex-shrink-0 min-w-[145px] p-2.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-md ring-2 ring-slate-900/20 dark:ring-amber-500/20 scale-[1.02]'
                            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bStyle.shortName}
                          </span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                            ••{card.last4Digits}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <span className={`text-[10px] block ${isSelected ? 'text-slate-400 dark:text-slate-800' : 'text-slate-500 dark:text-slate-400'}`}>
                            Saldo do Cartão
                          </span>
                          <span className="text-xs font-black font-mono block">
                            {hideBalances ? '••••' : formatKwanza(cardBal)}
                          </span>
                        </div>

                        <div className={`mt-1.5 pt-1.5 border-t text-[10px] flex items-center justify-between ${
                          isSelected ? 'border-white/15 dark:border-slate-950/15 text-slate-300 dark:text-slate-800' : 'border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
                        }`}>
                          <span>{subCount} {subCount === 1 ? 'subconta' : 'subcontas'}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-slate-950" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Passo 2: Seleção da Subconta (Filtradas pelo Cartão Selecionado) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  2. Subconta / Envelope{' '}
                  {currentCard && (
                    <span className="text-slate-500 dark:text-slate-400 font-normal lowercase">
                      (no {currentCard.bankId === 'OUTRO' ? currentCard.customBankName || 'Outro' : currentCard.bankId})
                    </span>
                  )}
                </label>
                {selectedCardId && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewExpenseOpen(false);
                      openAddSubaccountModal(selectedCardId);
                    }}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-0.5"
                  >
                    <Plus size={12} />
                    <span>Nova Subconta</span>
                  </button>
                )}
              </div>

              {cardSubaccounts.length === 0 ? (
                <div className="p-4 bg-white/70 dark:bg-slate-850/70 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    O cartão selecionado{' '}
                    <strong>({currentCard?.bankId || 'Cartão'})</strong> não tem nenhuma subconta/envelope associado.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewExpenseOpen(false);
                      openAddSubaccountModal(selectedCardId);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs active:scale-95 transition-all inline-flex items-center gap-1"
                  >
                    <Plus size={13} className="stroke-[3]" />
                    <span>Criar Subconta neste Cartão</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-850/50 backdrop-blur-md">
                  {cardSubaccounts.map((sub) => {
                    const isSelected = selectedSubId === sub.id;
                    const subBal = getSubaccountBalance(sub.id);
                    const Icon = getCategoryIcon(sub.icon);

                    return (
                      <button
                        type="button"
                        key={sub.id}
                        onClick={() => setSelectedSubId(sub.id)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50/90 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 text-slate-900 dark:text-white shadow-xs'
                            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-xs"
                            style={{ backgroundColor: sub.color || '#0284c7' }}
                          >
                            <Icon size={14} />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold block truncate text-slate-900 dark:text-white">
                              {sub.name}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate block">
                              Envelope
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span
                            className={`text-xs font-bold font-mono ${
                              subBal < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : subBal === 0
                                ? 'text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {hideBalances ? '••••' : formatKwanza(subBal)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Teclado Numérico Estilo Calculadora */}
            <div className="bg-white/70 dark:bg-slate-850/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 active:bg-slate-100 dark:active:bg-slate-600 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-xl bg-rose-100/80 dark:bg-rose-950/60 hover:bg-rose-200/80 dark:hover:bg-rose-900/60 font-bold text-xs text-rose-700 dark:text-rose-300 shadow-xs active:scale-95 transition-all flex items-center justify-center border border-rose-200/80 dark:border-rose-800/60"
                >
                  LIMPAR
                </button>
                <button
                  type="button"
                  onClick={() => handleDigit('0')}
                  className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 active:bg-slate-100 dark:active:bg-slate-600 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 hover:bg-slate-300/80 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-300/80 dark:border-slate-700"
                >
                  <Delete size={20} />
                </button>
              </div>
            </div>

            {/* Descrição & Data Opcionais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Almoço, Farmácia, Recarga..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Data do Gasto
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono shadow-xs"
                />
              </div>
            </div>

            {/* Negative balance warning if applicable */}
            {numericAmount > 0 && remainingBalanceAfter < 0 && (
              <div className="p-3 bg-amber-50/90 dark:bg-amber-950/40 backdrop-blur-md border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs shadow-xs">
                <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>
                  Atenção: Este gasto ultrapassa o saldo disponível nesta subconta em{' '}
                  <strong className="font-mono">{formatKwanza(Math.abs(remainingBalanceAfter))}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* Bottom Confirm Button */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <button
              id="btn-confirm-expense"
              type="button"
              onClick={handleSubmit}
              disabled={numericAmount <= 0 || !selectedSubId}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
                numericAmount > 0 && selectedSubId
                  ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Check size={18} className="stroke-[3]" />
              <span>
                Confirmar Gasto {numericAmount > 0 ? `de ${formatKwanza(numericAmount)}` : ''}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

