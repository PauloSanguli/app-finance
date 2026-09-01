export type BankId = 'BAI' | 'BFA' | 'BCI' | 'ATLANTICO' | 'SOL' | 'BIC' | 'STANDARD_BANK' | 'OUTRO';

export interface BankStyle {
  id: BankId;
  name: string;
  shortName: string;
  bgGradient: string;
  accentColor: string;
  textColor: string;
  logoText: string;
  cardPattern: 'stripes' | 'dots' | 'geometric' | 'minimal';
}

export interface BankCard {
  id: string;
  bankId: BankId;
  customBankName?: string;
  accountHolder: string;
  cardNumber: string; // e.g. "•••• 4821"
  accountType: 'Conta Corrente' | 'Conta Poupança' | 'Multicaixa';
  ibanSuffix: string;
  colorTheme: string; // primary color hex or tailwind class
  createdAt: string;
}

export type CategoryIconName =
  | 'zap' // energia
  | 'droplet' // água
  | 'wifi' // internet/telecom
  | 'utensils' // alimentação
  | 'sparkles' // limpeza / mimos
  | 'scissors' // cabelo/barbearia
  | 'car' // táxi / transporte
  | 'home' // aluguel / casa
  | 'shield-check' // emergência
  | 'briefcase' // negócio
  | 'book-open' // educação
  | 'heart-pulse' // saúde
  | 'shopping-bag' // compras
  | 'piggy-bank' // poupança geral
  | 'gift' // presentes / doações
  | 'coffee'; // lazer

export interface Subaccount {
  id: string;
  cardId: string;
  name: string;
  icon: CategoryIconName;
  color: string; // tag color
  targetBudget?: number; // meta opcional em Kz
  defaultIncomeShare?: number; // valor fixo sugerido em Kz para distribuir renda
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'EXPENSE' | 'INCOME';

export interface Transaction {
  id: string;
  subaccountId: string;
  cardId: string;
  type: TransactionType;
  amount: number; // positive number in Kz
  date: string; // ISO string YYYY-MM-DD
  description: string;
  incomeSourceId?: string; // se veio de uma renda específica
  origin?: 'CARD' | 'CASH';
  sourceCardId?: string;
  createdAt: string;
}

export interface CashMovement {
  id: string;
  type: 'ADD' | 'SPEND';
  amount: number;
  sourceCardId?: string;
  subaccountId?: string;
  cardId?: string;
  date: string;
  description: string;
  createdAt: string;
}

export type IncomeFrequency = 'MENSAL' | 'QUINZENAL' | 'SEMANAL' | 'VARIAVEL' | 'PONTUAL';

export interface IncomeSource {
  id: string;
  name: string;
  defaultAmount: number;
  frequency: IncomeFrequency;
  receivingDay?: number; // e.g. 25 para dia 25 do mês
  active: boolean;
  notes?: string;
}

export type ActiveTab = 'home' | 'subaccounts' | 'incomes' | 'reports';

export interface QuickFilter {
  month: number; // 0-11
  year: number;
}
