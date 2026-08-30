import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Wallet, Calendar } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { IncomeFrequency, IncomeSource } from '../types';

export const AddIncomeSourceModal: React.FC = () => {
  const {
    isAddIncomeSourceOpen,
    setIsAddIncomeSourceOpen,
    editingIncomeSource,
    addIncomeSource,
    updateIncomeSource,
  } = useFinance();

  const [name, setName] = useState('');
  const [defaultAmount, setDefaultAmount] = useState('');
  const [frequency, setFrequency] = useState<IncomeFrequency>('MENSAL');
  const [receivingDay, setReceivingDay] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isAddIncomeSourceOpen) {
      if (editingIncomeSource) {
        setName(editingIncomeSource.name);
        setDefaultAmount(String(editingIncomeSource.defaultAmount));
        setFrequency(editingIncomeSource.frequency);
        setReceivingDay(editingIncomeSource.receivingDay ? String(editingIncomeSource.receivingDay) : '');
        setNotes(editingIncomeSource.notes || '');
      } else {
        setName('');
        setDefaultAmount('');
        setFrequency('MENSAL');
        setReceivingDay('25');
        setNotes('');
      }
    }
  }, [isAddIncomeSourceOpen, editingIncomeSource]);

  if (!isAddIncomeSourceOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, indica o nome da fonte de renda.');
      return;
    }
    const num = parseFloat(defaultAmount);
    if (!num || num <= 0) {
      alert('Por favor, indica um valor habitual válido.');
      return;
    }

    if (editingIncomeSource) {
      updateIncomeSource({
        ...editingIncomeSource,
        name: name.trim(),
        defaultAmount: num,
        frequency,
        receivingDay: receivingDay ? parseInt(receivingDay, 10) : undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addIncomeSource({
        name: name.trim(),
        defaultAmount: num,
        frequency,
        receivingDay: receivingDay ? parseInt(receivingDay, 10) : undefined,
        active: true,
        notes: notes.trim() || undefined,
      });
    }

    setIsAddIncomeSourceOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
        <div
          className="absolute inset-0"
          onClick={() => setIsAddIncomeSourceOpen(false)}
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
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold shadow-2xs">
                <Wallet size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {editingIncomeSource ? 'Editar Fonte de Renda' : 'Nova Fonte de Renda'}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  Regista os teus rendimentos recorrentes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddIncomeSourceOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-amber-100/15 dark:hover:bg-slate-700/80 text-white backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nome da Fonte de Renda
              </label>
              <input
                type="text"
                placeholder="Ex: Salário Principal, Consultorias, Aluguer..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-900 dark:text-white shadow-xs"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Valor Habitual (Kz)
              </label>
              <input
                type="number"
                placeholder="Ex: 850000"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold shadow-xs"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Frequência de Recebimento
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['MENSAL', 'QUINZENAL', 'SEMANAL', 'VARIAVEL', 'PONTUAL'] as IncomeFrequency[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      frequency === f
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800/90 hover:border-emerald-200 dark:hover:border-emerald-500/30 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Day of Month */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Dia Habitual do Mês (1-31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                placeholder="Ex: 25"
                value={receivingDay}
                onChange={(e) => setReceivingDay(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono shadow-xs"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Notas (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Depositado na conta BAI"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                id="btn-submit-add-income"
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Check size={16} className="stroke-[3]" />
                <span>Salvar Fonte de Renda</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
