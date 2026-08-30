import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  BankCard,
  Subaccount,
  Transaction,
  IncomeSource,
  ActiveTab,
  CategoryIconName,
} from '../types';
import {
  INITIAL_CARDS,
  INITIAL_SUBACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_INCOME_SOURCES,
} from '../data/initialData';
import { getTodayDateString } from '../utils/formatters';
import { supabase, hasSupabaseConfig } from '../utils/supabase';

interface FinanceContextType {
  // Data
  cards: BankCard[];
  subaccounts: Subaccount[];
  transactions: Transaction[];
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
  isAddSubaccountOpen: boolean;
  setIsAddSubaccountOpen: (open: boolean) => void;
  preselectedAddSubaccountCardId: string | null;
  openAddSubaccountModal: (cardId?: string) => void;
  isAddIncomeSourceOpen: boolean;
  setIsAddIncomeSourceOpen: (open: boolean) => void;
  editingIncomeSource: IncomeSource | null;
  openAddIncomeSourceModal: (source?: IncomeSource) => void;

  // Calculations
  getSubaccountBalance: (subaccountId: string) => number;
  getCardBalance: (cardId: string) => number;
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

  resetToDemoData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CARDS: 'financas_angola_cards_v1',
  SUBACCOUNTS: 'financas_angola_subaccounts_v1',
  TRANSACTIONS: 'financas_angola_transactions_v1',
  INCOME_SOURCES: 'financas_angola_income_sources_v1',
  HIDE_BALANCES: 'financas_angola_hide_balances_v1',
  THEME_DARK: 'financas_angola_theme_dark_v1',
};

const TABLES_TO_SYNC = {
  cards: 'cards',
  subaccounts: 'subaccounts',
  transactions: 'transactions',
  incomeSources: 'income_sources',
} as const;

const syncRowsToSupabase = async <T,>(tableName: keyof typeof TABLES_TO_SYNC, rows: T[]) => {
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
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME_DARK);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_DARK, JSON.stringify(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Load state from localStorage with fallback to initialData
  const [cards, setCards] = useState<BankCard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CARDS);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [subaccounts, setSubaccounts] = useState<Subaccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_SUBACCOUNTS;
    } catch {
      return INITIAL_SUBACCOUNTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOME_SOURCES);
      return saved ? JSON.parse(saved) : INITIAL_INCOME_SOURCES;
    } catch {
      return INITIAL_INCOME_SOURCES;
    }
  });

  const [hideBalances, setHideBalances] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIDE_BALANCES);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

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
  const [isAddSubaccountOpen, setIsAddSubaccountOpen] = useState<boolean>(false);
  const [preselectedAddSubaccountCardId, setPreselectedAddSubaccountCardId] = useState<string | null>(null);
  const [isAddIncomeSourceOpen, setIsAddIncomeSourceOpen] = useState<boolean>(false);
  const [editingIncomeSource, setEditingIncomeSource] = useState<IncomeSource | null>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBACCOUNTS, JSON.stringify(subaccounts));
  }, [subaccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOME_SOURCES, JSON.stringify(incomeSources));
  }, [incomeSources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIDE_BALANCES, JSON.stringify(hideBalances));
  }, [hideBalances]);

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
    const cardSubaccountIds = subaccounts
      .filter((s) => s.cardId === cardId)
      .map((s) => s.id);
    
    return transactions
      .filter((t) => cardSubaccountIds.includes(t.subaccountId))
      .reduce((acc, t) => {
        if (t.type === 'INCOME') return acc + t.amount;
        if (t.type === 'EXPENSE') return acc - t.amount;
        return acc;
      }, 0);
  };

  const getTotalBalance = (): number => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'INCOME') return acc + t.amount;
      if (t.type === 'EXPENSE') return acc - t.amount;
      return acc;
    }, 0);
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

  const openAddSubaccountModal = (cardId?: string) => {
    setPreselectedAddSubaccountCardId(cardId || currentCard?.id || null);
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
    // Remove related subaccounts & transactions
    const subIdsToRemove = subaccounts.filter((s) => s.cardId === cardId).map((s) => s.id);
    setSubaccounts((prev) => prev.filter((s) => s.cardId !== cardId));
    setTransactions((prev) => prev.filter((t) => !subIdsToRemove.includes(t.subaccountId)));
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
  }: {
    subaccountId: string;
    amount: number;
    date: string;
    description: string;
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
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return txId;
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

  const resetToDemoData = () => {
    setCards(INITIAL_CARDS);
    setSubaccounts(INITIAL_SUBACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setIncomeSources(INITIAL_INCOME_SOURCES);
    setSelectedCardIndex(0);
    setCardDetailId(null);
    setSubaccountDetailId(null);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.SUBACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.INCOME_SOURCES);
  };

  return (
    <FinanceContext.Provider
      value={{
        cards,
        subaccounts,
        transactions,
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
        isAddSubaccountOpen,
        setIsAddSubaccountOpen,
        preselectedAddSubaccountCardId,
        openAddSubaccountModal,
        isAddIncomeSourceOpen,
        setIsAddIncomeSourceOpen,
        editingIncomeSource,
        openAddIncomeSourceModal,
        getSubaccountBalance,
        getCardBalance,
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
        distributeIncome,
        deleteTransaction,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        toggleIncomeSourceActive,
        resetToDemoData,
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
