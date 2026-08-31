import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../App';
import Workiez from './Workiez';
import { 
  FiBriefcase, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiSearch, 
  FiCalendar, 
  FiLoader, 
  FiCheckCircle, 
  FiClock, 
  FiInbox, 
  FiSend, 
  FiExternalLink, 
  FiUserCheck, 
  FiEdit2, 
  FiAlertTriangle, 
  FiX, 
  FiCheck, 
  FiFileText, 
  FiActivity 
} from 'react-icons/fi';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Parser Tanggal Murni (DD-MM-YYYY)
const formatDateDisplay = (rawDate) => {
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function WorkiezHome() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Navigasi Tanggal & Periode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');
  
  // State Filter & Search Tabel
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Pop-up Form Tambah
  const [isFormOpen, setIsFormOpen] = useState(false);

  // State Modal Edit Status
  const [editingItem, setEditingItem] = useState(null);
  const [editStatus, setEditStatus] = useState('Applied');
  const [editCatatan, setEditCatatan] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = () => {
    setLoading(true);
    fetch(`${API_URL}?sheetName=Workiez`)
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
          const rowText = String(rows[0][1] || rows[0][0] || rows[0][2] || '').toLowerCase();
          if (
            rowText.includes('tanggal') || 
            rowText.includes('perusahaan') || 
            rowText.includes('posisi') || 
            rowText.includes('id') || 
            rowText.includes('workiez')
          ) {
            rows = rows.slice(1);
          }
        }

        setApplications(rows.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data Workiez:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
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

  // Cek jika lamaran sudah >= 30 hari tanpa kabar
  const checkIsOverdue = (applyDate, status) => {
    if (!applyDate) return false;
    const d = new Date(applyDate);
    if (isNaN(d.getTime())) return false;

    const st = String(status || '').toLowerCase();
    if (st !== 'applied' && st !== 'screening') return false;

    const diffTime = Math.abs(new Date() - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 30;
  };

  const overdueApplications = useMemo(() => {
    return applications.filter(item => checkIsOverdue(item[1], item[5]));
  }, [applications]);

  // Filter Periode
  const periodApplications = useMemo(() => {
    return applications.filter(item => {
      if (!item || !item[1]) return false;
      const appDate = new Date(item[1]);
      if (isNaN(appDate.getTime())) return true;

      if (periodType === 'week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return appDate >= startOfWeek && appDate <= endOfWeek;
      } else {
        return appDate.getMonth() === selectedDate.getMonth() && appDate.getFullYear() === selectedDate.getFullYear();
      }
    });
  }, [applications, selectedDate, periodType]);

  // Metrik KPI
  const totalApplied = periodApplications.length;

  const totalInReview = useMemo(() => {
    return periodApplications.filter(item => {
      const st = String(item[5] || '').toLowerCase();
      return st === 'applied' || st === 'screening';
    }).length;
  }, [periodApplications]);

  const totalInterview = useMemo(() => {
    return periodApplications.filter(item => String(item[5] || '').toLowerCase() === 'interview').length;
  }, [periodApplications]);

  const totalAccepted = useMemo(() => {
    return periodApplications.filter(item => {
      const st = String(item[5] || '').toLowerCase();
      return st === 'accepted' || st === 'offering';
    }).length;
  }, [periodApplications]);

  const uniqueCompanies = useMemo(() => {
    const comps = new Set(applications.map(item => item[2]).filter(Boolean));
    return Array.from(comps);
  }, [applications]);

  const filteredTableData = useMemo(() => {
    return periodApplications.filter(item => {
      const comp = String(item[2] || '').toLowerCase();
      const pos = String(item[3] || '').toLowerCase();
      const status = String(item[5] || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchQuery = comp.includes(query) || pos.includes(query);
      const matchComp = selectedCompany === 'ALL' || item[2] === selectedCompany;
      const matchStatus = selectedStatus === 'ALL' || status === selectedStatus.toLowerCase();

      return matchQuery && matchComp && matchStatus;
    });
  }, [periodApplications, searchQuery, selectedCompany, selectedStatus]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(start, start + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditStatus(item[5] || 'Applied');
    setEditCatatan(item[6] === '-' ? '' : (item[6] || ''));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsUpdating(true);

    const payload = {
      action: 'update',
      sheetName: 'Workiez',
      id: editingItem[0],
      rowData: [
        editingItem[0],    // [0] ID
        editingItem[1],    // [1] Tanggal_Apply
        editingItem[2],    // [2] Nama_Perusahaan
        editingItem[3],    // [3] Posisi
        editingItem[4],    // [4] Link_Loker
        editStatus,        // [5] Status
        editCatatan || '-' // [6] Catatan
      ]
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      
      const res = await response.json();
      if (res.status === 'success') {
        setEditingItem(null);
        fetchApplications();
      } else {
        alert('Gagal memperbarui status: ' + res.message);
      }
    } catch (err) {
      alert('Kendala koneksi: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (statusName) => {
    const s = String(statusName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';

    if (s === 'accepted' || s === 'offering') {
      bg = '#D1FAE5'; text = '#065F46';
    } else if (s === 'interview') {
      bg = '#FEF3C7'; text = '#92400E';
    } else if (s === 'screening' || s === 'applied') {
      bg = '#E0F2FE'; text = '#0369A1';
    } else if (s === 'rejected') {
      bg = '#FEE2E2'; text = '#991B1B';
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: text, 
        padding: '3px 8px', 
        borderRadius: '6px', 
        fontSize: '11px', 
        fontWeight: '600'
      }}>
        {statusName || 'Applied'}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', color: '#1E293B', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* CSS Responsif Khusus WorkiezHome */}
      <style>{`
        .kpi-grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 22px;
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
              <FiBriefcase size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
              Job Tracker Hub
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
            Pantau status seleksi lamaran kerja, jadwal wawancara, dan tawaran offering.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '200px' }}>
          <button 
            onClick={() => setIsFormOpen(true)}
            style={{
              width: '100%',
              background: '#0F172A', 
              color: '#FFFFFF', 
              border: 'none',
              padding: '9px 16px', 
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
            <span>Tambah Lamaran</span>
          </button>
        </div>
      </div>

      {/* Banner Peringatan Follow-up */}
      {overdueApplications.length > 0 && (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '14px',
          padding: '12px 14px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <div style={{ background: '#FEF3C7', color: '#D97706', padding: '6px', borderRadius: '8px', display: 'flex', marginTop: '2px', flexShrink: 0 }}>
            <FiAlertTriangle size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '700', color: '#92400E' }}>
              Perhatian: {overdueApplications.length} Lamaran Belum Ada Kabar (&ge; 30 Hari)
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#B45309', lineHeight: '1.4' }}>
              Lamaran di <strong>{overdueApplications.map(a => a[2]).slice(0, 3).join(', ')}{overdueApplications.length > 3 ? '...' : ''}</strong> belum ada update lebih dari 1 bulan.
            </p>
          </div>
        </div>
      )}

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
        
        {/* Card 1: Total Lamaran */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={metricLabelStyle}>Total Lamaran</span>
              <div style={metricValueStyle}>
                {totalApplied} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Aplikasi</span>
              </div>
            </div>
            <div style={{ background: '#F1F5F9', color: '#334155', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiSend size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
            Periode aktif terpilih
          </div>
        </div>

        {/* Card 2: Tahap Screening */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#0369A1' }}>Screening</span>
              <div style={metricValueStyle}>
                {totalInReview} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Review</span>
              </div>
            </div>
            <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiClock size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#075985', fontWeight: '500' }}>
            Menunggu respon HR
          </div>
        </div>

        {/* Card 3: Tahap Interview */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #D97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#92400E' }}>Interview</span>
              <div style={metricValueStyle}>
                {totalInterview} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Sesi</span>
              </div>
            </div>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiUserCheck size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#78350F', fontWeight: '500' }}>
            Tahap wawancara
          </div>
        </div>

        {/* Card 4: Diterima */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#065F46' }}>Offering</span>
              <div style={metricValueStyle}>
                {totalAccepted} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Lolos</span>
              </div>
            </div>
            <div style={{ background: '#D1FAE5', color: '#059669', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiCheckCircle size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#064E3B', fontWeight: '500' }}>
            Penawaran / diterima
          </div>
        </div>

      </div>

      {/* Kontainer Daftar Riwayat Lamaran */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        {/* Header Seksi & Kontrol Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
              Daftar Riwayat Lamaran
            </h2>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Rekapitulasi aplikasi loker yang telah dikirimkan.
            </span>
          </div>

          {/* Form Filter Responsif (Full-width di HP) */}
          <div className="filter-controls-container">
            {/* Search Bar Input */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="text" 
                placeholder="Cari perusahaan/posisi..." 
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

            {/* Dropdown Perusahaan & Status (Grid 2 Kolom Seimbang di HP) */}
            <div className="filter-dropdowns-row">
              <select 
                value={selectedCompany} 
                onChange={(e) => { setSelectedCompany(e.target.value); setCurrentPage(1); }}
                style={filterSelectResponsiveStyle}
              >
                <option value="ALL">Semua Perusahaan</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                style={filterSelectResponsiveStyle}
              >
                <option value="ALL">Semua Status</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interview">Interview</option>
                <option value="Offering">Offering</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Konten Data (Card View di HP & Tabel di Desktop) */}
        {loading ? (
          <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
            <FiLoader className="spin" size={16} />
            <span>Memuat catatan lamaran...</span>
          </div>
        ) : filteredTableData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
            <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
            Belum ada catatan lamaran kerja pada periode ini.
          </div>
        ) : (
          <>
            {/* 1. TAMPILAN MOBILE: KARTU LIST RINGKAS */}
            <div className="mobile-cards-view">
              {paginatedData.map((item, idx) => {
                const isOverdue = checkIsOverdue(item[1], item[5]);
                return (
                  <div 
                    key={idx} 
                    style={{
                      background: isOverdue ? '#FFFDF5' : '#FFFFFF',
                      border: isOverdue ? '1px solid #FDE68A' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3' }}>
                          {item[2] || '-'}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500' }}>
                          {item[3] || '-'}
                        </span>
                      </div>
                      {getStatusBadge(item[5])}
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Tgl Apply: <strong>{formatDateDisplay(item[1])}</strong></span>
                      {item[4] && item[4] !== '-' ? (
                        <a 
                          href={item[4].startsWith('http') ? item[4] : `https://${item[4]}`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                        >
                          Link Loker <FiExternalLink size={11} />
                        </a>
                      ) : (
                        <span style={{ color: '#CBD5E1' }}>-</span>
                      )}
                    </div>

                    {isOverdue && (
                      <div style={{ fontSize: '10px', color: '#B45309', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FiAlertTriangle size={11} /> &ge; 30 hari belum ada kabar
                      </div>
                    )}

                    {item[6] && item[6] !== '-' && (
                      <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', color: '#475569' }}>
                        {item[6]}
                      </div>
                    )}

                    <button 
                      onClick={() => handleOpenEdit(item)}
                      style={{
                        marginTop: '2px',
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        padding: '8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <FiEdit2 size={12} /> Ubah Status
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 2. TAMPILAN DESKTOP: TABEL STANDAR */}
            <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tanggal Apply</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Perusahaan</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Posisi</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Link Loker</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Catatan</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => {
                    const isOverdue = checkIsOverdue(item[1], item[5]);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC', background: isOverdue ? '#FFFDF5' : 'transparent' }}>
                        <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '500' }}>
                          <div>{formatDateDisplay(item[1])}</div>
                          {isOverdue && (
                            <span style={{ fontSize: '10px', color: '#B45309', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <FiAlertTriangle size={10} /> &ge; 30 hari
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0F172A' }}>
                          {item[2] || '-'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#334155', fontWeight: '500' }}>
                          {item[3] || '-'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {item[4] && item[4] !== '-' ? (
                            <a 
                              href={item[4].startsWith('http') ? item[4] : `https://${item[4]}`} 
                              target="_blank" 
                              rel="noreferrer"
                              style={{ color: '#2563EB', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}
                            >
                              Buka <FiExternalLink size={12} />
                            </a>
                          ) : (
                            <span style={{ color: '#94A3B8' }}>-</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {getStatusBadge(item[5])}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item[6] || '-'}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                          <button 
                            onClick={() => handleOpenEdit(item)}
                            style={actionEditBtnStyle}
                            title="Ubah Status & Catatan"
                          >
                            <FiEdit2 size={13} />
                            <span>Ubah</span>
                          </button>
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

      {/* Komponen Modal Form Tambah Lamaran */}
      <Workiez 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={() => fetchApplications()} 
      />

      {/* Pop-up Modal Edit Status */}
      {editingItem && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                  Perbarui Status Lamaran
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  {editingItem[2]} — {editingItem[3]}
                </span>
              </div>
              <button onClick={() => setEditingItem(null)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={formLabelStyle}>Status Terbaru</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiActivity size={14} /></span>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)} 
                    style={{ ...formInputStyle, paddingLeft: '34px' }}
                  >
                    <option value="Applied">Applied (Terkirim)</option>
                    <option value="Screening">Screening (CV Review)</option>
                    <option value="Interview">Interview (Wawancara)</option>
                    <option value="Offering">Offering (Penawaran)</option>
                    <option value="Accepted">Accepted (Diterima)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={formLabelStyle}>Catatan Follow-up / Progres</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFileText size={14} /></span>
                  <input 
                    type="text" 
                    placeholder="Contoh: Sudah follow up via email HR" 
                    value={editCatatan} 
                    onChange={(e) => setEditCatatan(e.target.value)} 
                    style={{ ...formInputStyle, paddingLeft: '34px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" disabled={isUpdating} style={modalSubmitBtnStyle}>
                  {isUpdating ? <FiLoader className="spin" size={14} /> : <FiCheck size={14} />}
                  <span>{isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
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

const actionEditBtnStyle = {
  background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '5px 10px',
  borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#334155',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
  transition: 'all 0.2s ease'
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

const formLabelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const formInputStyle = {
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
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px'
};