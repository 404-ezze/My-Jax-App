import React, { useState, useEffect, useMemo } from 'react';
import './Tasks.css';
import TasksModal from './TasksModal';
import { fetchSheetData, updateRowInSheet } from '../../utils/GoogleStorage';
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiCalendar,
  FiLoader,
  FiCheckCircle,
  FiInbox,
  FiTag,
  FiFlag,
  FiClock,
  FiSmile,
  FiZap,
  FiBookOpen,
  FiCompass,
  FiBriefcase
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

// --- MINI TILE IKON TEMATIK UNTUK TASKS & AGENDA ---
const TasksHeaderTile = () => (
  <div style={{
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #059669 0%, #046A4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)' }} />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#FFFFFF" />
      <rect x="8" y="1.5" width="8" height="3" rx="1.5" fill="#F59E0B" />
      <path d="M7.5 9L9.5 11L14 6.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7.5" y="14" width="9" height="2" rx="1" fill="#CBD5E1" />
      <rect x="7.5" y="17.5" width="6" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const ProgressTileGraphic = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)' }} />
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <rect x="5.5" y="10.5" width="2" height="4" rx="0.8" fill="#CBD5E1" />
      <rect x="9" y="8" width="2" height="6.5" rx="0.8" fill="#059669" />
      <rect x="12.5" y="5.5" width="2" height="9" rx="0.8" fill="#F59E0B" />
    </svg>
  </div>
);

const PriorityTileGraphic = () => (
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
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <path d="M10 5.5L11.3 8.2L14.3 8.6L12.1 10.7L12.6 13.7L10 12.3L7.4 13.7L7.9 10.7L5.7 8.6L8.7 8.2L10 5.5Z" fill="#F59E0B" />
    </svg>
  </div>
);

export default function TasksHome() {
  const [tasks, setTasks] = useState(() => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
      const key = authMode === 'guest' ? 'jax_guest_tasks' : 'jax_cache_tasks';
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => {
    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    const key = authMode === 'guest' ? 'jax_guest_tasks' : 'jax_cache_tasks';
    return !localStorage.getItem(key);
  });

  // State Navigasi Tanggal & Periode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');

  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // State Modal Tambah Task
  const [showFormModal, setShowFormModal] = useState(false);

  const fetchTasks = async () => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';

      if (authMode === 'google') {
        let rows = await fetchSheetData('Tasks');
        if (rows.length > 0) {
          const rowText = String(rows[0][2] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('judul') || rowText.includes('task') || rowText.includes('id') || rowText.includes('tugas')) {
            rows = rows.slice(1);
          }
        }

        const cleaned = rows.reverse();
        setTasks(cleaned);
        localStorage.setItem('jax_cache_tasks', JSON.stringify(cleaned));
      } else {
        const localData = JSON.parse(localStorage.getItem('jax_guest_tasks') || '[]');
        setTasks(localData);
      }
    } catch (err) {
      console.error('Gagal mengambil data tugas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTaskStatus = async (taskItem) => {
  const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
  const currentStatus = String(taskItem[5] || '').toLowerCase();
  const nextStatus = currentStatus === 'completed' ? 'Pending' : 'Completed';

  // Buat salinan baris dan perbarui kolom indeks ke-5 (Status)
  const updatedRow = [...taskItem];
  updatedRow[5] = nextStatus;

  try {
    if (authMode === 'google') {
      await updateRowInSheet('Tasks', taskItem[0], updatedRow);
      const updatedList = tasks.map(t => t[0] === taskItem[0] ? updatedRow : t);
      setTasks(updatedList);
      localStorage.setItem('jax_cache_tasks', JSON.stringify(updatedList));
    } else {
      const guestList = JSON.parse(localStorage.getItem('jax_guest_tasks') || '[]');
      const updatedList = guestList.map(t => t[0] === taskItem[0] ? updatedRow : t);
      setTasks(updatedList);
      localStorage.setItem('jax_guest_tasks', JSON.stringify(updatedList));
    }
  } catch (err) {
    alert('Gagal memperbarui status tugas: ' + err.message);
  }
};

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

  // Filtering & Metrics Calculation
  const periodTasks = useMemo(() => {
    return tasks.filter(item => {
      if (!item || !item[1]) return false;
      const tDate = new Date(item[1]);
      if (isNaN(tDate.getTime())) return true;

      if (periodType === 'week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return tDate >= startOfWeek && tDate <= endOfWeek;
      } else {
        return tDate.getMonth() === selectedDate.getMonth() && tDate.getFullYear() === selectedDate.getFullYear();
      }
    });
  }, [tasks, selectedDate, periodType]);

  const totalCompleted = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'completed').length;
  }, [periodTasks]);

  const totalInProgress = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'in progress').length;
  }, [periodTasks]);

  const totalPending = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'pending').length;
  }, [periodTasks]);

  const totalHighPriority = useMemo(() => {
    return periodTasks.filter(item => String(item[4] || '').toLowerCase() === 'tinggi').length;
  }, [periodTasks]);

  const completionRate = periodTasks.length > 0
    ? Math.round((totalCompleted / periodTasks.length) * 100)
    : 0;

  const uniqueCategories = useMemo(() => {
    const cats = new Set(tasks.map(item => item[3]).filter(Boolean));
    return Array.from(cats);
  }, [tasks]);

  const filteredTableData = useMemo(() => {
    return periodTasks.filter(item => {
      const title = String(item[2] || '').toLowerCase();
      const cat = String(item[3] || '').toLowerCase();
      const priority = String(item[4] || '').toLowerCase();
      const status = String(item[5] || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchQuery = title.includes(query) || cat.includes(query);
      const matchCat = selectedCategory === 'ALL' || item[3] === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || status === selectedStatus.toLowerCase();
      const matchPriority = selectedPriority === 'ALL' || priority === selectedPriority.toLowerCase();

      return matchQuery && matchCat && matchStatus && matchPriority;
    });
  }, [periodTasks, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(start, start + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const getPriorityBadge = (priorityName) => {
    const p = String(priorityName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';

    if (p.includes('tinggi') || p.includes('urgen')) {
      bg = '#FFE4E6'; text = '#9F1239';
    } else if (p.includes('sedang')) {
      bg = '#FEF3C7'; text = '#92400E';
    } else if (p.includes('rendah')) {
      bg = '#ECFDF5'; text = '#065F46';
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
        <FiFlag size={10} />
        {priorityName || 'Normal'}
      </span>
    );
  };

  const getStatusBadge = (statusName) => {
    const s = String(statusName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';
    let label = 'Tertunda';
    let icon = <FiClock size={11} />;

    if (s.includes('completed') || s.includes('selesai')) {
      bg = '#DCFCE7'; text = '#059669'; label = 'Selesai'; icon = <FiCheckCircle size={11} />;
    } else if (s.includes('progress') || s.includes('jalan')) {
      bg = 'rgba(46, 49, 146, 0.1)'; text = '#2E3192'; label = 'Berjalan'; icon = <FiZap size={11} />;
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
        {label}
      </span>
    );
  };

  const getCategoryBadge = (catName) => {
    const c = String(catName || '').toLowerCase();
    let icon = <FiTag size={11} />;
    if (c.includes('akademik') || c.includes('kuliah')) icon = <FiBookOpen size={11} />;
    else if (c.includes('proyek') || c.includes('kerja')) icon = <FiBriefcase size={11} />;
    else if (c.includes('personal') || c.includes('pribadi')) icon = <FiSmile size={11} />;
    else if (c.includes('rutin')) icon = <FiCompass size={11} />;

    return (
      <span style={{
        background: '#F1F5F9',
        color: '#475569',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {icon}
        {catName || 'Umum'}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', paddingBottom: '110px' }}>

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
              Productivity Hub
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TasksHeaderTile />
              <div>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
                  Tasks & Agenda
                </h1>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: '400' }}>
                  Rencanakan target pengerjaan, deadline tugas, dan ritme produktivitas harian.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '200px' }}>
            <button
              onClick={() => setShowFormModal(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                color: '#ffffff',
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
              <span>Tambah Tugas</span>
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

        {/* --- DUO CARD: PROGRES PENYELESAIAN & RITME TUGAS --- */}
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
                <ProgressTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Progres Penyelesaian
                </span>
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                padding: '3px 8px',
                borderRadius: '6px',
                background: completionRate >= 70 ? '#DCFCE7' : completionRate >= 40 ? '#FEF3C7' : '#F1F5F9',
                color: completionRate >= 70 ? '#059669' : completionRate >= 40 ? '#92400E' : '#475569'
              }}>
                {completionRate}% Tercapai
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B', letterSpacing: '-0.3px' }}>
                  {totalCompleted} <span style={{ fontSize: '12px', fontWeight: '500', color: '#64748B' }}>dari {periodTasks.length} agenda selesai</span>
                </div>
              </div>

              <div style={{ width: '100%', height: '7px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${completionRate}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #2E3192 0%, #059669 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', borderTop: '1px solid #E2E8F0', paddingTop: '10px' }}>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                ● {totalCompleted} Selesai
              </span>
              <span style={{ fontSize: '11px', color: '#2E3192', fontWeight: '600' }}>
                ● {totalInProgress} Berjalan
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                ● {totalPending} Antrean
              </span>
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
                <PriorityTileGraphic />
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Fokus & Atensi Segera
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                {periodTasks.length} agenda aktif
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px', borderTop: '1px solid rgba(226, 232, 240, 0.8)', paddingTop: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#E11D48', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E11D48' }}></span>
                  Prioritas Tinggi
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalHighPriority} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Tugas</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Perlu dikerjakan segera
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#2E3192', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E3192' }}></span>
                  Sedang Berjalan
                </span>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B', marginTop: '3px', letterSpacing: '-0.3px' }}>
                  {totalInProgress} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Aktif</span>
                </div>
                <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Dalam proses aktif
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Kontainer Daftar Tugas */}
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
                Daftar Tugas & Agenda
              </h2>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                Daftar target pengerjaan yang disaring berdasarkan periode terpilih.
              </span>
            </div>

            <div className="filter-controls-container">
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Cari tugas atau kata kunci..."
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

              <div className="filter-dropdowns-row-tasks">
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  style={filterSelectResponsiveStyle}
                >
                  <option value="ALL">Semua Kategori</option>
                  {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                  style={filterSelectResponsiveStyle}
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Pending">Pending (Tertunda)</option>
                  <option value="In Progress">In Progress (Berjalan)</option>
                  <option value="Completed">Completed (Selesai)</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                  style={filterSelectResponsiveStyle}
                >
                  <option value="ALL">Semua Prioritas</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
              <FiLoader className="spin" size={16} color="#F59E0B" />
              <span>Memuat lembar agenda...</span>
            </div>
          ) : filteredTableData.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
              <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
              Belum ada agenda tugas yang cocok dengan filter pada periode ini.
            </div>
          ) : (
            <>
              {/* Tampilan Mobile: Kartu Vertikal */}
              <div className="mobile-cards-view">
                {paginatedData.map((item, idx) => (
                  <div
                    key={idx}
                    className="task-card-item"
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
                        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E293B', lineHeight: '1.35' }}>
                          {item[2] || 'Tanpa Judul'}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500', display: 'inline-block', marginTop: '2px' }}>
                          Tenggat: <strong style={{ color: '#2E3192', fontWeight: '600' }}>{formatDateDisplay(item[1])}</strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(item)}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                        title="Klik untuk ubah status tugas"
                      >
                        {getStatusBadge(item[5])}
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      {getCategoryBadge(item[3])}
                      {getPriorityBadge(item[4])}
                    </div>

                    {item[6] && item[6] !== '-' && (
                      <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', color: '#475569', lineHeight: '1.4', fontWeight: '500' }}>
                        {item[6]}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Tampilan Desktop: Tabel Standar */}
              <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tenggat</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Nama Agenda / Tugas</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Kategori</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Prioritas</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 14px', fontWeight: '600' }}>Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, idx) => (
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
                        <td style={{ padding: '12px 14px', fontWeight: '700', color: '#1E293B' }}>
                          {item[2] || 'Tanpa Judul'}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {getCategoryBadge(item[3])}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          {getPriorityBadge(item[4])}
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(item)}
                        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
                        title="Klik untuk ubah status tugas"
                      >
                        {getStatusBadge(item[5])}
                      </button>
                        </td>
                        <td style={{ padding: '12px 14px', color: '#64748B', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                          {item[6] || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
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

      <TasksModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSuccess={() => fetchTasks()}
      />

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
  border: '1px solid #E2E8F0',
  fontSize: '12px',
  color: '#1E1B4B',
  background: '#F8FAFC',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '500',
  boxSizing: 'border-box',
  lineHeight: '1.4',
  height: '42px',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
};

const paginationBtnStyle = {
  padding: '5px 10px', background: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', fontWeight: '500'
};