import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, Check, CreditCard, Banknote } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BANK_STYLES, formatKwanza, getTodayDateString } from '../utils/formatters';

export const TransferBetweenCardsModal: React.FC = () => {
  const {
    isTransferBetweenCardsOpen,
    setIsTransferBetweenCardsOpen,
    cards,
    transferBetweenCards,
    hideBalances,
  } = useFinance();

  const [fromCardId, setFromCardId] = useState<string>('');
  const [toCardId, setToCardId] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());

  useEffect(() => {
    if (isTransferBetweenCardsOpen) {
      const firstCardId = cards[0]?.id || '';
      const secondCardId = cards[1]?.id || firstCardId;
      setFromCardId(firstCardId);
      setToCardId(secondCardId);
      setAmountStr('');
      setDescription('');
      setDate(getTodayDateString());
    }
  }, [isTransferBetweenCardsOpen, cards]);

  if (!isTransferBetweenCardsOpen) return null;

  const numericAmount = parseFloat(amountStr) || 0;
  const sourceCard = cards.find((card) => card.id === fromCardId);
  const targetCard = cards.find((card) => card.id === toCardId);

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
      alert('Indica um valor válido para a transferência.');
      return;
    }

    if (!fromCardId || !toCardId) {
      alert('Seleciona os dois cartões envolvidos na transferência.');
      return;
    }

    if (fromCardId === toCardId) {
      alert('Seleciona cartões diferentes para transferir o dinheiro.');
      return;
    }

    try {
      transferBetweenCards({
        fromCardId,
        toCardId,
        amount: numericAmount,
        date,
        description: description.trim() || 'Transferência entre cartões',
      });
      setIsTransferBetweenCardsOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Não foi possível concluir a transferência.');
    }
  };

  if (cards.length < 2) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setIsTransferBetweenCardsOpen(false)} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[70vh] overflow-hidden border-t border-slate-200/80 dark:border-slate-800"
          >
            <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
                  <ArrowRightLeft size={18} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Transferir entre cartões</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Precisas de pelo menos dois cartões</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferBetweenCardsOpen(false)}
                className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-850/80 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ainda não tens dois cartões criados.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cria outro cartão para movimentar o saldo entre contas.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-md">
        <div className="absolute inset-0" onClick={() => setIsTransferBetweenCardsOpen(false)} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border-t border-slate-200/80 dark:border-slate-800"
        >
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-100/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-2xs">
                <ArrowRightLeft size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Transferir entre cartões</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Move dinheiro entre as tuas contas</p>
              </div>
            </div>
            <button
              onClick={() => setIsTransferBetweenCardsOpen(false)}
              className="p-2 rounded-full bg-slate-200/70 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">1. Origem</label>
              <div className="grid grid-cols-2 gap-2">
                {cards.map((card) => {
                  const bankStyle = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
                  const isSelected = fromCardId === card.id;
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setFromCardId(card.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-indigo-500 text-white dark:text-slate-950 border-slate-900 dark:border-indigo-500 shadow-md ring-2 ring-slate-900/20 dark:ring-indigo-500/20 scale-[1.02]'
                          : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' : 'bg-indigo-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                          {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.shortName}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                          ••{card.cardNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80">Origem da transferência</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <ArrowRightLeft size={18} className="stroke-[2.5]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">2. Destino</label>
              <div className="grid grid-cols-2 gap-2">
                {cards
                  .filter((card) => card.id !== fromCardId)
                  .map((card) => {
                    const bankStyle = BANK_STYLES[card.bankId] || BANK_STYLES.OUTRO;
                    const isSelected = toCardId === card.id;
                    return (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setToCardId(card.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-[1.02]'
                            : 'bg-white/80 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800/90 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 dark:bg-slate-950/20 text-white dark:text-slate-950' : 'bg-emerald-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                            {card.bankId === 'OUTRO' ? card.customBankName || 'Outro' : bankStyle.shortName}
                          </span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-emerald-100 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500'}`}>
                            ••{card.cardNumber.slice(-4)}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-80">Destino da transferência</div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-850/70 backdrop-blur-md p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Valor da transferência</span>
                {sourceCard && targetCard && (
                  <span className="text-slate-500 dark:text-slate-400">de {sourceCard.bankId === 'OUTRO' ? sourceCard.customBankName || 'Outro' : sourceCard.bankId} para {targetCard.bankId === 'OUTRO' ? targetCard.customBankName || 'Outro' : targetCard.bankId}</span>
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
                    className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-800/90 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
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
                  className="h-11 rounded-xl bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50 dark:hover:bg-slate-800/90 font-black text-lg text-slate-900 dark:text-white shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-200/80 dark:border-slate-700"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-slate-200/80 dark:bg-slate-800/90 hover:bg-indigo-100 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 shadow-xs active:scale-95 transition-all flex items-center justify-center border border-slate-300/80 dark:border-slate-700"
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
                  placeholder="Ex: Transferência para reserva"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/90 dark:bg-indigo-950/40 backdrop-blur-md border border-indigo-200 dark:border-indigo-800/60 rounded-xl flex items-start gap-2 text-indigo-800 dark:text-indigo-300 text-xs shadow-xs">
              <Banknote size={16} className="shrink-0 mt-0.5" />
              <span>
                Esta movimentação afecta o saldo dos dois cartões, sem passar por dinheiro em mão e sem alterar as subcontas.
              </span>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={numericAmount <= 0 || !fromCardId || !toCardId || fromCardId === toCardId}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all ${
                numericAmount > 0 && fromCardId && toCardId && fromCardId !== toCardId
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-indigo-50 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <Check size={18} className="stroke-[3]" />
              <span>Salvar Transferência</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
