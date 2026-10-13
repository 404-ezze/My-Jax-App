import React, { useState, useEffect, useMemo } from 'react';
import './Spending.css';
import Spending from './SpendingModal';
import { fetchSheetData, appendRowToSheet, deleteRowInSheet } from '../../utils/GoogleStorage';
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiCreditCard,
  FiCalendar,
  FiLoader,
  FiShoppingBag,
  FiCoffee,
  FiCompass,
  FiHome,
  FiBookOpen,
  FiInbox,
  FiEye,
  FiEyeOff,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiRepeat,
  FiCheck,
  FiTrash2,
  FiAlertCircle,
  FiFolder,
  FiMinus,
  FiShield,
  FiUmbrella,
  FiGift,
  FiHeart
} from 'react-icons/fi';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatDateDisplay = (rawDate) => {
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

const SpendingHeaderTile = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #3B3DBF 0%, #24248A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(36, 36, 138, 0.3)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)' }} />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#FFFFFF" />
      <path d="M2 9.5H22" stroke="#3B3DBF" strokeWidth="2" />
      <circle cx="17.5" cy="14.5" r="1.8" fill="#F59E0B" />
      <rect x="5" y="13.5" width="6" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const MutationTileGraphic = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(30, 27, 75, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 17L10 11L14 15L20 9" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 9H20V14" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="4" cy="17" r="1.8" fill="#F59E0B" />
    </svg>
  </div>
);

const WalletStatusTileGraphic = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(217, 119, 6, 0.3)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(30, 27, 75, 0.15)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2.5" y="6" width="19" height="13" rx="3" fill="#1E1B4B" />
      <path d="M6 6V4.5C6 3.67 6.67 3 7.5 3H16.5C17.33 3 18 3.67 18 4.5V6" stroke="#FFFFFF" strokeWidth="1.6" />
      <path d="M15 10H21.5V15H15C13.62 15 12.5 13.88 12.5 12.5C12.5 11.12 13.62 10 15 10Z" fill="#F59E0B" />
      <circle cx="17" cy="12.5" r="1.2" fill="#1E1B4B" />
    </svg>
  </div>
);

// Tema Warna Solid Neo-Pop (Tanpa Gradien Norak)
const POCKET_THEMES = [
  { id: 'amber', accent: '#F59E0B', lightBg: '#FFFBEB' },
  { id: 'indigo', accent: '#3B3DBF', lightBg: '#EEF2FF' },
  { id: 'emerald', accent: '#059669', lightBg: '#ECFDF5' },
  { id: 'rose', accent: '#E11D48', lightBg: '#FFF1F2' },
  { id: 'purple', accent: '#8B5CF6', lightBg: '#F5F3FF' }
];

export default function SpendingHome() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
      const key = authMode === 'guest' ? 'jax_guest_spending' : 'jax_cache_spending';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  });

  const handleDeleteTransaction = async (idTransaksi) => {
    if (!window.confirm('Hapus catatan transaksi ini?')) return;

    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    try {
      if (authMode === 'google') {
        await deleteRowInSheet('Spending', idTransaksi);
        const updated = transactions.filter(item => item[0] !== idTransaksi);
        setTransactions(updated);
        localStorage.setItem('jax_cache_spending', JSON.stringify(updated));
      } else {
        const guestData = JSON.parse(localStorage.getItem('jax_guest_spending') || '[]');
        const updated = guestData.filter(item => item[0] !== idTransaksi);
        setTransactions(updated);
        localStorage.setItem('jax_guest_spending', JSON.stringify(updated));
      }
    } catch (err) {
      alert('Gagal menghapus transaksi: ' + err.message);
    }
  };

  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [showBalance, setShowBalance] = useState(true);

  // State Saldo Riil
  const [currentBalance, setCurrentBalance] = useState(() => {
    return Number(localStorage.getItem('jax_current_balance') || 0);
  });
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [inputBalance, setInputBalance] = useState('');

  // State Budget Bulanan & Harian
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(localStorage.getItem('jax_monthly_budget') || 3500000));
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  const [dailyBudget, setDailyBudget] = useState(() => Number(localStorage.getItem('jax_daily_budget') || 100000));
  const [showDailyBudgetModal, setShowDailyBudgetModal] = useState(false);
  const [dailyBudgetInput, setDailyBudgetInput] = useState('');

  // State Subs Tracker
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jax_subscriptions') || '[]');
    } catch (e) {
      return [];
    }
  });
  const [showSubsModal, setShowSubsModal] = useState(false);
  const [newSub, setNewSub] = useState({
    nama: '',
    biaya: '',
    tanggalTagihan: new Date().toISOString().split('T')[0],
    kategori: 'Tagihan',
    metodeBayar: 'GoPay'
  });
  const [payingSubId, setPayingSubId] = useState(null);

  // State Saku Mandiri (Square Modular)
  const [pockets, setPockets] = useState(() => {
  try {
    const saved = localStorage.getItem('jax_pockets');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'p1',
        nama: 'Dana Darurat',
        saldoTerkumpul: 500000,
        targetNominal: 2000000,
        themeIdx: 0,
        iconName: 'shield'
      }
    ];
  } catch (e) {
    return [];
  }
});

  const [showNewPocketModal, setShowNewPocketModal] = useState(false);
  const [newPocketForm, setNewPocketForm] = useState({
    nama: '',
    targetNominal: '',
    saldoAwal: '',
    themeIdx: 0,
    iconName: 'gift'
  });

  const [adjustPocketModal, setAdjustPocketModal] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  const savePocketsToStorage = (updated) => {
    setPockets(updated);
    localStorage.setItem('jax_pockets', JSON.stringify(updated));
  };

