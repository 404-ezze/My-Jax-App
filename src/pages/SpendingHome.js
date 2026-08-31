import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../App';
import Spending from './Spending';
import { 
  FiArrowDownRight, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiSearch, 
  FiCreditCard,
  FiCalendar,
  FiLoader,
  FiX,
  FiTrendingDown,
  FiActivity,
  FiTag,
  FiShoppingBag,
  FiCoffee,
  FiTruck,
  FiHome,
  FiBook,
  FiDollarSign,
  FiInbox
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
    let icon = <FiTag size={12} />;

    if (cat.includes('pokok') || cat.includes('makan')) {
      bg = '#F0FDF4'; text = '#15803D'; icon = <FiCoffee size={12} />;
    } else if (cat.includes('jajan') || cat.includes('hiburan')) {
      bg = '#FEFCE8'; text = '#A16207'; icon = <FiShoppingBag size={12} />;
    } else if (cat.includes('transport')) {
      bg = '#EFF6FF'; text = '#1D4ED8'; icon = <FiTruck size={12} />;
    } else if (cat.includes('kost') || cat.includes('tagihan')) {
      bg = '#FEF2F2'; text = '#B91C1C'; icon = <FiHome size={12} />;
    } else if (cat.includes('edukasi') || cat.includes('karier')) {
      bg = '#FAF5FF'; text = '#7E22CE'; icon = <FiBook size={12} />;
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: text, 
        padding: '4px 10px', 
        borderRadius: '8px', 
        fontSize: '11px', 
        fontWeight: '600', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '6px' 
      }}>
        {icon}
        {catName || 'Umum'}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', color: '#1E293B', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* CSS Khusus Layout Responsif SpendingHome */}
      <style>{`
        /* Grid KPI: 2 Kolom di Layar HP, 4 Kolom di Layar Desktop */
        .kpi-grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        /* Filter Transaksi Bar */
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
          .kpi-grid-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
          .filter-controls-container {
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            width: auto;
          }
          .filter-dropdowns-row {
            display: flex;
            width: auto;
          }
        }
      `}</style>

      {/* Header Utama */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <div style={{ background: '#F1F5F9', color: '#334155', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <FiDollarSign size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
              Spending Hub
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
            Monitoring arus kas dan alokasi anggaran personal.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '340px', justifyContent: 'flex-start' }}>
          <button 
            onClick={() => setShowBalanceModal(true)}
            style={{
              flex: 1,
              background: '#FFFFFF', 
              color: '#334155', 
              border: '1px solid #E2E8F0',
              padding: '9px 12px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '600',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <FiCreditCard size={14} color="#475569" />
            <span>Atur Saldo</span>
          </button>

          <button 
            onClick={() => setIsFormOpen(true)}
            style={{
              flex: 1.3,
              background: '#0F172A', 
              color: '#FFFFFF', 
              border: 'none',
              padding: '9px 14px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '600',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
            }}
          >
            <FiPlus size={15} />
            <span>Tambah Catatan</span>
          </button>
        </div>
      </div>

      {/* Bar Navigasi Tanggal */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px',
        padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={handlePrevPeriod} style={navIconBtnStyle} title="Periode Sebelumnya">
            <FiChevronLeft size={16} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 6px', fontWeight: '600', fontSize: '12px', color: '#0F172A' }}>
            <FiCalendar size={14} color="#64748B" />
            <span>
              {periodType === 'month' 
                ? `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                : `Mgg ${Math.ceil(selectedDate.getDate() / 7)}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              }
            </span>
          </div>

          <button onClick={handleNextPeriod} style={navIconBtnStyle} title="Periode Berikutnya">
            <FiChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
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
      </div>

      {/* 4 Kartu Metrik KPI (2x2 di Mobile) */}
      <div className="kpi-grid-container">
        
        {/* Card 1: Total Pengeluaran */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #E11D48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#9F1239' }}>Pengeluaran</span>
              <div style={metricValueStyle}>
                Rp {totalExpense.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ background: '#FFE4E6', color: '#E11D48', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiTrendingDown size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#881337', fontWeight: '500' }}>
            {periodTransactions.filter(t => t[2] === 'Expense').length} item transaksi
          </div>
        </div>

        {/* Card 2: Rata-rata Harian */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#92400E' }}>Rata-rata/Hari</span>
              <div style={metricValueStyle}>
                Rp {dailyAverage.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiActivity size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#78350F', fontWeight: '500' }}>
            Rentang {daysInPeriod} hari
          </div>
        </div>

        {/* Card 3: Total Pemasukan */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#065F46' }}>Pemasukan</span>
              <div style={metricValueStyle}>
                Rp {totalIncome.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ background: '#D1FAE5', color: '#059669', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiArrowDownRight size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#064E3B', fontWeight: '500' }}>
            +{periodTransactions.filter(t => t[2] === 'Income').length} item masuk
          </div>
        </div>

        {/* Card 4: Kapasitas Saldo */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={metricLabelStyle}>Sisa Saldo</span>
              <div style={metricValueStyle}>
                Rp {netBalance.toLocaleString('id-ID')}
              </div>
            </div>
            <div style={{ background: '#F1F5F9', color: '#334155', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiCreditCard size={15} />
            </div>
          </div>

          <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              fontSize: '9px', 
              fontWeight: '700', 
              padding: '1px 5px', 
              borderRadius: '4px', 
              background: netBalance >= 0 ? '#DCFCE7' : '#FEE2E2', 
              color: netBalance >= 0 ? '#15803D' : '#B91C1C' 
            }}>
              {netBalance >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
        </div>

      </div>

      {/* Kontainer Daftar Transaksi & Filter Terpadu */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        {/* Header Seksi & Kontrol Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
              Daftar Transaksi
            </h2>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Catatan riwayat keuangan pada periode terpilih.
            </span>
          </div>

          {/* Form Filter Responsif (Full-width di HP) */}
          <div className="filter-controls-container">
            {/* Search Bar Input */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="text" 
                placeholder="Cari deskripsi..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px', 
                  borderRadius: '10px', 
                  border: '1px solid #E2E8F0',
                  fontSize: '12px', 
                  outline: 'none', 
                  background: '#F8FAFC', 
                  color: '#0F172A',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Dropdown Kategori & Metode (Grid 2 Kolom Seimbang di HP) */}
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

        {/* Konten Data (Card View di HP & Tabel di Desktop) */}
        {loading ? (
          <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
            <FiLoader className="spin" size={16} />
            <span>Memuat catatan...</span>
          </div>
        ) : filteredTableData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
            <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
            Tidak ada transaksi yang cocok dengan filter ini.
          </div>
        ) : (
          <>
            {/* 1. TAMPILAN MOBILE: KARTU LIST RINGKAS */}
            <div className="mobile-cards-view">
              {paginatedData.map((item, idx) => {
                const isIncome = item[2] === 'Income';
                return (
                  <div 
                    key={idx} 
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3' }}>
                          {item[4] || 'Tanpa Keterangan'}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                          {formatDateDisplay(item[1])} • {item[6] || 'Kas'}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: '700', fontSize: '13px', color: isIncome ? '#16A34A' : '#0F172A', whiteSpace: 'nowrap' }}>
                        {isIncome ? '+' : '-'} Rp {Number(item[5] || 0).toLocaleString('id-ID')}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '2px' }}>
                      {getCategoryBadge(item[3])}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. TAMPILAN DESKTOP: TABEL STANDAR */}
            <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tanggal</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Deskripsi</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Kategori</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Metode</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'right' }}>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => {
                    const isIncome = item[2] === 'Income';
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                        <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '500' }}>
                          {formatDateDisplay(item[1])}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0F172A' }}>
                          {item[4] || 'Tanpa Keterangan'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {getCategoryBadge(item[3])}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569', fontWeight: '500' }}>
                          {item[6] || 'Kas'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '600', color: isIncome ? '#16A34A' : '#0F172A' }}>
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

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B', flexWrap: 'wrap', gap: '8px' }}>
          <span>
            {filteredTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredTableData.length)} dari {filteredTableData.length} baris
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
                  background: currentPage === num ? '#0F172A' : '#FFFFFF',
                  color: currentPage === num ? '#FFFFFF' : '#475569',
                  border: currentPage === num ? '1px solid #0F172A' : '1px solid #E2E8F0'
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

      {/* Komponen Modal Form Pop-up Spending */}
      <Spending 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => fetchTransactions()} 
      />

      {/* Modal Pengaturan Saldo Kas */}
      {showBalanceModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Atur Saldo Awal</h3>
              <button onClick={() => setShowBalanceModal(false)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Tentukan saldo kas/rekening Anda untuk kalkulasi estimasi sisa dana.
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

// Styling Internal Pendukung
const metricCardBase = {
  background: '#FFFFFF',
  borderTop: '1px solid #E2E8F0',
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
  padding: '14px 12px',
  borderRadius: '14px',
  boxSizing: 'border-box',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const metricLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  display: 'block'
};

const metricValueStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#0F172A',
  marginTop: '4px',
  letterSpacing: '-0.3px'
};

const navIconBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '5px',
  borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569'
};

const activeTabBtnStyle = {
  background: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '700', color: '#0F172A', cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontFamily: 'Poppins, sans-serif'
};

const inactiveTabBtnStyle = {
  background: 'transparent', border: 'none', padding: '4px 10px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '500', color: '#64748B', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
};

const filterSelectResponsiveStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  fontSize: '11px',
  color: '#334155',
  background: '#F8FAFC',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '600',
  boxSizing: 'border-box'
};

const paginationBtnStyle = {
  padding: '4px 8px', background: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', fontWeight: '500'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF', borderRadius: '18px', padding: '20px',
  width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B'
};

const fieldLabelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const fieldInputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: '10px',
  border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', color: '#0F172A'
};

const modalCancelBtnStyle = {
  padding: '8px 14px', background: '#F1F5F9', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px', background: '#0F172A', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};