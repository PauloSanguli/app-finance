import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  BankCard,
  Subaccount,
  Transaction,
  IncomeSource,
  ActiveTab,
  CategoryIconName,
  CashMovement,
} from '../types';
import { getTodayDateString } from '../utils/formatters';
import { supabase, hasSupabaseConfig } from '../utils/supabase';

interface FinanceContextType {
  // Data
  cards: BankCard[];
  subaccounts: Subaccount[];
  transactions: Transaction[];
  cashMovements: CashMovement[];
  incomeSources: IncomeSource[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hideBalances: boolean;
  setHideBalances: (hide: boolean | ((prev: boolean) => boolean)) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setIsDarkMode: (dark: boolean) => void;

  // Selected Card for Carousel
  selectedCardIndex: number;
  setSelectedCardIndex: (index: number) => void;
  currentCard: BankCard | undefined;

  // Modals & Navigation
  cardDetailId: string | null;
  setCardDetailId: (id: string | null) => void;
  subaccountDetailId: string | null;
  setSubaccountDetailId: (id: string | null) => void;
  isNewExpenseOpen: boolean;
  setIsNewExpenseOpen: (open: boolean) => void;
  preselectedExpenseSubaccountId: string | null;
  openNewExpenseModal: (subaccountId?: string) => void;
  isDistributeIncomeOpen: boolean;
  setIsDistributeIncomeOpen: (open: boolean) => void;
  preselectedIncomeSourceId: string | null;
  openDistributeIncomeModal: (incomeSourceId?: string) => void;
  isAddCardOpen: boolean;
  setIsAddCardOpen: (open: boolean) => void;
  isCashOnHandOpen: boolean;
  setIsCashOnHandOpen: (open: boolean) => void;
  openCashOnHandModal: () => void;
  isTransferBetweenCardsOpen: boolean;
  setIsTransferBetweenCardsOpen: (open: boolean) => void;
  openTransferBetweenCardsModal: () => void;
  isAddSubaccountOpen: boolean;
  setIsAddSubaccountOpen: (open: boolean) => void;
  preselectedAddSubaccountCardId: string | null;
  editingSubaccount: Subaccount | null;
  openAddSubaccountModal: (cardId?: string, subaccount?: Subaccount) => void;
  isAddIncomeSourceOpen: boolean;
  setIsAddIncomeSourceOpen: (open: boolean) => void;
  editingIncomeSource: IncomeSource | null;
  openAddIncomeSourceModal: (source?: IncomeSource) => void;

  // Calculations
  getSubaccountBalance: (subaccountId: string) => number;
  getCardBalance: (cardId: string) => number;
  getCashOnHandBalance: () => number;
  getTotalBalance: () => number;
  getSubaccountTransactions: (subaccountId: string) => Transaction[];
  getCardTransactions: (cardId: string) => Transaction[];
  getSubaccountsByCardId: (cardId: string) => Subaccount[];
  
  // Stats
  getMonthStats: (month: number, year: number) => {
    totalExpenses: number;
    totalIncomes: number;
    expensesBySubaccount: { subaccountId: string; name: string; amount: number; color: string; icon: CategoryIconName }[];
    balanceByCard: { cardId: string; bankName: string; balance: number; colorTheme: string }[];
  };

  // Actions
  addCard: (card: Omit<BankCard, 'id' | 'createdAt'>) => string;
  updateCard: (card: BankCard) => void;
  deleteCard: (cardId: string) => void;

  addSubaccount: (subaccount: Omit<Subaccount, 'id' | 'createdAt'>) => string;
  updateSubaccount: (subaccount: Subaccount) => void;
  deleteSubaccount: (subaccountId: string) => void;

  addExpense: (data: {
    subaccountId: string;
    amount: number;
    date: string;
    description: string;
    origin?: 'CARD' | 'CASH';
    sourceCardId?: string;
  }) => string;

  addCashToHand: (data: {
    sourceCardId: string;
    amount: number;
    date: string;
    description?: string;
  }) => string;

  spendCashFromHand: (data: {
    subaccountId: string;
    cardId: string;
    amount: number;
    date: string;
    description?: string;
  }) => string;

  transferBetweenCards: (data: {
    fromCardId: string;
    toCardId: string;
    amount: number;
    date: string;
    description?: string;
  }) => string;

  distributeIncome: (data: {
    totalAmount: number;
    date: string;
    description?: string;
    incomeSourceId?: string;
    distributions: { subaccountId: string; amount: number }[];
  }) => void;

  deleteTransaction: (transactionId: string) => void;

  addIncomeSource: (source: Omit<IncomeSource, 'id'>) => string;
  updateIncomeSource: (source: IncomeSource) => void;
  deleteIncomeSource: (sourceId: string) => void;
  toggleIncomeSourceActive: (sourceId: string) => void;

}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const TABLES_TO_SYNC = {
  cards: 'cards',
  subaccounts: 'subaccounts',
  transactions: 'transactions',
  incomeSources: 'income_sources',
} as const;

const syncRowsToSupabase = async <T extends { id: string }>(tableName: keyof typeof TABLES_TO_SYNC, rows: T[]) => {
  if (!hasSupabaseConfig || !supabase || rows.length === 0) return;

  const { error } = await supabase
    .from(TABLES_TO_SYNC[tableName])
    .upsert(rows, { onConflict: 'id' });

  if (error && error.code !== '42P01') {
    console.warn(`Supabase sync failed for ${TABLES_TO_SYNC[tableName]}:`, error.message);
  }
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [cards, setCards] = useState<BankCard[]>([]);
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [hideBalances, setHideBalances] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedCash = localStorage.getItem('financas-cash-movements');
      if (storedCash) {
        setCashMovements(JSON.parse(storedCash) as CashMovement[]);
      }
    } catch {
      console.warn('Failed to load cash movements from local storage');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('financas-cash-movements', JSON.stringify(cashMovements));
  }, [cashMovements]);

  const [supabaseInitialized, setSupabaseInitialized] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase || supabaseInitialized) {
      return;
    }

    const hydrateFromSupabase = async () => {
      try {
        const [cardsResult, subaccountsResult, transactionsResult, incomeSourcesResult] = await Promise.all([
          supabase.from(TABLES_TO_SYNC.cards).select('*'),
          supabase.from(TABLES_TO_SYNC.subaccounts).select('*'),
          supabase.from(TABLES_TO_SYNC.transactions).select('*'),
          supabase.from(TABLES_TO_SYNC.incomeSources).select('*'),
        ]);

        if (cardsResult.error && cardsResult.error.code !== '42P01') {
          console.warn('Supabase cards load error:', cardsResult.error.message);
        }
        if (subaccountsResult.error && subaccountsResult.error.code !== '42P01') {
          console.warn('Supabase subaccounts load error:', subaccountsResult.error.message);
        }
        if (transactionsResult.error && transactionsResult.error.code !== '42P01') {
          console.warn('Supabase transactions load error:', transactionsResult.error.message);
        }
        if (incomeSourcesResult.error && incomeSourcesResult.error.code !== '42P01') {
          console.warn('Supabase income sources load error:', incomeSourcesResult.error.message);
        }

        const hasRemoteData =
          (cardsResult.data?.length ?? 0) > 0 ||
          (subaccountsResult.data?.length ?? 0) > 0 ||
          (transactionsResult.data?.length ?? 0) > 0 ||
          (incomeSourcesResult.data?.length ?? 0) > 0;

        if (hasRemoteData) {
          if ((cardsResult.data?.length ?? 0) > 0) setCards(cardsResult.data as BankCard[]);
          if ((subaccountsResult.data?.length ?? 0) > 0) setSubaccounts(subaccountsResult.data as Subaccount[]);
          if ((transactionsResult.data?.length ?? 0) > 0) setTransactions(transactionsResult.data as Transaction[]);
          if ((incomeSourcesResult.data?.length ?? 0) > 0) setIncomeSources(incomeSourcesResult.data as IncomeSource[]);
        } else {
          await Promise.all([
            syncRowsToSupabase('cards', cards),
            syncRowsToSupabase('subaccounts', subaccounts),
            syncRowsToSupabase('transactions', transactions),
            syncRowsToSupabase('incomeSources', incomeSources),
          ]);
        }
      } catch (error) {
        console.warn('Supabase hydrate failed, using local data:', error);
      } finally {
        setSupabaseInitialized(true);
      }
    };

    void hydrateFromSupabase();
  }, [supabaseInitialized]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase || !supabaseInitialized) {
      return;
    }

    void Promise.all([
      syncRowsToSupabase('cards', cards),
      syncRowsToSupabase('subaccounts', subaccounts),
      syncRowsToSupabase('transactions', transactions),
      syncRowsToSupabase('incomeSources', incomeSources),
    ]);
  }, [cards, subaccounts, transactions, incomeSources, supabaseInitialized]);

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);

  // Modal / Detail States
  const [cardDetailId, setCardDetailId] = useState<string | null>(null);
  const [subaccountDetailId, setSubaccountDetailId] = useState<string | null>(null);
  const [isNewExpenseOpen, setIsNewExpenseOpen] = useState<boolean>(false);
  const [preselectedExpenseSubaccountId, setPreselectedExpenseSubaccountId] = useState<string | null>(null);
  const [isDistributeIncomeOpen, setIsDistributeIncomeOpen] = useState<boolean>(false);
  const [preselectedIncomeSourceId, setPreselectedIncomeSourceId] = useState<string | null>(null);
  const [isAddCardOpen, setIsAddCardOpen] = useState<boolean>(false);
  const [isCashOnHandOpen, setIsCashOnHandOpen] = useState<boolean>(false);
  const [isTransferBetweenCardsOpen, setIsTransferBetweenCardsOpen] = useState<boolean>(false);
  const [isAddSubaccountOpen, setIsAddSubaccountOpen] = useState<boolean>(false);
  const [preselectedAddSubaccountCardId, setPreselectedAddSubaccountCardId] = useState<string | null>(null);
  const [editingSubaccount, setEditingSubaccount] = useState<Subaccount | null>(null);
  const [isAddIncomeSourceOpen, setIsAddIncomeSourceOpen] = useState<boolean>(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | null>(null);

  // Keep selected index within bounds
  useEffect(() => {
    if (selectedCardIndex >= cards.length && cards.length > 0) {
      setSelectedCardIndex(0);
    }
  }, [cards.length, selectedCardIndex]);

  const currentCard = useMemo(() => {
    return cards[selectedCardIndex] || cards[0];
  }, [cards, selectedCardIndex]);

  // Calculation helpers
  const getSubaccountBalance = (subaccountId: string): number => {
    return transactions
      .filter((t) => t.subaccountId === subaccountId)
      .reduce((acc, t) => {
        if (t.type === 'INCOME') return acc + t.amount;
        if (t.type === 'EXPENSE') return acc - t.amount;
        return acc;
      }, 0);
  };

  const getCardBalance = (cardId: string): number => {
    return transactions
      .filter((t) => t.cardId === cardId && t.origin !== 'CASH')
      .reduce((acc, t) => {
        if (t.type === 'INCOME') return acc + t.amount;
        if (t.type === 'EXPENSE') return acc - t.amount;
        return acc;
      }, 0);
  };

  const getCashOnHandBalance = (): number => {
    return cashMovements.reduce((acc, m) => {
      if (m.type === 'ADD') return acc + m.amount;
      if (m.type === 'SPEND') return acc - m.amount;
      return acc;
    }, 0);
  };

  const getTotalBalance = (): number => {
    const cardAndEnvelopeNet = transactions
      .filter((t) => t.origin !== 'CASH')
      .reduce((acc, t) => {
        if (t.type === 'INCOME') return acc + t.amount;
        if (t.type === 'EXPENSE') return acc - t.amount;
        return acc;
      }, 0);

    return cardAndEnvelopeNet + getCashOnHandBalance();
  };

  const getSubaccountTransactions = (subaccountId: string): Transaction[] => {
    return transactions
      .filter((t) => t.subaccountId === subaccountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt));
  };

  const getCardTransactions = (cardId: string): Transaction[] => {
    return transactions
      .filter((t) => t.cardId === cardId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt.localeCompare(a.createdAt));
  };

  const getSubaccountsByCardId = (cardId: string): Subaccount[] => {
    return subaccounts.filter((s) => s.cardId === cardId);
  };

  // Month Statistics for Reports Screen
  const getMonthStats = (month: number, year: number) => {
    const monthTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    let totalExpenses = 0;
    let totalIncomes = 0;
    const subaccountExpenseMap: Record<string, number> = {};

    monthTransactions.forEach((t) => {
      if (t.type === 'EXPENSE') {
        totalExpenses += t.amount;
        subaccountExpenseMap[t.subaccountId] = (subaccountExpenseMap[t.subaccountId] || 0) + t.amount;
      } else if (t.type === 'INCOME') {
        totalIncomes += t.amount;
      }
    });

    const expensesBySubaccount = Object.entries(subaccountExpenseMap)
      .map(([subId, amount]) => {
        const sub = subaccounts.find((s) => s.id === subId);
        return {
          subaccountId: subId,
          name: sub?.name || 'Desconhecido',
          amount,
          color: sub?.color || '#0284c7',
          icon: sub?.icon || 'piggy-bank',
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const balanceByCard = cards.map((card) => {
      const balance = getCardBalance(card.id);
      return {
        cardId: card.id,
        bankName: card.bankId === 'OUTRO' ? (card.customBankName || 'Outro') : card.bankId,
        balance,
        colorTheme: card.colorTheme,
      };
    });

    return {
      totalExpenses,
      totalIncomes,
      expensesBySubaccount,
      balanceByCard,
    };
  };

  // Modal helpers
  const openNewExpenseModal = (subaccountId?: string) => {
    setPreselectedExpenseSubaccountId(subaccountId || null);
    setIsNewExpenseOpen(true);
  };

  const openDistributeIncomeModal = (incomeSourceId?: string) => {
    setPreselectedIncomeSourceId(incomeSourceId || null);
    setIsDistributeIncomeOpen(true);
  };

  const openCashOnHandModal = () => {
    setIsCashOnHandOpen(true);
  };

  const openTransferBetweenCardsModal = () => {
    setIsTransferBetweenCardsOpen(true);
  };

  const openAddSubaccountModal = (cardId?: string, subaccount?: Subaccount) => {
    setPreselectedAddSubaccountCardId(cardId || currentCard?.id || null);
    setEditingSubaccount(subaccount || null);
    setIsAddSubaccountOpen(true);
  };

  const openAddIncomeSourceModal = (source?: IncomeSource) => {
    setEditingIncomeSource(source || null);
    setIsAddIncomeSourceOpen(true);
  };

  // Action methods
  const addCard = (cardData: Omit<BankCard, 'id' | 'createdAt'>): string => {
    const newId = `card-${Date.now()}`;
    const newCard: BankCard = {
      ...cardData,
      id: newId,
      createdAt: getTodayDateString(),
    };
    setCards((prev) => [...prev, newCard]);
    return newId;
  };

  const updateCard = (updatedCard: BankCard) => {
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
  };

  const deleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    const subIdsToRemove = subaccounts.filter((s) => s.cardId === cardId).map((s) => s.id);
    setSubaccounts((prev) => prev.filter((s) => s.cardId !== cardId));
    setTransactions((prev) => prev.filter((t) => t.cardId !== cardId && !subIdsToRemove.includes(t.subaccountId)));
    if (cardDetailId === cardId) setCardDetailId(null);
  };

  const addSubaccount = (subData: Omit<Subaccount, 'id' | 'createdAt'>): string => {
    const newId = `sub-${Date.now()}`;
    const newSub: Subaccount = {
      ...subData,
      id: newId,
      createdAt: getTodayDateString(),
    };
    setSubaccounts((prev) => [...prev, newSub]);
    return newId;
  };

  const updateSubaccount = (updatedSub: Subaccount) => {
    setSubaccounts((prev) => prev.map((s) => (s.id === updatedSub.id ? updatedSub : s)));
  };

  const deleteSubaccount = (subaccountId: string) => {
    setSubaccounts((prev) => prev.filter((s) => s.id !== subaccountId));
    setTransactions((prev) => prev.filter((t) => t.subaccountId !== subaccountId));
    if (subaccountDetailId === subaccountId) setSubaccountDetailId(null);
  };

  const addExpense = ({
    subaccountId,
    amount,
    date,
    description,
    origin = 'CARD',
    sourceCardId,
  }: {
    subaccountId: string;
    amount: number;
    date: string;
    description: string;
    origin?: 'CARD' | 'CASH';
    sourceCardId?: string;
  }): string => {
    const sub = subaccounts.find((s) => s.id === subaccountId);
    if (!sub) throw new Error('Subconta não encontrada');

    const txId = `tx-exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newTx: Transaction = {
      id: txId,
      subaccountId,
      cardId: sub.cardId,
      type: 'EXPENSE',
      amount,
      date: date || getTodayDateString(),
      description: description.trim() || `Gasto em ${sub.name}`,
      origin,
      sourceCardId: sourceCardId || sub.cardId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    if (origin === 'CASH') {
      const cashEntryId = `cash-spend-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const cashEntry: CashMovement = {
        id: cashEntryId,
        type: 'SPEND',
        amount,
        sourceCardId: sourceCardId || sub.cardId,
        subaccountId,
        cardId: sub.cardId,
        date: date || getTodayDateString(),
        description: description.trim() || `Gasto em ${sub.name}`,
        createdAt: new Date().toISOString(),
      };
      setCashMovements((prev) => [cashEntry, ...prev]);
    }

    return txId;
  };

  const addCashToHand = ({
    sourceCardId,
    amount,
    date,
    description = 'Retirada para dinheiro em mão',
  }: {
    sourceCardId: string;
    amount: number;
    date: string;
    description?: string;
  }): string => {
    const cashId = `cash-add-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newMovement: CashMovement = {
      id: cashId,
      type: 'ADD',
      amount,
      sourceCardId,
      date: date || getTodayDateString(),
      description: description.trim() || 'Retirada para dinheiro em mão',
      createdAt: new Date().toISOString(),
    };

    setCashMovements((prev) => [newMovement, ...prev]);
    return cashId;
  };

  const spendCashFromHand = ({
    subaccountId,
    cardId,
    amount,
    date,
    description,
  }: {
    subaccountId: string;
    cardId: string;
    amount: number;
    date: string;
    description?: string;
  }): string => {
    const txId = `tx-cash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const cashId = `cash-spend-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const txDate = date || getTodayDateString();
    const sub = subaccounts.find((s) => s.id === subaccountId);
    const entryDescription = description?.trim() || (sub ? `Gasto em ${sub.name}` : 'Gasto em dinheiro em mão');

    const newTx: Transaction = {
      id: txId,
      subaccountId,
      cardId,
      type: 'EXPENSE',
      amount,
      date: txDate,
      description: entryDescription,
      origin: 'CASH',
      sourceCardId: cardId,
      createdAt: new Date().toISOString(),
    };

    const newMovement: CashMovement = {
      id: cashId,
      type: 'SPEND',
      amount,
      sourceCardId: cardId,
      subaccountId,
      cardId,
      date: txDate,
      description: entryDescription,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCashMovements((prev) => [newMovement, ...prev]);
    return txId;
  };

  const transferBetweenCards = ({
    fromCardId,
    toCardId,
    amount,
    date,
    description,
  }: {
    fromCardId: string;
    toCardId: string;
    amount: number;
    date: string;
    description?: string;
  }): string => {
    if (!fromCardId || !toCardId || fromCardId === toCardId) {
      throw new Error('Selecione dois cartões diferentes para transferir o dinheiro.');
    }

    if (amount <= 0) {
      throw new Error('O valor da transferência deve ser maior que zero.');
    }

    const txDate = date || getTodayDateString();
    const transferNote = description?.trim() || 'Transferência entre cartões';

    const sourceTx: Transaction = {
      id: `tx-transfer-out-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      subaccountId: `transfer-${fromCardId}`,
      cardId: fromCardId,
      type: 'EXPENSE',
      amount,
      date: txDate,
      description: `${transferNote} (saída)`,
      origin: 'TRANSFER',
      sourceCardId: fromCardId,
      targetCardId: toCardId,
      createdAt: new Date().toISOString(),
    };

    const targetTx: Transaction = {
      id: `tx-transfer-in-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      subaccountId: `transfer-${toCardId}`,
      cardId: toCardId,
      type: 'INCOME',
      amount,
      date: txDate,
      description: `${transferNote} (entrada)`,
      origin: 'TRANSFER',
      sourceCardId: fromCardId,
      targetCardId: toCardId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [sourceTx, targetTx, ...prev]);
    return sourceTx.id;
  };

  const distributeIncome = ({
    totalAmount,
    date,
    description,
    incomeSourceId,
    distributions,
  }: {
    totalAmount: number;
    date: string;
    description?: string;
    incomeSourceId?: string;
    distributions: { subaccountId: string; amount: number }[];
  }) => {
    const newTransactions: Transaction[] = [];
    const txDate = date || getTodayDateString();
    const source = incomeSources.find((s) => s.id === incomeSourceId);
    const baseDesc = description?.trim() || (source ? `Entrada de ${source.name}` : 'Distribuição de Renda');

    distributions.forEach((item) => {
      if (item.amount > 0) {
        const sub = subaccounts.find((s) => s.id === item.subaccountId);
        if (sub) {
          newTransactions.push({
            id: `tx-inc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            subaccountId: sub.id,
            cardId: sub.cardId,
            type: 'INCOME',
            amount: item.amount,
            date: txDate,
            description: `${baseDesc} (${sub.name})`,
            incomeSourceId,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    if (newTransactions.length > 0) {
      setTransactions((prev) => [...newTransactions, ...prev]);
    }
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  const addIncomeSource = (sourceData: Omit<IncomeSource, 'id'>): string => {
    const newId = `inc-${Date.now()}`;
    const newSource: IncomeSource = {
      ...sourceData,
      id: newId,
    };
    setIncomeSources((prev) => [...prev, newSource]);
    return newId;
  };

  const updateIncomeSource = (updatedSource: IncomeSource) => {
    setIncomeSources((prev) => prev.map((s) => (s.id === updatedSource.id ? updatedSource : s)));
  };

  const deleteIncomeSource = (sourceId: string) => {
    setIncomeSources((prev) => prev.filter((s) => s.id !== sourceId));
  };

  const toggleIncomeSourceActive = (sourceId: string) => {
    setIncomeSources((prev) =>
      prev.map((s) => (s.id === sourceId ? { ...s, active: !s.active } : s))
    );
  };

  return (
    <FinanceContext.Provider
      value={{
        cards,
        subaccounts,
        transactions,
        cashMovements,
        incomeSources,
        activeTab,
        setActiveTab,
        hideBalances,
        setHideBalances,
        isDarkMode,
        toggleDarkMode,
        setIsDarkMode,
        selectedCardIndex,
        setSelectedCardIndex,
        currentCard,
        cardDetailId,
        setCardDetailId,
        subaccountDetailId,
        setSubaccountDetailId,
        isNewExpenseOpen,
        setIsNewExpenseOpen,
        preselectedExpenseSubaccountId,
        openNewExpenseModal,
        isDistributeIncomeOpen,
        setIsDistributeIncomeOpen,
        preselectedIncomeSourceId,
        openDistributeIncomeModal,
        isAddCardOpen,
        setIsAddCardOpen,
        isCashOnHandOpen,
        setIsCashOnHandOpen,
        openCashOnHandModal,
        isTransferBetweenCardsOpen,
        setIsTransferBetweenCardsOpen,
        openTransferBetweenCardsModal,
        isAddSubaccountOpen,
        setIsAddSubaccountOpen,
        preselectedAddSubaccountCardId,
        editingSubaccount,
        openAddSubaccountModal,
        isAddIncomeSourceOpen,
        setIsAddIncomeSourceOpen,
        editingIncomeSource,
        openAddIncomeSourceModal,
        getSubaccountBalance,
        getCardBalance,
        getCashOnHandBalance,
        getTotalBalance,
        getSubaccountTransactions,
        getCardTransactions,
        getSubaccountsByCardId,
        getMonthStats,
        addCard,
        updateCard,
        deleteCard,
        addSubaccount,
        updateSubaccount,
        deleteSubaccount,
        addExpense,
        addCashToHand,
        spendCashFromHand,
        transferBetweenCards,
        distributeIncome,
        deleteTransaction,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        toggleIncomeSourceActive,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
