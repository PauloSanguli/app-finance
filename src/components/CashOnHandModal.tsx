import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ArrowUpRight, Check, CreditCard, Banknote } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BANK_STYLES, formatKwanza, getTodayDateString } from '../utils/formatters';

export const CashOnHandModal: React.FC = () => {
  const {
    isCashOnHandOpen,
    setIsCashOnHandOpen,
    cards,
    cashMovements,
    getCashOnHandBalance,
    addCashToHand,
    hideBalances,
  } = useFinance();

  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    if (isCashOnHandOpen) {
      const initialCardId = cards[0]?.id || '';
      setSelectedCardId(initialCardId);
      setAmountStr('');
      setDescription('');
      setDate(getTodayDateString());
    }
  }, [isCashOnHandOpen, cards]);

  if (!isCashOnHandOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;
  const cashBalance = getCashOnHandBalance();
  const currentSourceCard = cards.find((card) => card.id === selectedCardId);

  const handleDigit = (digit: string) => {
    if (amountStr.length >= 9) return;
    if (digit === '00' && (amountStr === '' || amountStr === '0')) return;
    if (amountStr === '0') {
      setAmountStr(digit);
    } else {
      setAmountStr((prev) => prev + digit);
    }
  };

  const handleBackspace = () => setAmountStr((prev) => prev.slice(0, -1));
  const handleClear = () => setAmountStr('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (numericAmount <= 0) {
      alert('Indica um valor válido para a retirada para dinheiro em mão.');
      return;
    }

    if (!selectedCardId) {
      alert('Seleciona o cartão de origem da retirada.');
      return;
    }

    addCashToHand({
      sourceCardId: selectedCardId,
      amount: numericAmount,
      date,
      description: description.trim() || 'Retirada para dinheiro em mão',
    });

    setIsCashOnHandOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
        <div className="absolute inset-0" onClick={() => setIsCashOnHandOpen(false)} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-t border-slate-200/80 dark:border-slate-800"
        >
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-2xs">
                <Wallet size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Dinheiro em Mão</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Regista a quantia que tens disponível em espécie</p>
              </div>
            </div>
            <button
              onClick={() => setIsCashOnHandOpen(false)}
              className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-500 text-white rounded-3xl p-5 text-center shadow-lg">
              <span className="text-[11px] uppercase tracking-widest text-emerald-100 font-bold block mb-1">Disponível em mãos</span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-xs font-mono">
                {hideBalances ? '•••• Kz' : formatKwanza(cashBalance)}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">1. Retira do cartão</label>
              <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                {cards.map((card) => {
                  const bankStyle = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
                  const isSelected = selectedCardId === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedCardId(card.id)}
                      className={`flex-shrink-0 min-w-[150px] p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 border-slate-900 dark:border-emerald-500 shadow-md ring-2 ring-slate-900/20 dark:ring-emerald-500/20 scale-[1.02]'
                          : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' : 'bg-emerald-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                          {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.shortName}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                          ••{card.cardNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80">Origem da retirada</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-850/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Valor da retirada</span>
                {currentSourceCard && (
                  <span className="text-slate-500 dark:text-slate-400">de {currentSourceCard.bankId === 'OUTRO' ? currentSourceCard.customBankName || 'Outro' : currentSourceCard.bankId}</span>
                )}
              </div>

              <div className="text-center font-mono text-3xl font-black text-slate-900 dark:text-white">
                {amountStr ? formatKwanza(numericAmount) : '0 Kz'}
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleDigit(digit)}
                    className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-slate-800/90 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
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
                  className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-slate-800/90 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 hover:bg-emerald-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-300/80 dark:border-slate-700"
                >
                  ←
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Dinheiro para semana"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-emerald-50/90 dark:bg-emerald-950/40 backdrop-blur-md border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs">
              <Banknote size={16} className="shrink-0 mt-0.5" />
              <span>
                Este valor será somado ao saldo de dinheiro em mão e não será tratado como débito do cartão selecionado.
              </span>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={numericAmount <= 0 || !selectedCardId}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
                numericAmount > 0 && selectedCardId
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-emerald-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Check size={18} className="stroke-[3]" />
              <span>Salvar Dinheiro em Mão</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
