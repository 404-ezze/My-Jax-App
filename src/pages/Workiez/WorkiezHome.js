import React, { useState, useEffect, useMemo } from 'react';
import './Workiez.css';
import WorkiezModal from './WorkiezModal';
import { fetchSheetData, updateRowInSheet } from '../../utils/GoogleStorage';
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiLoader,
  FiClock,
  FiInbox,
  FiSend,
  FiExternalLink,
  FiUserCheck,
  FiEdit2,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiFileText,
  FiActivity,
  FiAward
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

// --- TILE GRAFIS MODUL WORKIEZ (DUOTONE APPS STYLE) ---
const WorkiezHeaderTile = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(30, 27, 75, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" fill="#FFFFFF" />
      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#FFFFFF" strokeWidth="2" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="1" fill="#F59E0B" />
    </svg>
  </div>
);

const PipelineTileGraphic = () => (
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
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <FiSend size={16} color="#FFFFFF" />
  </div>
);

const InterviewTileGraphic = () => (
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
    <FiUserCheck size={18} color="#1E1B4B" />
  </div>
);

export default function WorkiezHome() {
  const [applications, setApplications] = useState(() => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
      const key = authMode === 'guest' ? 'jax_guest_workiez' : 'jax_cache_workiez';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    const key = authMode === 'guest' ? 'jax_guest_workiez' : 'jax_cache_workiez';
    return !localStorage.getItem(key);
  });

  // Navigasi Tanggal
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal Form
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Modal Edit Status
  const [editingItem, setEditingItem] = useState(null);
  const [editStatus, setEditStatus] = useState('Applied');
  const [editCatatan, setEditCatatan] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';

      if (authMode === 'google') {
        let rows = await fetchSheetData('Workiez');
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

        const cleaned = rows.reverse();
        setApplications(cleaned);
        localStorage.setItem('jax_cache_workiez', JSON.stringify(cleaned));
      } else {
        const localData = JSON.parse(localStorage.getItem('jax_guest_workiez') || '[]');
        setApplications(localData);
      }
    } catch (err) {
      console.error('Gagal mengambil data Workiez:', err);
    } finally {
      setLoading(false);
    }
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
    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    const updatedRow = [
      editingItem[0],
      editingItem[1],
      editingItem[2],
      editingItem[3],
      editingItem[4],
      editStatus,
      editCatatan || '-'
    ];

    try {
      if (authMode === 'google') {
        // 1. Perbarui baris langsung di Google Sheets via GoogleStorage
        await updateRowInSheet('Workiez', editingItem[0], updatedRow);

        // 2. Perbarui state lokal dan cache
        const updatedList = applications.map(item => item[0] === editingItem[0] ? updatedRow : item);
        setApplications(updatedList);
        localStorage.setItem('jax_cache_workiez', JSON.stringify(updatedList));
      } else {
        // Mode Tamu: Perbarui di local storage
        const guestList = JSON.parse(localStorage.getItem('jax_guest_workiez') || '[]');
        const updatedGuest = guestList.map(item => item[0] === editingItem[0] ? updatedRow : item);
        setApplications(updatedGuest);
        localStorage.setItem('jax_guest_workiez', JSON.stringify(updatedGuest));
      }

      setEditingItem(null);
    } catch (err) {
      alert('Kendala penyimpanan: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (statusName) => {
    const s = String(statusName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';
    let icon = <FiClock size={11} />;

    if (s === 'accepted' || s === 'offering') {
      bg = '#DCFCE7'; text = '#15803D'; icon = <FiAward size={11} />;
    } else if (s === 'interview') {
      bg = '#F3E8FF'; text = '#7C3AED'; icon = <FiUserCheck size={11} />;
    } else if (s === 'screening' || s === 'applied') {
      bg = 'rgba(46, 49, 146, 0.08)'; text = '#2E3192'; icon = <FiClock size={11} />;
    } else if (s === 'rejected') {
      bg = '#FEE2E2'; text = '#991B1B'; icon = <FiX size={11} />;
    }

    return (
      <span style={{
        backgroundColor: bg,
        color: text,
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {icon}
        {statusName || 'Applied'}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', paddingBottom: '70px' }}>

      {/* 1. HERO BANNER UNGU MEMPHIS DENGAN AKSEN KUNING */}
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
              Career Tracker
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WorkiezHeaderTile />
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
                  Job Tracker
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400' }}>
                  Pantau tahapan seleksi karir, jadwal wawancara, dan hasil lamaran kerja.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '210px' }}>
            <button
              onClick={() => setIsFormOpen(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                transition: 'transform 0.18s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <FiPlus size={16} />
              <span>Tambah Lamaran</span>
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
        gap: '22px'
      }}>

        {/* Banner Peringatan Bersih */}
        {overdueApplications.length > 0 && (
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            boxShadow: '0 2px 6px rgba(30, 27, 75, 0.02)'
          }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', padding: '6px', borderRadius: '8px', display: 'flex', marginTop: '2px', flexShrink: 0 }}>
              <FiAlertCircle size={15} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 2px 0', fontSize: '12px', fontWeight: '600', color: '#1E1B4B' }}>
                Perlu Follow-up: {overdueApplications.length} Lamaran Belum Ada Kabar (&ge; 30 Hari)
              </h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', lineHeight: '1.4', fontWeight: '400' }}>
                Aplikasi di <strong style={{ color: '#1E293B', fontWeight: '600' }}>{overdueApplications.map(a => a[2]).slice(0, 3).join(', ')}{overdueApplications.length > 3 ? '...' : ''}</strong> sudah berjalan lebih dari 1 bulan tanpa pembaruan.
              </p>
            </div>
          </div>
        )}

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

        {/* --- DUO CARD: PIPELINE SELEKSI & TAHAPAN WAWANCARA --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '14px' }}>

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
                <PipelineTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Pipeline Lamaran
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(46, 49, 146, 0.08)',
                color: '#2E3192'
              }}>
                {totalApplied} Aplikasi
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#2E3192', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E3192' }}></span>
                  Tahap Screening
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalInReview} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Aplikasi</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Menunggu respon HR
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94A3B8' }}></span>
                  Total Terkirim
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalApplied} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Berkas</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Periode terpilih
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
                <InterviewTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Tahapan Seleksi Lanjut
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: totalAccepted > 0 ? '#DCFCE7' : '#F1F5F9',
                color: totalAccepted > 0 ? '#15803D' : '#475569'
              }}>
                {totalAccepted > 0 ? `${totalAccepted} Lolos Seleksi` : 'Berjalan Aktif'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#7C3AED', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7C3AED' }}></span>
                  Sesi Wawancara
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalInterview} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Sesi</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  User / HR interview
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#15803D', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }}></span>
                  Offering / Diterima
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#15803D', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalAccepted} <span style={{ fontSize: '11px', fontWeight: '500', color: '#15803D' }}>Tawaran</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Penawaran kerja
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Kontainer Daftar Riwayat Lamaran */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '18px',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.02)'
        }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>
                Riwayat Aplikasi Lamaran
              </h2>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                Rekapitulasi berkas lamaran yang dikirim pada periode aktif.
              </span>
            </div>

            <div className="filter-controls-container">
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Cari perusahaan atau posisi..."
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

              <div className="filter-dropdowns-row-workiez">
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
                  <option value="Applied">Applied (Terkirim)</option>
                  <option value="Screening">Screening (Review)</option>
                  <option value="Interview">Interview (Wawancara)</option>
                  <option value="Offering">Offering</option>
                  <option value="Accepted">Accepted (Diterima)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
              <FiLoader className="spin" size={16} color="#F59E0B" />
              <span>Memuat catatan lamaran karir...</span>
            </div>
          ) : filteredTableData.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
              <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
              Belum ada catatan lamaran kerja pada periode ini.
            </div>
          ) : (
            <>
              {/* Tampilan Mobile: Kartu Vertikal */}
              <div className="mobile-cards-view">
                {paginatedData.map((item, idx) => {
                  const isOverdue = checkIsOverdue(item[1], item[5]);
                  return (
                    <div
                      key={idx}
                      className="job-card-item"
                      style={{
                        background: isOverdue ? '#F8FAFC' : '#FFFFFF',
                        border: isOverdue ? '1px solid #CBD5E1' : '1px solid #E2E8F0',
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
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E293B', lineHeight: '1.35' }}>
                            {item[2] || '-'}
                          </h4>
                          <span style={{ fontSize: '11px', color: '#475569', fontWeight: '500', display: 'inline-block', marginTop: '2px' }}>
                            {item[3] || '-'}
                          </span>
                        </div>
                        {getStatusBadge(item[5])}
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Tgl Apply: <strong style={{ color: '#2E3192', fontWeight: '600' }}>{formatDateDisplay(item[1])}</strong></span>
                        {item[4] && item[4] !== '-' ? (
                          <a
                            href={item[4].startsWith('http') ? item[4] : `https://${item[4]}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#2E3192', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}
                          >
                            Tautan Loker <FiExternalLink size={11} />
                          </a>
                        ) : (
                          <span style={{ color: '#CBD5E1' }}>-</span>
                        )}
                      </div>

                      {isOverdue && (
                        <div style={{ fontSize: '10px', color: '#D97706', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiAlertCircle size={11} /> &ge; 30 hari belum ada kabar
                        </div>
                      )}

                      {item[6] && item[6] !== '-' && (
                        <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', color: '#475569', lineHeight: '1.4', fontWeight: '500' }}>
                          {item[6]}
                        </div>
                      )}

                      <button
                        onClick={() => handleOpenEdit(item)}
                        style={{
                          marginTop: '2px',
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#1E1B4B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                          transition: 'all 0.18s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                      >
                        <FiEdit2 size={12} color="#2E3192" /> Perbarui Status
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tampilan Desktop: Tabel Standar */}
              <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tanggal Apply</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Perusahaan</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Posisi Jabatan</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tautan Loker</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status Seleksi</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Catatan</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => {
                      const isOverdue = checkIsOverdue(item[1], item[5]);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: isOverdue ? '#F8FAFC' : idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                          <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '500' }}>
                            <div>{formatDateDisplay(item[1])}</div>
                            {isOverdue && (
                              <span style={{ fontSize: '10px', color: '#D97706', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                <FiAlertCircle size={10} /> &ge; 30 hari
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1E293B' }}>
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
                                style={{ color: '#2E3192', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
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
                          <td style={{ padding: '12px 14px', color: '#64748B', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                            {item[6] || '-'}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleOpenEdit(item)}
                              style={actionEditBtnStyle}
                              title="Ubah Status & Catatan"
                            >
                              <FiEdit2 size={12} color="#2E3192" />
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

      <WorkiezModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchApplications()}
      />

      {/* Pop-up Modal Edit Status */}
      {editingItem && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '380px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1E1B4B' }}>
                  Perbarui Status
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                  {editingItem[2]} — {editingItem[3]}
                </span>
              </div>
              <button onClick={() => setEditingItem(null)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={formLabelStyle}>Tahapan Seleksi Terbaru</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiActivity size={13} /></span>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    style={{ ...formInputStyle, paddingLeft: '30px' }}
                  >
                    <option value="Applied">Applied (Terkirim)</option>
                    <option value="Screening">Screening (Review CV)</option>
                    <option value="Interview">Interview (Wawancara)</option>
                    <option value="Offering">Offering (Penawaran)</option>
                    <option value="Accepted">Accepted (Diterima)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={formLabelStyle}>Catatan / Tindak Lanjut</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiFileText size={13} /></span>
                  <input
                    type="text"
                    placeholder="Contoh: Jadwal wawancara tanggal 25"
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    style={{ ...formInputStyle, paddingLeft: '30px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setEditingItem(null)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" disabled={isUpdating} style={modalSubmitBtnStyle}>
                  {isUpdating ? <FiLoader className="spin" size={13} /> : <FiCheck size={13} />}
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
  padding: '10px 36px 10px 14px',
  borderRadius: '12px',
  border: '1px solid #CBD5E1',
  fontSize: '12px',
  color: '#1E1B4B',
  background: '#F8FAFC',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '500',
  boxSizing: 'border-box',
  lineHeight: '1.4',
  height: '42px'
};

const paginationBtnStyle = {
  padding: '5px 10px', background: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', fontWeight: '500'
};

const actionEditBtnStyle = {
  background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '5px 10px',
  borderRadius: '8px', fontSize: '11px', fontWeight: '600', color: '#1E1B4B',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
  transition: 'all 0.18s ease'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(30, 27, 75, 0.55)', backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF',
  borderRadius: '20px',
  padding: '22px',
  width: '100%',
  boxShadow: '0 20px 35px -10px rgba(30, 27, 75, 0.2)',
  fontFamily: 'Poppins, sans-serif',
  boxSizing: 'border-box',
  border: '1px solid #E2E8F0'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B'
};

const formLabelStyle = {
  display: 'block', fontSize: '10px', fontWeight: '600',
  color: '#1E1B4B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const formInputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: '8px',
  border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', color: '#1E293B',
  fontWeight: '500'
};

const modalCancelBtnStyle = {
  padding: '8px 14px', background: '#F1F5F9', border: 'none', borderRadius: '8px',
  fontSize: '11px', fontWeight: '500', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px', background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  border: 'none', borderRadius: '8px',
  fontSize: '11px', fontWeight: '600', color: '#1E1B4B', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
};