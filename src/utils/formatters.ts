import { BankId, BankStyle, CategoryIconName } from '../types';
import {
  Zap,
  Droplet,
  Wifi,
  Utensils,
  Sparkles,
  Scissors,
  Car,
  Home,
  ShieldCheck,
  Briefcase,
  BookOpen,
  HeartPulse,
  ShoppingBag,
  PiggyBank,
  Gift,
  Coffee,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';

export const BANK_STYLES: Record<BankId, BankStyle> = {
  BAI: {
    id: 'BAI',
    name: 'Banco BAI',
    shortName: 'BAI',
    bgGradient: 'from-[#0a192f] via-[#112240] to-[#1e3a5f]',
    accentColor: '#f59e0b',
    textColor: '#FFFFFF',
    logoText: 'BAI',
    cardPattern: 'geometric',
  },
  BFA: {
    id: 'BFA',
    name: 'Banco BFA',
    shortName: 'BFA',
    bgGradient: 'from-[#23150d] via-[#382012] to-[#542d17]',
    accentColor: '#fb923c',
    textColor: '#FFFFFF',
    logoText: 'BFA',
    cardPattern: 'stripes',
  },
  BCI: {
    id: 'BCI',
    name: 'Banco BCI',
    shortName: 'BCI',
    bgGradient: 'from-[#0b1626] via-[#132742] to-[#1d3b63]',
    accentColor: '#facc15',
    textColor: '#FFFFFF',
    logoText: 'BCI',
    cardPattern: 'dots',
  },
  ATLANTICO: {
    id: 'ATLANTICO',
    name: 'Banco Atlântico',
    shortName: 'Atlântico',
    bgGradient: 'from-[#0a1e19] via-[#13332b] to-[#1d4b40]',
    accentColor: '#5eead4',
    textColor: '#FFFFFF',
    logoText: 'ATLÂNTICO',
    cardPattern: 'geometric',
  },
  BIC: {
    id: 'BIC',
    name: 'Banco BIC',
    shortName: 'BIC',
    bgGradient: 'from-[#220d11] via-[#3b151b] to-[#571c26]',
    accentColor: '#fda4af',
    textColor: '#FFFFFF',
    logoText: 'BIC',
    cardPattern: 'minimal',
  },
  SOL: {
    id: 'SOL',
    name: 'Banco Sol',
    shortName: 'SOL',
    bgGradient: 'from-[#221808] via-[#3b2b0e] to-[#594014]',
    accentColor: '#fde047',
    textColor: '#FFFFFF',
    logoText: 'SOL',
    cardPattern: 'stripes',
  },
  STANDARD_BANK: {
    id: 'STANDARD_BANK',
    name: 'Standard Bank Angola',
    shortName: 'Standard',
    bgGradient: 'from-[#091728] via-[#102744] to-[#193d6b]',
    accentColor: '#7dd3fc',
    textColor: '#FFFFFF',
    logoText: 'Standard Bank',
    cardPattern: 'dots',
  },
  OUTRO: {
    id: 'OUTRO',
    name: 'Outro Banco / Conta',
    shortName: 'Conta',
    bgGradient: 'from-[#171d26] via-[#242d3b] to-[#344052]',
    accentColor: '#e2e8f0',
    textColor: '#FFFFFF',
    logoText: 'CONTA',
    cardPattern: 'minimal',
  },
};

export const CATEGORY_ICON_MAP: Record<CategoryIconName, { icon: LucideIcon; label: string; defaultBg: string }> = {
  zap: { icon: Zap, label: 'Energia / Luz (ENDE)', defaultBg: 'bg-amber-100 text-amber-600' },
  droplet: { icon: Droplet, label: 'Água (EPAL)', defaultBg: 'bg-blue-100 text-blue-600' },
  wifi: { icon: Wifi, label: 'Internet / ZAP / Unitel', defaultBg: 'bg-indigo-100 text-indigo-600' },
  utensils: { icon: Utensils, label: 'Alimentação & Mercado', defaultBg: 'bg-emerald-100 text-emerald-600' },
  sparkles: { icon: Sparkles, label: 'Limpeza & Higiene', defaultBg: 'bg-teal-100 text-teal-600' },
  scissors: { icon: Scissors, label: 'Cabelo / Barbearia', defaultBg: 'bg-purple-100 text-purple-600' },
  car: { icon: Car, label: 'Táxi / Yango / Combustível', defaultBg: 'bg-orange-100 text-orange-600' },
  home: { icon: Home, label: 'Renda / Aluguer da Casa', defaultBg: 'bg-rose-100 text-rose-600' },
  'shield-check': { icon: ShieldCheck, label: 'Fundo de Emergência', defaultBg: 'bg-sky-100 text-sky-700' },
  briefcase: { icon: Briefcase, label: 'Poupança Negócio', defaultBg: 'bg-slate-100 text-slate-700' },
  'book-open': { icon: BookOpen, label: 'Educação / Cursos', defaultBg: 'bg-violet-100 text-violet-600' },
  'heart-pulse': { icon: HeartPulse, label: 'Saúde / Farmácia', defaultBg: 'bg-red-100 text-red-600' },
  'shopping-bag': { icon: ShoppingBag, label: 'Compras Pessoais', defaultBg: 'bg-fuchsia-100 text-fuchsia-600' },
  'piggy-bank': { icon: PiggyBank, label: 'Poupança Casa / Metas', defaultBg: 'bg-yellow-100 text-yellow-700' },
  gift: { icon: Gift, label: 'Mimos / Presentes', defaultBg: 'bg-pink-100 text-pink-600' },
  coffee: { icon: Coffee, label: 'Lazer / Restaurantes', defaultBg: 'bg-amber-100 text-amber-700' },
};

export function getCategoryIcon(iconName: CategoryIconName): LucideIcon {
  return CATEGORY_ICON_MAP[iconName]?.icon || CircleDollarSign;
}

export function formatKwanza(amount: number, showDecimals = false): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = new Intl.NumberFormat('pt-AO', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${formatted} Kz`;
}

export function formatDatePT(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateFullPT(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('pt-AO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
