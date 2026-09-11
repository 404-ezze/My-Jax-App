import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../App';
import Spending from './Spending';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiSearch, 
  FiCreditCard,
  FiCalendar,
  FiLoader,
  FiX,
  FiShoppingBag,
  FiCoffee,
  FiCompass,
  FiHome,
  FiBookOpen,
  FiInbox,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownLeft
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

// --- MINI TILE IKON TEMATIK UNTUK SPENDING ---
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

// Tile Grafis 1: Mutasi Dana (Grafik Arus Kas & Panah Geometris)
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

// Tile Grafis 2: Status Dompet & Kas (Dompet Kulit & Koin Emas)
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

export default function SpendingHome() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Pop-up Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // State Navigasi Tanggal & Periode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');
  
  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [showBalance, setShowBalance] = useState(true);

  // State Modal Pengaturan Saldo
  const [currentBalance, setCurrentBalance] = useState(() => {
    return Number(localStorage.getItem('jax_current_balance') || 2500000);
  });
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [inputBalance, setInputBalance] = useState('');

  const fetchTransactions = () => {
    setLoading(true);
    fetch(`${API_URL}?sheetName=Spending`)
      .then(res => res.json())
      .then(resData => {
        let rows = [];
        if (Array.isArray(resData)) {
          rows = resData;
        } else if (resData && Array.isArray(resData.data)) {
          rows = resData.data;
        } else if (resData && Array.isArray(resData.values)) {
          rows = resData.values;
        }

        if (rows.length > 0) {
          const rowText = String(rows[0][1] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('tanggal') || rowText.includes('date') || rowText.includes('id') || rowText.includes('spending')) {
            rows = rows.slice(1);
          }
        }

        setTransactions(rows.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data Spending:', err);
        setLoading(false);
      });
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

  const daysInPeriod = periodType === 'week' ? 7 : new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const dailyAverage = periodTransactions.length > 0 ? Math.round(totalExpense / daysInPeriod) : 0;
  const netBalance = (currentBalance + totalIncome) - totalExpense;

  const uniqueCategories = useMemo(() => {
    const cats = new Set(transactions.map(item => item[3]).filter(Boolean));
    return Array.from(cats);
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
      
      {/* CSS Responsif Grid & Spasi */}
      <style>{`
        .spending-kpi-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .filter-controls-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .filter-dropdowns-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
        }

        @media (min-width: 641px) {
          .spending-kpi-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 22px;
          }
          .filter-controls-container {
            flex-direction: row;
            align-items: center;
            justifyContent: flex-end;
            width: auto;
          }
          .filter-dropdowns-row {
            display: flex;
            width: auto;
          }
        }
      `}</style>

      {/* 1. HERO BANNER UNGU MEMPHIS DENGAN AKSEN KUNING */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 45%, #4338CA 100%)',
        padding: '24px 20px 65px 20px',
        color: '#FFFFFF',
        overflow: 'hidden'
      }}>
        {/* Ornamen Garis Gelombang Kuning */}
        <svg style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.85, pointerEvents: 'none' }} width="75" height="24" viewBox="0 0 80 20" fill="none">
          <path d="M2 10 Q 12 0, 22 10 T 42 10 T 62 10 T 78 10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>

        {/* Ornamen Lingkaran Geometris */}
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
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
                  Spending Hub
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400' }}>
                  Pantau arus kas, alokasi anggaran, dan saldo cadangan Anda.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '320px' }}>
            <button 
              onClick={() => setShowBalanceModal(true)}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)', 
                color: '#FFFFFF', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                padding: '10px 12px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '600',
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              <FiCreditCard size={14} color="#F59E0B" />
              <span>Atur Saldo</span>
            </button>

            <button 
              onClick={() => setIsFormOpen(true)}
              style={{
                flex: 1.2,
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', 
                color: '#1E1B4B', 
                border: 'none',
                padding: '10px 14px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                fontWeight: '600', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
              }}
            >
              <FiPlus size={16} />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LEMBAR KONTEN PUTIH ELEGAN (OVERLAPPING TRAY) */}
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
        gap: '22px'
      }}>

        {/* Navigasi Periode Bergaya Modern */}
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
          
          {/* Kartu 1: Mutasi Belanja vs Masuk */}
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

          {/* Kartu 2: Status Dompet & Sisa Saldo */}
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
                    Sisa Saldo Kas
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
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Estimasi saldo saat ini
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

            {/* Form Filter Responsif */}
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
                  <option value="Gopay">Gopay</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="Jago">Bank Jago</option>
                  <option value="BNI">BNI</option>
                  <option value="Line Bank">Line Bank</option>
                  <option value="Dana">Dana</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="BCA">BCA</option>
                  <option value="Cash">Cash (Tunai)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Konten Data */}
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
              {/* 1. Tampilan Mobile: Kartu Vertikal Senada */}
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
                            {formatDateDisplay(item[1])} • <strong style={{ color: '#2E3192', fontWeight: '600' }}>{item[6] || 'Kas'}</strong>
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: '600', fontSize: '13px', color: isIncome ? '#059669' : '#1E293B', whiteSpace: 'nowrap' }}>
                          {isIncome ? '+' : '-'} Rp {Number(item[5] || 0).toLocaleString('id-ID')}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        {getCategoryBadge(item[3])}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 2. Tampilan Desktop: Tabel Elegan & Tidak Menyilaukan */}
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
                            {item[6] || 'Kas'}
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

          {/* Pagination Humanis */}
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

      {/* Komponen Modal Form Pop-up Spending */}
      <Spending 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => fetchTransactions()} 
      />

      {/* Modal Pengaturan Saldo Kas (Nuansa Ungu & Kuning) */}
      {showBalanceModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>Atur Saldo Awal</h3>
              <button onClick={() => setShowBalanceModal(false)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Tentukan saldo awal di dompet/rekening Anda untuk menghitung sisa dana otomatis.
            </p>

            <form onSubmit={handleSaveBalance}>
              <div style={{ marginBottom: '16px' }}>
                <label style={fieldLabelStyle}>Nominal Saldo (Rp)</label>
                <input 
                  type="number" 
                  placeholder="Contoh: 3500000" 
                  value={inputBalance}
                  onChange={(e) => setInputBalance(e.target.value)}
                  style={fieldInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowBalanceModal(false)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" style={modalSubmitBtnStyle}>
                  Simpan Saldo
                </button>
              </div>
            </form>
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
  fontSize: '11px', fontWeight: '600', color: '#F59E0B', cursor: 'pointer',
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