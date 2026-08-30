import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Layers, Sparkles, CreditCard } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CategoryIconName } from '../types';
import { CATEGORY_ICON_MAP, getCategoryIcon, BANK_STYLES } from '../utils/formatters';

const COLOR_PRESETS = [
  '#0284c7', // Sky blue
  '#059669', // Emerald green
  '#d97706', // Amber
  '#dc2626', // Red
  '#9333ea', // Purple
  '#db2777', // Pink
  '#4f46e5', // Indigo
  '#475569', // Slate
  '#ea580c', // Orange
  '#0d9488', // Teal
];

export const AddSubaccountModal: React.FC = () => {
  const {
    isAddSubaccountOpen,
    setIsAddSubaccountOpen,
    preselectedAddSubaccountCardId,
    cards,
    addSubaccount,
  } = useFinance();

  const [cardId, setCardId] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<CategoryIconName>('utensils');
  const [color, setColor] = useState('#059669');
  const [defaultIncomeShare, setDefaultIncomeShare] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAddSubaccountOpen) {
      if (preselectedAddSubaccountCardId) {
        setCardId(preselectedAddSubaccountCardId);
      } else if (cards.length > 0) {
        setCardId(cards[0].id);
      }
      setName('');
      setIcon('utensils');
      setColor('#059669');
      setDefaultIncomeShare('');
      setNotes('');
    }
  }, [isAddSubaccountOpen, preselectedAddSubaccountCardId, cards]);

  if (!isAddSubaccountOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, indica o nome da subconta/envelope.');
      return;
    }
    if (!cardId) {
      alert('Por favor, seleciona o cartão bancário associado.');
      return;
    }

    addSubaccount({
      cardId,
      name: name.trim(),
      icon,
      color,
      defaultIncomeShare: parseFloat(defaultIncomeShare) || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAddSubaccountOpen(false);
  };

  const categoryEntries = Object.entries(CATEGORY_ICON_MAP) as [
    CategoryIconName,
    { icon: any; label: string; defaultBg: string }
  ][];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
        <div
          className="absolute inset-0"
          onClick={() => setIsAddSubaccountOpen(false)}
        />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 text-white backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold shadow-2xs">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Nova Subconta (Envelope)</h3>
                <p className="text-[11px] text-amber-200">
                  Cria uma categoria com saldo independente
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddSubaccountOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-amber-100/15 dark:hover:bg-slate-700/80 text-white backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Card Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cartão Bancário Associado
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cards.map((c) => {
                  const style = BANK_STYLES[c.bankId] || BANK_STYLES.OUTRO;
                  const isSelected = cardId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCardId(c.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-xs'
                          : 'bg-white/80 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:border-amber-200 dark:hover:border-amber-500/30 backdrop-blur-xs text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
                      }`}
                    >
                      <span className="font-bold block">
                        {c.bankId === 'OUTRO' ? c.customBankName || 'Outro' : style.shortName}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">
                        {c.cardNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nome da Subconta
              </label>
              <input
                type="text"
                placeholder="Ex: Fundo de Emergência, Luz, Alimentação, Táxi..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-semibold shadow-xs"
              />
            </div>

            {/* Category Icon */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ícone da Categoria
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-36 overflow-y-auto p-1.5 border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-850/50 backdrop-blur-md">
                {categoryEntries.map(([iconKey, data]) => {
                  const IconComp = data.icon;
                  const isSelected = icon === iconKey;
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      title={data.label}
                      onClick={() => {
                        setIcon(iconKey);
                        if (!name) setName(data.label.split('/')[0].trim());
                      }}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-xs scale-105 ring-2 ring-amber-500/30'
                          : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800/90 hover:border-amber-200 dark:hover:border-amber-500/30 border border-slate-200/80 dark:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <IconComp size={18} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Cor da Etiqueta
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    style={{ backgroundColor: hex }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      color === hex ? 'scale-125 ring-2 ring-offset-2 ring-slate-700 dark:ring-amber-400' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Suggested / Default Income Share */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Valor Sugerido para Rendas (Kz / Mês)
              </label>
              <input
                type="number"
                placeholder="Ex: 50000"
                value={defaultIncomeShare}
                onChange={(e) => setDefaultIncomeShare(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono shadow-xs"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                Será sugerido automaticamente ao fazeres a distribuição de novas rendas.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Notas / Descrição (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Reserva exclusiva para despesas médicas"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                id="btn-submit-add-subaccount"
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Check size={16} className="stroke-[3]" />
                <span>Salvar Subconta</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