const handleCreatePocket = (e) => {
  e.preventDefault();
  if (!newPocketForm.nama.trim()) return;

  const newPocket = {
    id: `PKT-${Date.now()}`,
    nama: newPocketForm.nama.trim(),
    saldoTerkumpul: 0, // Otomatis mulai dari 0 tanpa input saldo awal
    targetNominal: Number(newPocketForm.targetNominal) || 0,
    themeIdx: Number(newPocketForm.themeIdx) || 0,
    iconName: newPocketForm.iconName || 'folder'
  };

  savePocketsToStorage([...pockets, newPocket]);
  setShowNewPocketModal(false);
  setNewPocketForm({ nama: '', targetNominal: '', themeIdx: 0, iconName: 'gift' });
};

  const handleDeletePocket = (pocketId) => {
    if (!window.confirm('Hapus pocket ini?')) return;
    const updated = pockets.filter(p => p.id !== pocketId);
    savePocketsToStorage(updated);
  };

  const handleAdjustPocketBalance = (e) => {
    e.preventDefault();
    if (!adjustPocketModal || !adjustAmount) return;

    const val = Number(adjustAmount);
    if (isNaN(val) || val <= 0) return;

    const updated = pockets.map(p => {
      if (p.id === adjustPocketModal.pocket.id) {
        let newBal = p.saldoTerkumpul;
        if (adjustPocketModal.action === 'add') {
          newBal += val;
        } else {
          newBal = Math.max(0, newBal - val);
        }
        return { ...p, saldoTerkumpul: newBal };
      }
      return p;
    });

    savePocketsToStorage(updated);
    setAdjustPocketModal(null);
    setAdjustAmount('');
  };

  const renderPocketIcon = (iconName, color) => {
    const props = { size: 17, color };
    switch (iconName) {
      case 'shield': return <FiShield {...props} />;
      case 'umbrella': return <FiUmbrella {...props} />;
      case 'gift': return <FiGift {...props} />;
      case 'heart': return <FiHeart {...props} />;
      default: return <FiFolder {...props} />;
    }
  };

  const totalPocketBalance = useMemo(() => {
    return pockets.reduce((sum, p) => sum + (Number(p.saldoTerkumpul) || 0), 0);
  }, [pockets]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';

      if (authMode === 'google') {
        let rows = await fetchSheetData('Spending');
        if (rows.length > 0) {
          const rowText = String(rows[0][1] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('tanggal') || rowText.includes('date') || rowText.includes('id')) {
            rows = rows.slice(1);
          }
        }
        setTransactions(rows);
        localStorage.setItem('jax_cache_spending', JSON.stringify(rows));
      } else {
        const localData = JSON.parse(localStorage.getItem('jax_guest_spending') || '[]');
        setTransactions(localData);
      }
    } catch (error) {
      console.error('Gagal mengambil data spending:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handlePrevPeriod = () => {
    const newDate = new Date(selectedDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(selectedDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const handleSaveBalance = (e) => {
    e.preventDefault();
    const newBal = Number(inputBalance);
    if (!isNaN(newBal)) {
      setCurrentBalance(newBal);
      localStorage.setItem('jax_current_balance', newBal);
    }
    setShowBalanceModal(false);
    setInputBalance('');
  };

  const periodTransactions = useMemo(() => {
    return transactions.filter(item => {
      if (!item || !item[1]) return false;
      const txDate = new Date(item[1]);
      if (isNaN(txDate.getTime())) return true;

      if (periodType === 'week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return txDate >= startOfWeek && txDate <= endOfWeek;
      } else {
        return txDate.getMonth() === selectedDate.getMonth() && txDate.getFullYear() === selectedDate.getFullYear();
      }
    });
  }, [transactions, selectedDate, periodType]);

  const totalExpense = useMemo(() => {
    return periodTransactions
      .filter(item => item[2] === 'Expense')
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [periodTransactions]);

  const totalIncome = useMemo(() => {
    return periodTransactions
      .filter(item => item[2] === 'Income')
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [periodTransactions]);

  const usagePercent = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;

  const todayDateString = new Date().toISOString().split('T')[0];
  const todayTotalExpense = useMemo(() => {
    return transactions
      .filter(item => {
        if (!item || item[2] !== 'Expense' || !item[1]) return false;
        const d = new Date(item[1]);
        if (isNaN(d.getTime())) return false;
        return d.toISOString().split('T')[0] === todayDateString;
      })
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [transactions, todayDateString]);

  const dailyUsagePercent = dailyBudget > 0 ? Math.min(Math.round((todayTotalExpense / dailyBudget) * 100), 100) : 0;

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!isNaN(val) && val > 0) {
      setMonthlyBudget(val);
      localStorage.setItem('jax_monthly_budget', val);
    }
    setShowBudgetModal(false);
    setBudgetInput('');
  };

  const handleSaveDailyBudget = (e) => {
    e.preventDefault();
    const val = Number(dailyBudgetInput);
    if (!isNaN(val) && val > 0) {
      setDailyBudget(val);
      localStorage.setItem('jax_daily_budget', val);
    }
    setShowDailyBudgetModal(false);
    setDailyBudgetInput('');
  };

  const daysInPeriod = periodType === 'week' ? 7 : new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const dailyAverage = periodTransactions.length > 0 ? Math.round(totalExpense / daysInPeriod) : 0;

  const netBalance = (currentBalance + totalIncome) - totalExpense;
  const freeCashFlow = Math.max(0, netBalance - totalPocketBalance);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(item => item[3]).filter(Boolean));
    return Array.from(cats);
  }, [transactions]);

  const availableMethods = useMemo(() => {
    const standardMethods = ['GoPay', 'ShopeePay', 'DANA', 'OVO', 'BCA', 'Mandiri', 'BRI', 'BNI', 'BSI', 'SeaBank', 'Bank Jago', 'Line Bank', 'Jenius', 'Cash'];
    const fromHistory = transactions.map(item => item[6]).filter(Boolean);
    return Array.from(new Set([...standardMethods, ...fromHistory]));
  }, [transactions]);

  const filteredTableData = useMemo(() => {
    return periodTransactions.filter(item => {
      const desc = String(item[4] || '').toLowerCase();
      const cat = String(item[3] || '').toLowerCase();
      const method = String(item[6] || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchQuery = desc.includes(query) || cat.includes(query) || method.includes(query);
      const matchCat = selectedCategory === 'ALL' || item[3] === selectedCategory;
      const matchMethod = selectedMethod === 'ALL' || item[6] === selectedMethod;

      return matchQuery && matchCat && matchMethod;
    });
  }, [periodTransactions, searchQuery, selectedCategory, selectedMethod]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(start, start + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const totalMonthlySubsCost = useMemo(() => {
    return subscriptions.reduce((sum, item) => sum + Number(item.biaya || 0), 0);
  }, [subscriptions]);

  const handleAddSubscription = (e) => {
    e.preventDefault();
    if (!newSub.nama.trim() || !newSub.biaya || !newSub.tanggalTagihan) return;

    const entry = {
      id: `SUB-${Date.now()}`,
      nama: newSub.nama.trim(),
      biaya: Number(newSub.biaya),
      tanggalTagihan: newSub.tanggalTagihan,
      kategori: newSub.kategori,
      metodeBayar: newSub.metodeBayar,
      lastPaidMonth: null
    };

    const updated = [entry, ...subscriptions];
    setSubscriptions(updated);
    localStorage.setItem('jax_subscriptions', JSON.stringify(updated));

    setNewSub({
      nama: '',
      biaya: '',
      tanggalTagihan: new Date().toISOString().split('T')[0],
      kategori: 'Tagihan',
      metodeBayar: 'GoPay'
    });
  };

  const handleDeleteSub = (subId) => {
    const updated = subscriptions.filter(s => s.id !== subId);
    setSubscriptions(updated);
    localStorage.setItem('jax_subscriptions', JSON.stringify(updated));
  };

  const handlePaySubscription = async (sub) => {
    setPayingSubId(sub.id);
    const today = new Date().toISOString().split('T')[0];
    const rowId = `SP-${Date.now()}`;
    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';

    const newRow = [
      rowId,
      today,
      'Expense',
      sub.kategori || 'Tagihan',
      `Langganan: ${sub.nama}`,
      Number(sub.biaya),
      sub.metodeBayar || 'Cash'
    ];

    try {
      if (authMode === 'google') {
        await appendRowToSheet('Spending', newRow);
        const existingTx = JSON.parse(localStorage.getItem('jax_cache_spending') || '[]');
        const updatedTx = [newRow, ...existingTx];
        localStorage.setItem('jax_cache_spending', JSON.stringify(updatedTx));
        setTransactions(updatedTx);
      } else {
        const guestTx = JSON.parse(localStorage.getItem('jax_guest_spending') || '[]');
        const updatedTx = [newRow, ...guestTx];
        localStorage.setItem('jax_guest_spending', JSON.stringify(updatedTx));
        setTransactions(updatedTx);
      }

      const updatedSubs = subscriptions.map(s => {
        if (s.id === sub.id) {
          return { ...s, lastPaidMonth: currentMonthKey };
        }
        return s;
      });
      setSubscriptions(updatedSubs);
      localStorage.setItem('jax_subscriptions', JSON.stringify(updatedSubs));
      fetchTransactions();
    } catch (err) {
      console.error('Gagal mencatat transaksi langganan:', err);
    } finally {
      setPayingSubId(null);
    }
  };

  const getCategoryBadge = (catName) => {
    const cat = String(catName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';
    let icon = <FiShoppingBag size={11} />;

    if (cat.includes('pokok') || cat.includes('makan')) {
      bg = 'rgba(5, 150, 105, 0.12)'; text = '#059669'; icon = <FiCoffee size={11} />;
    } else if (cat.includes('jajan') || cat.includes('hiburan')) {
      bg = 'rgba(245, 158, 11, 0.15)'; text = '#D97706'; icon = <FiShoppingBag size={11} />;
    } else if (cat.includes('transport')) {
      bg = 'rgba(46, 49, 146, 0.1)'; text = '#2E3192'; icon = <FiCompass size={11} />;
    } else if (cat.includes('kost') || cat.includes('tagihan')) {
      bg = 'rgba(225, 29, 72, 0.1)'; text = '#E11D48'; icon = <FiHome size={11} />;
    } else if (cat.includes('edukasi') || cat.includes('karier')) {
      bg = 'rgba(124, 58, 237, 0.12)'; text = '#7C3AED'; icon = <FiBookOpen size={11} />;
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: text,
        padding: '3px 8px',
        borderRadius: '7px',
        fontSize: '11px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {icon}
        {catName || 'Umum'}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', paddingBottom: '110px' }}>

      {/* 1. HERO BANNER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 45%, #4338CA 100%)',
        padding: '24px 20px 65px 20px',
        color: '#FFFFFF',
        overflow: 'hidden'
      }}>
        <svg style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.85, pointerEvents: 'none' }} width="75" height="24" viewBox="0 0 80 20" fill="none">
          <path d="M2 10 Q 12 0, 22 10 T 42 10 T 62 10 T 78 10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>

        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '90px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          border: '3px solid #F59E0B',
          opacity: 0.35,
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{
              display: 'inline-block',
              background: '#F59E0B',
              color: '#1E1B4B',
              fontSize: '10px',
              fontWeight: '600',
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
            }}>
              Financial Tracker
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SpendingHeaderTile />
              <div>
                <h1 style={{ margin: 0, fontSize: '21px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
                  Spending Hub
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400' }}>
                  Pantau arus kas, alokasi pocket impian, dan tagihan rutin Anda.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '380px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowBalanceModal(true)}
              style={{
                flex: 1,
                minWidth: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                padding: '9px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <FiCreditCard size={13} color="#F59E0B" />
              <span>Atur Saldo</span>
            </button>

            <button
              onClick={() => setShowSubsModal(true)}
              style={{
                flex: 1.1,
                minWidth: '110px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '9px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <FiRepeat size={13} color="#F59E0B" />
              <span>Subs Tracker</span>
            </button>

            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                flex: 1.3,
                minWidth: '130px',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '9px 12px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
              }}
            >
              <FiPlus size={14} />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LEMBAR KONTEN PUTIH ELEGAN */}
      <div style={{
        marginTop: '-35px',
        background: '#FFFFFF',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 18px',
        boxShadow: '0 -10px 28px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>

        {/* --- MODUL SAKU PERSEGI (SQUARE MODULAR POCKETS) --- */}
        <div style={{
          background: '#FAFAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '20px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1E1B4B' }}>
                  Pocket & Alokasi Impian
                </h3>
                <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  {pockets.length} Pocket
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Tersimpan: <strong>Rp {totalPocketBalance.toLocaleString('id-ID')}</strong> • Kas Bebas: <strong style={{ color: '#059669' }}>Rp {freeCashFlow.toLocaleString('id-ID')}</strong>
              </span>
            </div>

            <button
              onClick={() => setShowNewPocketModal(true)}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #1E1B4B',
                boxShadow: '2px 2px 0px #1E1B4B',
                color: '#1E1B4B',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <FiPlus size={13} />
              <span>Pocket</span>
            </button>
          </div>

          {/* Grid Kartu Kotak / Persegi */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '4px'
          }}>
            {pockets.map((pkt) => {
              const theme = POCKET_THEMES[pkt.themeIdx % POCKET_THEMES.length];
              const pct = pkt.targetNominal > 0 ? Math.min(Math.round((pkt.saldoTerkumpul / pkt.targetNominal) * 100), 100) : 100;

              return (
                <div
                  key={pkt.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #1E1B4B',
                    borderRadius: '16px',
                    boxShadow: '3px 3px 0px #1E1B4B',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '150px',
                    boxSizing: 'border-box',
                    position: 'relative'
                  }}
                >
                  {/* Bagian Atas: Ikon + Tombol Hapus */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: theme.lightBg,
                      border: `1.5px solid ${theme.accent}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {renderPocketIcon(pkt.iconName, theme.accent)}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePocket(pkt.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                      title="Hapus Saku"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>

                  {/* Bagian Tengah: Judul & Nominal */}
                  <div style={{ margin: '8px 0 6px 0' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#1E1B4B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }} title={pkt.nama}>
                      {pkt.nama}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '800', color: theme.accent, marginTop: '2px' }}>
                      Rp {Number(pkt.saldoTerkumpul).toLocaleString('id-ID')}
                    </div>

                    {pkt.targetNominal > 0 && (
                      <div style={{ marginTop: '4px' }}>
                        <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: theme.accent, borderRadius: '4px' }} />
                        </div>
                        <div style={{ fontSize: '9px', color: '#64748B', marginTop: '2px', fontWeight: '600' }}>
                          {pct}% dari Rp {pkt.targetNominal.toLocaleString('id-ID')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bagian Bawah: Aksi Nabung & Tarik */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setAdjustPocketModal({ pocket: pkt, action: 'add' })}
                      style={{
                        flex: 1,
                        background: theme.accent,
                        color: '#FFFFFF',
                        border: '1px solid #1E1B4B',
                        borderRadius: '6px',
                        padding: '4px 0',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <FiPlus size={10} /> Nabung
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdjustPocketModal({ pocket: pkt, action: 'withdraw' })}
                      style={{
                        flex: 1,
                        background: '#FFFFFF',
                        color: '#1E1B4B',
                        border: '1px solid #1E1B4B',
                        borderRadius: '6px',
                        padding: '4px 0',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <FiMinus size={10} /> Tarik
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* KARTU RINGKASAN SUBS TRACKER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.04) 0%, rgba(46, 49, 146, 0.07) 100%)',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>
                Subs Tracker ({subscriptions.length} Layanan Aktif)
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Beban komitmen bulanan: <strong style={{ color: '#2E3192' }}>Rp {totalMonthlySubsCost.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSubsModal(true)}
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#1E1B4B',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Kelola Tagihan</span>
            <FiChevronRight size={13} />
          </button>
        </div>

        {/* INDIKATOR BATAS ANGGARAN BULANAN */}
        <div style={{
          background: '#F59E0B',
          border: '1.5px solid #E2E8F0',
          borderRadius: '18px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#424146', textTransform: 'uppercase' }}>Belanja Bulanan</span>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#1E1B4B' }}>
                Rp {totalExpense.toLocaleString('id-ID')} / <span style={{ color: '#3d4e66', fontSize: '14px' }}>Rp {monthlyBudget.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowBudgetModal(true)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', color: '#1E1B4B' }}
              >
                Ubah Batas
              </button>
              <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', color: usagePercent >= 100 ? '#DC2626' : usagePercent >= 80 ? '#D97706' : '#b70000' }}>
                {usagePercent}% Terpakai
              </div>
            </div>
          </div>

          <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${usagePercent}%`,
              height: '100%',
              background: usagePercent >= 100 ? '#DC2626' : usagePercent >= 80 ? '#F59E0B' : 'linear-gradient(90deg, #3B3DBF, #2E3192)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* INDIKATOR BATAS BUDGET HARIAN */}
        <div style={{
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: '18px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Batas Budget Harian</span>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#1E1B4B' }}>
                Rp {todayTotalExpense.toLocaleString('id-ID')} / <span style={{ color: '#64748B', fontSize: '14px' }}>Rp {dailyBudget.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => setShowDailyBudgetModal(true)}
                style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', color: '#1E1B4B' }}
              >
                Ubah Batas
              </button>
              <div style={{ fontSize: '12px', fontWeight: '700', marginTop: '4px', color: dailyUsagePercent >= 100 ? '#DC2626' : dailyUsagePercent >= 80 ? '#D97706' : '#059669' }}>
                {dailyUsagePercent}% Terpakai
              </div>
            </div>
          </div>

          <div style={{ height: '8px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${dailyUsagePercent}%`,
              height: '100%',
              background: dailyUsagePercent >= 100 ? '#DC2626' : dailyUsagePercent >= 80 ? '#F59E0B' : 'linear-gradient(90deg, #10B981, #059669)',
              borderRadius: '10px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Navigasi Periode */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={handlePrevPeriod} style={navIconBtnStyle} title="Periode Sebelumnya">
              <FiChevronLeft size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 8px', fontWeight: '600', fontSize: '12px', color: '#1E1B4B' }}>
              <FiCalendar size={14} color="#F59E0B" />
              <span>
                {periodType === 'month'
                  ? `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                  : `Minggu ${Math.ceil(selectedDate.getDate() / 7)}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                }
              </span>
            </div>

            <button onClick={handleNextPeriod} style={navIconBtnStyle} title="Periode Berikutnya">
              <FiChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'flex', background: '#E2E8F0', padding: '3px', borderRadius: '10px' }}>
            <button
              onClick={() => { setPeriodType('month'); setCurrentPage(1); }}
              style={periodType === 'month' ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              Bulanan
            </button>
            <button
              onClick={() => { setPeriodType('week'); setCurrentPage(1); }}
              style={periodType === 'week' ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              Mingguan
            </button>
          </div>
        </div>

        {/* --- DUO CARD: MUTASI DANA & STATUS DOMPET --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '18px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MutationTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Mutasi Dana Periode Ini
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                {periodTransactions.length} transaksi
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#E11D48', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiArrowDownLeft size={13} />
                  Pengeluaran
                </span>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginTop: '4px', letterSpacing: '-0.3px' }}>
                  Rp {totalExpense.toLocaleString('id-ID')}
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  {periodTransactions.filter(t => t[2] === 'Expense').length} kali transaksi
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiArrowUpRight size={13} />
                  Dana Masuk
                </span>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginTop: '4px', letterSpacing: '-0.3px' }}>
                  +Rp {totalIncome.toLocaleString('id-ID')}
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  {periodTransactions.filter(t => t[2] === 'Income').length} kali masuk
                </span>
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.03) 0%, rgba(46, 49, 146, 0.05) 100%)',
            border: '1px solid #CBD5E1',
            borderRadius: '18px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '14px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <WalletStatusTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Status Dompet & Kas
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: netBalance >= 0 ? '#DCFCE7' : '#FEE2E2',
                color: netBalance >= 0 ? '#15803D' : '#B91C1C'
              }}>
                {netBalance >= 0 ? 'Kondisi Aman' : 'Perlu Dihemat'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
                    Sisa Saldo Kas Riil
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBalance(prev => !prev)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#64748B',
                      outline: 'none'
                    }}
                    title={showBalance ? "Sembunyikan Saldo" : "Tampilkan Saldo"}
                  >
                    {showBalance ? <FiEye size={13} /> : <FiEyeOff size={13} />}
                  </button>
                </div>

                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E1B4B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {showBalance ? `Rp ${netBalance.toLocaleString('id-ID')}` : '••••••••'}
                </div>
                <span style={{ fontSize: '10px', color: '#059669', marginTop: '2px', display: 'block', fontWeight: '500' }}>
                  Kas Bebas: Rp {freeCashFlow.toLocaleString('id-ID')}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCoffee size={12} color="#D97706" />
                  Alokasi Harian
                </span>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginTop: '3px' }}>
                  Rp {dailyAverage.toLocaleString('id-ID')}
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Rata-rata/{daysInPeriod} hari
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL RIWAYAT TRANSAKSI */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '18px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#1E1B4B' }}>
                Riwayat Transaksi
              </h2>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                Pencatatan kas masuk dan belanja pada periode terpilih.
              </span>
            </div>

            <div className="filter-controls-container">
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Cari item atau catatan..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 34px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    outline: 'none',
                    background: '#F8FAFC',
                    color: '#1E293B',
                    fontFamily: 'Poppins, sans-serif',
                    fontWeight: '500',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div className="filter-dropdowns-row">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  style={filterSelectResponsiveStyle}
                >
                  <option value="ALL">Semua Kategori</option>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select
                  value={selectedMethod}
                  onChange={(e) => { setSelectedMethod(e.target.value); setCurrentPage(1); }}
                  style={filterSelectResponsiveStyle}
                >
                  <option value="ALL">Semua Pembayaran</option>
                  {availableMethods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
              <FiLoader className="spin" size={16} color="#F59E0B" />
              <span>Memuat buku catatan kas...</span>
            </div>
          ) : filteredTableData.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
              <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
              Belum ada catatan yang cocok dengan filter pada periode ini.
            </div>
          ) : (
            <>
              <div className="mobile-cards-view">
                {paginatedData.map((item, idx) => {
                  const isIncome = item[2] === 'Income';
                  return (
                    <div
                      key={idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '13px 15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 2px 5px rgba(30, 27, 75, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#1E293B', lineHeight: '1.35' }}>
                            {item[4] || 'Tanpa Keterangan'}
                          </h4>
                          <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500', display: 'inline-block', marginTop: '2px' }}>
                            {formatDateDisplay(item[1])} • <strong style={{ color: '#2E3192', fontWeight: '600' }}>{item[6] || 'Cash'}</strong>
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: '600', fontSize: '13px', color: isIncome ? '#059669' : '#1E293B', whiteSpace: 'nowrap' }}>
                          {isIncome ? '+' : '-'} Rp {Number(item[5] || 0).toLocaleString('id-ID')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransaction(item[0])}
                          style={{ background: 'transparent', border: 'none', color: '#DC2626', cursor: 'pointer' }}
                          title="Hapus Transaksi"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {getCategoryBadge(item[3])}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tanggal</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Keterangan Transaksi</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Kategori</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Sumber Dana</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => {
                      const isIncome = item[2] === 'Income';
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
                          }}
                        >
                          <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '500' }}>
                            {formatDateDisplay(item[1])}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#1E293B' }}>
                            {item[4] || 'Tanpa Keterangan'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {getCategoryBadge(item[3])}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#2E3192', fontWeight: '500' }}>
                            {item[6] || 'Cash'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: isIncome ? '#059669' : '#1E293B' }}>
                            {isIncome ? '+' : '-'} Rp {Number(item[5] || 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B', flexWrap: 'wrap', gap: '8px' }}>
            <span>
              Menampilkan {filteredTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredTableData.length)} dari {filteredTableData.length} baris
            </span>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={paginationBtnStyle}
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setCurrentPage(num)}
                  style={{
                    ...paginationBtnStyle,
                    background: currentPage === num ? '#2E3192' : '#FFFFFF',
                    color: currentPage === num ? '#F59E0B' : '#475569',
                    border: currentPage === num ? '1px solid #2E3192' : '1px solid #E2E8F0',
                    fontWeight: currentPage === num ? '600' : '500'
                  }}
                >
                  {num}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={paginationBtnStyle}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>

      <Spending
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchTransactions()}
      />

      {/* MODAL BUAT SAKU BARU */}
      {showNewPocketModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#FEF3C7', border: '1.5px solid #1E1B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E1B4B' }}>
                  <FiFolder size={15} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E1B4B' }}>Buat Pocket Baru</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Pos dana impian modular</span>
                </div>
              </div>
              <button onClick={() => setShowNewPocketModal(false)} style={iconCloseBtnStyle}>✕</button>
            </div>

            <form onSubmit={handleCreatePocket}>
              <div style={{ marginBottom: '12px' }}>
                <label style={fieldLabelStyle}>Nama Pocket *</label>
                <input
                  type="text"
                  placeholder="Misal: Liburan, Laptop Baru"
                  value={newPocketForm.nama}
                  onChange={(e) => setNewPocketForm({ ...newPocketForm, nama: e.target.value })}
                  style={fieldInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={fieldLabelStyle}>Target Dana (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 2000000"
                    value={newPocketForm.targetNominal}
                    onChange={(e) => setNewPocketForm({ ...newPocketForm, targetNominal: e.target.value })}
                    style={fieldInputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={fieldLabelStyle}>Ikon Pocket</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'gift', icon: <FiGift size={15} /> },
                    { id: 'umbrella', icon: <FiUmbrella size={15} /> },
                    { id: 'shield', icon: <FiShield size={15} /> },
                    { id: 'heart', icon: <FiHeart size={15} /> },
                    { id: 'folder', icon: <FiFolder size={15} /> }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNewPocketForm({ ...newPocketForm, iconName: item.id })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '8px',
                        border: newPocketForm.iconName === item.id ? '2px solid #1E1B4B' : '1px solid #CBD5E1',
                        background: newPocketForm.iconName === item.id ? '#FEF3C7' : '#FFFFFF',
                        color: '#1E1B4B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle}>Aksen Warna</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {POCKET_THEMES.map((thm, idx) => (
                    <button
                      key={thm.id}
                      type="button"
                      onClick={() => setNewPocketForm({ ...newPocketForm, themeIdx: idx })}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: thm.accent,
                        border: newPocketForm.themeIdx === idx ? '2.5px solid #1E1B4B' : '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                <button type="button" onClick={() => setShowNewPocketModal(false)} style={modalCancelBtnStyle}>Batal</button>
                <button type="submit" style={modalSubmitBtnStyle}>Buat Pocket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NABUNG / TARIK DANA */}
      {adjustPocketModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E1B4B' }}>
                  {adjustPocketModal.action === 'add' ? 'Nabung ke Saku' : 'Tarik dari Saku'}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {adjustPocketModal.pocket.nama} (Saldo: Rp {adjustPocketModal.pocket.saldoTerkumpul.toLocaleString('id-ID')})
                </span>
              </div>
              <button onClick={() => setAdjustPocketModal(null)} style={iconCloseBtnStyle}>✕</button>
            </div>

            <form onSubmit={handleAdjustPocketBalance}>
              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle}>Nominal (Rp) *</label>
                <input
                  type="number"
                  placeholder="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  style={fieldInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setAdjustPocketModal(null)} style={modalCancelBtnStyle}>Batal</button>
                <button type="submit" style={modalSubmitBtnStyle}>
                  {adjustPocketModal.action === 'add' ? 'Simpan' : 'Tarik'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT SALDO KAS */}
      {showBalanceModal && (
        <div style={modalOverlayStyle}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E1B4B' }}>Atur Saldo Cadangan</h3>
              <button onClick={() => setShowBalanceModal(false)} style={iconCloseBtnStyle}>✕</button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Masukkan estimasi total saldo riil di seluruh rekening untuk menghitung net cashflow Anda.
            </p>
            <form onSubmit={handleSaveBalance}>
              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle}>Saldo Riil (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 2500000"
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  style={fieldInputStyle}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBalanceModal(false)} style={modalCancelBtnStyle}>Batal</button>
                <button type="submit" style={modalSubmitBtnStyle}>Simpan Saldo</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT BATAS ANGGARAN BULANAN */}
      {showBudgetModal && (
        <div className="spending-modal-overlay-home">
          <div className="spending-modal-card-home">
            <div className="spending-balance-modal-header">
              <h3 className="spending-balance-modal-title">Atur Batas Anggaran</h3>
              <button onClick={() => setShowBudgetModal(false)} className="spending-modal-close">✕</button>
            </div>
            <p className="spending-balance-modal-description">Tentukan target maksimal pengeluaran bulanan Anda untuk mengaktifkan peringatan overbudget.</p>
            <form onSubmit={handleSaveBudget}>
              <div style={{ marginBottom: '16px' }}>
                <label className="spending-home-field-label">Nominal (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 3000000"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="spending-home-field-input"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBudgetModal(false)} className="spending-home-modal-cancel">Batal</button>
                <button type="submit" className="spending-home-modal-submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT BATAS BUDGET HARIAN */}
      {showDailyBudgetModal && (
        <div className="spending-modal-overlay-home">
          <div className="spending-modal-card-home">
            <div className="spending-balance-modal-header">
              <h3 className="spending-balance-modal-title">Atur Batas Budget Harian</h3>
              <button onClick={() => setShowDailyBudgetModal(false)} className="spending-modal-close">✕</button>
            </div>
            <p className="spending-balance-modal-description">Tentukan target maksimal pengeluaran harian Anda untuk mengaktifkan notifikasi overbudget.</p>
            <form onSubmit={handleSaveDailyBudget}>
              <div style={{ marginBottom: '16px' }}>
                <label className="spending-home-field-label">Nominal Harian (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 100000"
                  value={dailyBudgetInput}
                  onChange={(e) => setDailyBudgetInput(e.target.value)}
                  className="spending-home-field-input"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowDailyBudgetModal(false)} className="spending-home-modal-cancel">Batal</button>
                <button type="submit" className="spending-home-modal-submit">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PUSAT SUBS TRACKER */}
      {showSubsModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}>
                  <FiRepeat size={15} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E1B4B' }}>Subs Tracker</h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Pantau langganan & bayar sekali klik</span>
                </div>
              </div>
              <button onClick={() => setShowSubsModal(false)} style={iconCloseBtnStyle}>✕</button>
            </div>

            <form onSubmit={handleAddSubscription} style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={fieldLabelStyle}>Nama Layanan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Spotify, Google One"
                    value={newSub.nama}
                    onChange={(e) => setNewSub({ ...newSub, nama: e.target.value })}
                    style={fieldInputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={fieldLabelStyle}>Biaya per Bulan (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 55000"
                    value={newSub.biaya}
                    onChange={(e) => setNewSub({ ...newSub, biaya: e.target.value })}
                    style={fieldInputStyle}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={fieldLabelStyle}>Tanggal Jatuh Tempo *</label>
                <input
                  type="date"
                  value={newSub.tanggalTagihan}
                  onChange={(e) => setNewSub({ ...newSub, tanggalTagihan: e.target.value })}
                  style={fieldInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={fieldLabelStyle}>Kategori</label>
                  <select
                    value={newSub.kategori}
                    onChange={(e) => setNewSub({ ...newSub, kategori: e.target.value })}
                    style={{ ...fieldInputStyle, height: '38px', padding: '6px 8px' }}
                  >
                    <option value="Tagihan">Tagihan</option>
                    <option value="Hiburan">Hiburan</option>
                    <option value="Edukasi">Edukasi</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Umum">Umum</option>
                  </select>
                </div>
                <div>
                  <label style={fieldLabelStyle}>Metode Bayar</label>
                  <select
                    value={newSub.metodeBayar}
                    onChange={(e) => setNewSub({ ...newSub, metodeBayar: e.target.value })}
                    style={{ ...fieldInputStyle, height: '38px', padding: '6px 8px' }}
                  >
                    <option value="GoPay">GoPay</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="DANA">DANA</option>
                    <option value="OVO">OVO</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                    <option value="BSI">BSI</option>
                    <option value="SeaBank">SeaBank</option>
                    <option value="Bank Jago">Bank Jago</option>
                    <option value="Line Bank">Line Bank</option>
                    <option value="Jenius">Jenius</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FiPlus size={14} />
                <span>Simpan Tagihan</span>
              </button>
            </form>

            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Daftar Tagihan ({subscriptions.length})
              </span>

              {subscriptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 10px', color: '#94A3B8', fontSize: '12px' }}>
                  Belum ada langganan yang dicatat.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {subscriptions.map((sub) => {
                    const isPaidThisMonth = sub.lastPaidMonth === currentMonthKey;
                    const targetDate = new Date(sub.tanggalTagihan);
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);

                    const currentDueDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), targetDate.getDate() || 1);
                    currentDueDate.setHours(0, 0, 0, 0);

                    const diffTime = currentDueDate - todayDate;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isDueSoon = !isPaidThisMonth && diffDays >= 0 && diffDays <= 3;

                    return (
                      <div
                        key={sub.id}
                        style={{
                          background: '#FFFFFF',
                          border: isDueSoon ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>{sub.nama}</span>
                            {isPaidThisMonth ? (
                              <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#15803D', padding: '2px 6px', borderRadius: '6px', fontWeight: '600' }}>
                                Lunas Bulan Ini
                              </span>
                            ) : isDueSoon ? (
                              <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '6px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <FiAlertCircle size={10} /> H-{diffDays === 0 ? 'Hari Ini' : diffDays}
                              </span>
                            ) : (
                              <span style={{ fontSize: '10px', background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '6px', fontWeight: '500' }}>
                                Jatuh Tempo: {formatDateDisplay(sub.tanggalTagihan)}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            Rp {Number(sub.biaya).toLocaleString('id-ID')} • {sub.metodeBayar} ({sub.kategori})
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handlePaySubscription(sub)}
                            disabled={isPaidThisMonth || payingSubId === sub.id}
                            style={{
                              background: isPaidThisMonth ? '#F1F5F9' : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                              color: isPaidThisMonth ? '#94A3B8' : '#FFFFFF',
                              border: 'none',
                              padding: '7px 11px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: isPaidThisMonth ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {payingSubId === sub.id ? (
                              <FiLoader className="spin" size={12} />
                            ) : (
                              <FiCheck size={12} />
                            )}
                            <span>{isPaidThisMonth ? 'Tercatat' : 'Bayar & Catat'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSub(sub.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              borderRadius: '6px'
                            }}
                            title="Hapus Langganan"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setShowSubsModal(false)}
                style={modalCancelBtnStyle}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const navIconBtnStyle = {
  background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '6px',
  borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1E1B4B'
};

const activeTabBtnStyle = {
  background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)',
  border: 'none', padding: '5px 12px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '500', color: '#FFFFFF', cursor: 'pointer',
  boxShadow: '0 2px 6px rgba(46, 49, 146, 0.25)', fontFamily: 'Poppins, sans-serif'
};

const inactiveTabBtnStyle = {
  background: 'transparent', border: 'none', padding: '5px 12px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '500', color: '#64748B', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
};

const filterSelectResponsiveStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '10px',
  border: '1px solid #CBD5E1',
  fontSize: '11px',
  color: '#1E1B4B',
  background: '#F8FAFC',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '500',
  boxSizing: 'border-box'
};

const paginationBtnStyle = {
  padding: '5px 10px', background: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', fontWeight: '500'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(30, 27, 75, 0.55)', backdropFilter: 'blur(8px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF', borderRadius: '20px', padding: '22px',
  width: '100%', boxShadow: '0 20px 30px -10px rgba(30, 27, 75, 0.2)',
  fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B'
};

const fieldLabelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: '#1E1B4B', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const fieldInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '10px',
  border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', color: '#1E293B'
};

const modalCancelBtnStyle = {
  padding: '8px 14px', background: '#F1F5F9', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '500', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px', background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#1E1B4B', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
};