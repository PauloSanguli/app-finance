import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Wifi, Layers, CreditCard, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BANK_STYLES, formatKwanza } from '../utils/formatters';

export const CardCarousel: React.FC = () => {
  const {
    cards,
    selectedCardIndex,
    setSelectedCardIndex,
    getCardBalance,
    getSubaccountsByCardId,
    hideBalances,
    setCardDetailId,
    setIsAddCardOpen,
  } = useFinance();

  const activeCard = cards[selectedCardIndex] || cards[0];

  const handlePrev = () => {
    setSelectedCardIndex(selectedCardIndex === 0 ? cards.length - 1 : selectedCardIndex - 1);
  };

  const handleNext = () => {
    setSelectedCardIndex(selectedCardIndex === cards.length - 1 ? 0 : selectedCardIndex + 1);
  };

  if (!activeCard) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 my-4">
        <CreditCard className="mx-auto text-slate-400 mb-2" size={32} />
        <p className="text-sm font-semibold text-slate-600">Nenhum cartão cadastrado</p>
        <button
          onClick={() => setIsAddCardOpen(true)}
          className="mt-3 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Adicionar Cartão Bancário
        </button>
      </div>
    );
  }

  const bankStyle = BANK_STYLES[activeCard.bankId] || BANK_STYLES.OUTRO;
  const balance = getCardBalance(activeCard.id);
  const cardSubaccounts = getSubaccountsByCardId(activeCard.id);

  return (
    <div className="pt-2 pb-3">
      {/* Top Section Header */}
      <div className="flex items-center justify-between px-5 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Minhas Contas & Cartões
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {cards.length}
          </span>
        </div>
        <button
          id="btn-add-card-top"
          onClick={() => setIsAddCardOpen(true)}
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>Novo Cartão</span>
        </button>
      </div>

      {/* Card Display Container */}
      <div className="relative px-5">
        {/* Navigation Arrows for desktop/click usability */}
        {cards.length > 1 && (
          <>
            <button
              id="btn-prev-card"
              onClick={handlePrev}
              aria-label="Cartão anterior"
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-md border border-white/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:text-amber-700 dark:hover:text-amber-300 active:scale-90 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              id="btn-next-card"
              onClick={handleNext}
              aria-label="Próximo cartão"
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-md border border-white/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:text-amber-700 dark:hover:text-amber-300 active:scale-90 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* The Bank Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard.id}
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setCardDetailId(activeCard.id)}
            className={`cursor-pointer relative overflow-hidden rounded-[24px] p-5 text-white shadow-xl shadow-slate-900/20 bg-gradient-to-br ${bankStyle.bgGradient} border border-white/30 select-none group transition-transform active:scale-[0.985]`}
            style={{
              minHeight: '194px',
            }}
          >
            {/* Subtle background frosted specular reflections */}
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-black/20 blur-lg pointer-events-none" />
            <div className="absolute right-4 bottom-4 w-32 h-32 rounded-full border border-white/15 pointer-events-none" />

            {/* Top Row: Bank Name / Logo & Contactless */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 shadow-xs">
                  <span className="font-black text-sm tracking-wider uppercase drop-shadow-xs">
                    {activeCard.bankId === 'OUTRO'
                      ? activeCard.customBankName || 'Outro'
                      : bankStyle.logoText}
                  </span>
                </div>
                <span className="text-[11px] font-medium text-white/85 tracking-wide">
                  {activeCard.accountType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Wifi size={18} className="rotate-90 opacity-90" />
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-md border border-white/25 text-white shadow-2xs">
                  MULTICAIXA
                </span>
              </div>
            </div>

            {/* Middle Row: Chip & Balance */}
            <div className="mt-4 flex items-center justify-between relative z-10">
              {/* EMV Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-200 via-yellow-400 to-amber-300 border border-amber-500/40 shadow-inner flex items-center justify-center p-1">
                <div className="w-full h-full border border-amber-600/30 rounded-[3px] grid grid-cols-2 gap-0.5 opacity-75">
                  <div className="border-r border-amber-600/30"></div>
                  <div></div>
                </div>
              </div>

              {/* Card Balance Callout */}
              <div className="text-right">
                <span className="text-[11px] text-white/75 font-medium block">
                  Saldo do Cartão
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-sm font-mono">
                  {hideBalances ? '•••••• Kz' : formatKwanza(balance)}
                </span>
              </div>
            </div>

            {/* Bottom Row: Cardholder & Number & Envelope count */}
            <div className="mt-4 pt-2.5 border-t border-white/20 flex items-end justify-between relative z-10">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-white/75 block font-medium">
                  Titular da Conta
                </span>
                <span className="text-xs font-bold tracking-wider text-white">
                  {activeCard.accountHolder}
                </span>
                <div className="text-[11px] font-mono tracking-widest text-white/90 mt-0.5">
                  {activeCard.cardNumber}
                </div>
              </div>

              {/* Subaccounts badge */}
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 group-hover:bg-black/40 transition-colors shadow-xs">
                <Layers size={13} className="text-amber-300" />
                <span className="text-[11px] font-bold text-white">
                  {cardSubaccounts.length}{' '}
                  {cardSubaccounts.length === 1 ? 'Subconta' : 'Subcontas'}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => setSelectedCardIndex(idx)}
              aria-label={`Ir para cartão ${card.bankId}`}
              className={`transition-all duration-300 rounded-full ${
                selectedCardIndex === idx
                  ? 'w-6 h-2 bg-slate-900 dark:bg-amber-400'
                  : 'w-2 h-2 bg-slate-300/80 dark:bg-slate-700 hover:bg-amber-400 dark:hover:bg-amber-500'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
