import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BankId } from '../types';
import { BANK_STYLES } from '../utils/formatters';

export const AddCardModal: React.FC = () => {
  const { isAddCardOpen, setIsAddCardOpen, addCard } = useFinance();

  const [bankId, setBankId] = useState<BankId>('BAI');
  const [customBankName, setCustomBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('PAULO SANGULI');
  const [last4Digits, setLast4Digits] = useState('');
  const [accountType, setAccountType] = useState<'Conta Corrente' | 'Conta Poupança' | 'Multicaixa'>('Conta Corrente');
  const [ibanSuffix, setIbanSuffix] = useState('');

  if (!isAddCardOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountHolder.trim()) {
      alert('Por favor, indica o titular da conta.');
      return;
    }

    const clean4 = last4Digits.replace(/\D/g, '').slice(-4) || Math.floor(1000 + Math.random() * 9000).toString();
    const style = BANK_STYLES[bankId] || BANK_STYLES.OUTRO;

    addCard({
      bankId,
      customBankName: bankId === 'OUTRO' ? customBankName.trim() || 'Outro Banco' : undefined,
      accountHolder: accountHolder.toUpperCase().trim(),
      cardNumber: `•••• ${clean4}`,
      accountType,
      ibanSuffix: ibanSuffix.trim() || `AO06.${bankId === 'BAI' ? '0040' : bankId === 'BFA' ? '0006' : '0055'}.0000.${clean4}.1`,
      colorTheme: style.bgGradient,
    });

    setIsAddCardOpen(false);
  };

  const bankOptions: BankId[] = [
    'BAI',
    'BFA',
    'BCI',
    'ATLANTICO',
    'BIC',
    'SOL',
    'STANDARD_BANK',
    'OUTRO',
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-md p-0 sm:p-4">
        <div
          className="absolute inset-0"
          onClick={() => setIsAddCardOpen(false)}
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
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-2xs">
                <CreditCard size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Adicionar Conta / Cartão</h3>
                <p className="text-[11px] text-slate-300">
                  Adiciona uma conta bancária real para criar envelopes
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddCardOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Select Bank */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Seleciona o Banco Angolano
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bankOptions.map((bId) => {
                  const style = BANK_STYLES[bId];
                  const isSelected = bankId === bId;
                  return (
                    <button
                      key={bId}
                      type="button"
                      onClick={() => setBankId(bId)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 shadow-xs'
                          : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 backdrop-blur-xs'
                      }`}
                    >
                      {style.shortName}
                    </button>
                  );
                })}
              </div>
            </div>

            {bankId === 'OUTRO' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Banco Personalizado
                </label>
                <input
                  type="text"
                  placeholder="Ex: Finibanco, BNI, Caixa Geral..."
                  value={customBankName}
                  onChange={(e) => setCustomBankName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-xs"
                />
              </div>
            )}

            {/* Account Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tipo de Conta
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Conta Corrente', 'Multicaixa', 'Conta Poupança'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccountType(type)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                      accountType === type
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 backdrop-blur-xs border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Holder & Digits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Titular
                </label>
                <input
                  type="text"
                  placeholder="PAULO SANGULI"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold uppercase shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Últimos 4 dígitos do Cartão
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="4821"
                  value={last4Digits}
                  onChange={(e) => setLast4Digits(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono font-bold shadow-xs"
                />
              </div>
            </div>

            {/* IBAN (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                IBAN / Número de Conta (Opcional)
              </label>
              <input
                type="text"
                placeholder="AO06.0040.0000.1234.5678.9"
                value={ibanSuffix}
                onChange={(e) => setIbanSuffix(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-850 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono shadow-xs"
              />
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                id="btn-submit-add-card"
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
              >
                <Check size={16} className="stroke-[3]" />
                <span>Salvar e Criar Cartão</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
