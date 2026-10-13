import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiBell, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import jaxImg from '../../assets/jaxdashbaor.png';
import { fetchSheetData } from '../../utils/GoogleStorage';
import { runNotificationEngine } from '../../utils/NotificationEngine';
import NotificationModal from '../../utils/NotificationModal';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const KODE_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const MemphisDecorations = () => (
  <>
    <svg style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.85, pointerEvents: 'none', zIndex: 1 }} width="75" height="24" viewBox="0 0 80 20" fill="none">
      <path d="M2 10 Q 12 0, 22 10 T 42 10 T 62 10 T 78 10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
    <div style={{ position: 'absolute', top: '-25px', right: '110px', width: '100px', height: '100px', borderRadius: '50%', border: '3px solid #F59E0B', opacity: 0.35, pointerEvents: 'none', zIndex: 1 }} />
    <div style={{ position: 'absolute', top: '45px', right: '30px', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(4px)', pointerEvents: 'none', zIndex: 1 }} />
    <div style={{ position: 'absolute', top: '75px', left: '-35px', width: '85px', height: '85px', borderRadius: '50%', border: '3px solid #F59E0B', opacity: 0.55, pointerEvents: 'none', zIndex: 1 }} />
    <div style={{ position: 'absolute', top: '80px', left: '38%', color: '#F59E0B', fontSize: '18px', fontWeight: '900', opacity: 0.7, userSelect: 'none', pointerEvents: 'none', zIndex: 1 }}>✕</div>
    <svg style={{ position: 'absolute', top: '105px', left: '16px', opacity: 0.35, pointerEvents: 'none', zIndex: 1 }} width="44" height="44">
      <pattern id="dot-pattern-hero" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
      </pattern>
      <rect width="44" height="44" fill="url(#dot-pattern-hero)" />
    </svg>
  </>
);

// --- TILE GRAFIS BESAR (AKSES CEPAT) ---
const SpendingTileGraphic = () => (
  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(145deg, #3B3DBF 0%, #24248A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 10px rgba(36, 36, 138, 0.28)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.25)' }} />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#FFFFFF" />
      <path d="M2 9.5H22" stroke="#3B3DBF" strokeWidth="2" />
      <circle cx="17.5" cy="14.5" r="1.8" fill="#F59E0B" />
      <rect x="5" y="13.5" width="6" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const TasksTileGraphic = () => (
  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(145deg, #059669 0%, #046A4A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#FFFFFF" />
      <rect x="8" y="1.5" width="8" height="3" rx="1.5" fill="#F59E0B" />
      <path d="M7.5 9L9.5 11L14 6.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7.5" y="14" width="9" height="2" rx="1" fill="#E2E8F0" />
      <rect x="7.5" y="17.5" width="6" height="2" rx="1" fill="#E2E8F0" />
    </svg>
  </div>
);

const WorkiezTileGraphic = () => (
  <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(145deg, #1E1B4B 0%, #0F172A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.28)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.25)' }} />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" fill="#FFFFFF" />
      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M3 12H21" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="1" fill="#F59E0B" />
      <path d="M7 16H17" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

// --- TILE GRAFIS KECIL ---
const AgendaTileGraphic = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 3px 8px rgba(46, 49, 146, 0.25)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4" width="14" height="13" rx="2.5" fill="#FFFFFF" />
      <path d="M3 8H17" stroke="#24248A" strokeWidth="1.5" />
      <circle cx="6" cy="2.5" r="1" fill="#F59E0B" />
      <circle cx="14" cy="2.5" r="1" fill="#F59E0B" />
      <circle cx="10" cy="12" r="2" fill="#F59E0B" />
      <path d="M10 11V12L11 13" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
    </svg>
  </div>
);

const PriorityTileGraphic = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 3px 8px rgba(217, 119, 6, 0.3)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(30, 27, 75, 0.2)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <path d="M10 5.5L11.3 8.2L14.3 8.6L12.1 10.7L12.6 13.7L10 12.3L7.4 13.7L7.9 10.7L5.7 8.6L8.7 8.2L10 5.5Z" fill="#F59E0B" />
    </svg>
  </div>
);

const FinanceTileGraphic = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #24248A 0%, #1E1B4B 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 3px 8px rgba(30, 27, 75, 0.25)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" fill="#FFFFFF" />
      <path d="M2.5 8H17.5" stroke="#24248A" strokeWidth="1.5" />
      <circle cx="14" cy="12" r="1.5" fill="#F59E0B" />
      <rect x="5" y="11" width="5" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const ProgressTileGraphic = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.3)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <rect x="5.5" y="10.5" width="2" height="4" rx="0.8" fill="#CBD5E1" />
      <rect x="9" y="8" width="2" height="6.5" rx="0.8" fill="#059669" />
      <rect x="12.5" y="5.5" width="2" height="9" rx="0.8" fill="#F59E0B" />
    </svg>
  </div>
);

const JobTrackerTileGraphic = () => (
  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 3px 8px rgba(30, 27, 75, 0.25)', flexShrink: 0 }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="5.5" width="15" height="11" rx="2.5" fill="#FFFFFF" />
      <path d="M6.5 5.5V4C6.5 3.17 7.17 2.5 8 2.5H12C12.83 2.5 13.5 3.17 13.5 4V5.5" stroke="#FFFFFF" strokeWidth="1.5" />
      <rect x="8.5" y="8.5" width="3" height="2.5" rx="0.8" fill="#F59E0B" />
      <path d="M2.5 9.5H17.5" stroke="#CBD5E1" strokeWidth="1.2" />
    </svg>
  </div>
);

export default function Dashboard({ onSyncNotifications }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const onSyncRef = useRef(onSyncNotifications);

  const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
  const isGoogle = authMode === 'google';
  const currentUserName = localStorage.getItem('jax_user_name') || (authMode === 'guest' ? 'Tamu' : 'Pengguna JAX');

  useEffect(() => {
    onSyncRef.current = onSyncNotifications;
  }, [onSyncNotifications]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = currentTime.getFullYear();
  const currentMonthName = NAMA_BULAN[currentTime.getMonth()];
  const currentDayName = NAMA_HARI[currentTime.getDay()];
  const currentDateNum = currentTime.getDate();

  const formattedHeaderDate = `${currentDayName}, ${currentDateNum} ${currentMonthName} ${currentYear}`;
  const formattedHeaderClock = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  }).replace('.', ':');

  // Inisialisasi state instan dari localStorage cache (0 detik)
  const [tasksList, setTasksList] = useState(() => {
    try {
      const key = isGoogle ? 'jax_cache_tasks' : 'jax_guest_tasks';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) { return []; }
  });

  const [spendingList, setSpendingList] = useState(() => {
    try {
      const key = isGoogle ? 'jax_cache_spending' : 'jax_guest_spending';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) { return []; }
  });

  const [workiezList, setWorkiezList] = useState(() => {
    try {
      const key = isGoogle ? 'jax_cache_workiez' : 'jax_guest_workiez';
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) { return []; }
  });

  const [monthlyBudget] = useState(() => Number(localStorage.getItem('jax_monthly_budget') || 3500000));
  const [showNotifModal, setShowNotifModal] = useState(false);
  useEffect(() => {
    if (!isGoogle) {
      if (onSyncRef.current) {
        const freshAlerts = runNotificationEngine({
          tasks: tasksList,
          transactions: spendingList,
          workiez: workiezList,
          monthlyBudget
        });
        onSyncRef.current(freshAlerts);
      }
      return;
    }

    const fetchTasksPromise = fetchSheetData('Tasks')
      .then(rows => {
        let cleanRows = rows || [];
        if (cleanRows.length > 0) {
          const rowText = String(cleanRows[0][2] || cleanRows[0][0] || '').toLowerCase();
          if (rowText.includes('judul') || rowText.includes('task') || rowText.includes('id') || rowText.includes('tugas')) {
            cleanRows = cleanRows.slice(1);
          }
        }
        const cleaned = cleanRows.reverse();
        localStorage.setItem('jax_cache_tasks', JSON.stringify(cleaned));
        return cleaned;
      })
      .catch(() => {
        try {
          return JSON.parse(localStorage.getItem('jax_cache_tasks') || '[]');
        } catch (e) {
          return [];
        }
      });

    const fetchSpendingPromise = fetchSheetData('Spending')
      .then(rows => {
        let cleanRows = rows || [];
        if (cleanRows.length > 0) {
          const rowText = String(cleanRows[0][1] || cleanRows[0][0] || '').toLowerCase();
          if (rowText.includes('tanggal') || rowText.includes('date') || rowText.includes('id') || rowText.includes('spending')) {
            cleanRows = cleanRows.slice(1);
          }
        }
        const cleaned = cleanRows.reverse();
        localStorage.setItem('jax_cache_spending', JSON.stringify(cleaned));
        return cleaned;
      })
      .catch(() => {
        try {
          return JSON.parse(localStorage.getItem('jax_cache_spending') || '[]');
        } catch (e) {
          return [];
        }
      });

    const fetchWorkiezPromise = fetchSheetData('Workiez')
      .then(rows => {
        let cleanRows = rows || [];
        if (cleanRows.length > 0) {
          const rowText = String(cleanRows[0][1] || cleanRows[0][0] || cleanRows[0][2] || '').toLowerCase();
          if (
            rowText.includes('tanggal') ||
            rowText.includes('perusahaan') ||
            rowText.includes('posisi') ||
            rowText.includes('id') ||
            rowText.includes('workiez')
          ) {
            cleanRows = cleanRows.slice(1);
          }
        }
        const cleaned = cleanRows.reverse();
        localStorage.setItem('jax_cache_workiez', JSON.stringify(cleaned));
        return cleaned;
      })
      .catch(() => {
        try {
          return JSON.parse(localStorage.getItem('jax_cache_workiez') || '[]');
        } catch (e) {
          return [];
        }
      });

    Promise.all([fetchTasksPromise, fetchSpendingPromise, fetchWorkiezPromise]).then(([tasksData, spendingData, workiezData]) => {
      setTasksList(tasksData);
      setSpendingList(spendingData);
      setWorkiezList(workiezData);

      if (onSyncRef.current) {
        const freshAlerts = runNotificationEngine({
          tasks: tasksData,
          transactions: spendingData,
          workiez: workiezData,
          monthlyBudget
        });
        onSyncRef.current(freshAlerts);
      }
    });
  }, [isGoogle]);

  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDayOfWeek);

    return Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + idx);
      return {
        dayCode: KODE_HARI[d.getDay()],
        dateNum: d.getDate(),
        isToday: d.toDateString() === today.toDateString()
      };
    });
  }, []);

  // --- LOGIKA TASKS: FOKUS HARI INI + 7 HARI KE DEPAN & OVERDUE ---
  const todayTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueAndToday = tasksList.filter(item => {
      if (!item || !item[1]) return false;
      const status = String(item[5] || '').toLowerCase();
      if (status === 'completed') return false;

      const d = new Date(item[1]);
      if (isNaN(d.getTime())) return false;
      d.setHours(0, 0, 0, 0);

      return d <= today;
    });

    if (overdueAndToday.length > 0) return overdueAndToday.slice(0, 3);
    return tasksList.filter(item => String(item[5] || '').toLowerCase() !== 'completed').slice(0, 3);
  }, [tasksList]);

  const priorityTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const max7Days = new Date(today);
    max7Days.setDate(today.getDate() + 7);
    max7Days.setHours(23, 59, 59, 999);

    const highTasks = tasksList.filter(item => {
      const p = String(item[4] || '').toLowerCase();
      const s = String(item[5] || '').toLowerCase();
      if (s === 'completed') return false;

      const isHigh = p.includes('tinggi') || p.includes('urgent');
      if (!isHigh) return false;

      const d = new Date(item[1]);
      if (isNaN(d.getTime())) return true;
      return d <= max7Days;
    });

    if (highTasks.length > 0) return highTasks.slice(0, 3);
    return tasksList.filter(item => String(item[5] || '').toLowerCase() !== 'completed').slice(0, 3);
  }, [tasksList]);

  // --- LOGIKA FINANSIAL: BULAN KALENDER AKTIF ---
  const currentMonthExpense = useMemo(() => {
    const curYear = currentTime.getFullYear();
    const curMonth = currentTime.getMonth();
    return spendingList
      .filter(item => {
        if (!item || !item[1] || item[2] !== 'Expense') return false;
        const d = new Date(item[1]);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      })
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [spendingList, currentTime]);

  const lastMonthExpense = useMemo(() => {
    const dTarget = new Date(currentTime.getFullYear(), currentTime.getMonth() - 1, 1);
    const targetYear = dTarget.getFullYear();
    const targetMonth = dTarget.getMonth();
    return spendingList
      .filter(item => {
        if (!item || !item[1] || item[2] !== 'Expense') return false;
        const d = new Date(item[1]);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
      })
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [spendingList, currentTime]);

  const expenseDiffText = useMemo(() => {
    if (lastMonthExpense === 0) return 'Perhitungan pengeluaran bulan ini';
    const diff = ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    if (diff <= 0) {
      return `↓ ${Math.abs(Math.round(diff))}% lebih hemat dari bulan lalu`;
    }
    return `↑ ${Math.round(diff)}% dari bulan lalu`;
  }, [currentMonthExpense, lastMonthExpense]);

  const budgetRatioPercent = monthlyBudget > 0 ? Math.round((currentMonthExpense / monthlyBudget) * 100) : 0;

  // --- LOGIKA JOB TRACKER: STATUS AKTIF & RINGKASAN PIPELINE ---
  const activeJobs = useMemo(() => {
    return workiezList.filter(j => {
      const status = String(j[5] || '').toLowerCase();
      return status !== 'rejected' && status !== 'accepted';
    });
  }, [workiezList]);

  const jobInterviewCount = useMemo(() => {
    return workiezList.filter(j => String(j[5] || '').toLowerCase() === 'interview').length;
  }, [workiezList]);

  const jobOverdueCount = useMemo(() => {
    return workiezList.filter(j => {
      const st = String(j[5] || '').toLowerCase();
      if (st !== 'applied' && st !== 'screening') return false;
      const d = new Date(j[1]);
      if (isNaN(d.getTime())) return false;
      const diffDays = Math.ceil(Math.abs(new Date() - d) / (1000 * 60 * 60 * 24));
      return diffDays >= 30;
    }).length;
  }, [workiezList]);

  const pendingJobsCount = activeJobs.length;

  const activeNotifications = useMemo(() => {
    return runNotificationEngine({
      tasks: tasksList,
      transactions: spendingList,
      workiez: workiezList,
      monthlyBudget
    });
  }, [tasksList, spendingList, workiezList, monthlyBudget]);

  // --- LOGIKA DAILY PULSE: HARI INI SAJA ---
  const pulseData = useMemo(() => {
    const hour = currentTime.getHours();
    let periodLabel = 'Pagi';

    const countTasks = todayTasks.length;
    const taskAccent = <span style={{ color: '#2E3192', fontWeight: '800' }}>{countTasks}</span>;
    const budgetAccent = <span style={{ color: budgetRatioPercent > 80 ? '#DC2626' : '#059669', fontWeight: '800' }}>{budgetRatioPercent}%</span>;
    const jobAccent = <span style={{ color: '#D97706', fontWeight: '800' }}>{pendingJobsCount}</span>;

    let content = null;
    if (hour >= 5 && hour < 11) {
      periodLabel = 'Pagi';
      content = countTasks === 0 && budgetRatioPercent === 0 && pendingJobsCount === 0 ? (
        <span>Belum terdapat jadwal kegiatan untuk hari ini, alokasi anggaran belum terdistribusi, dan berkas lamaran belum ada yang aktif.</span>
      ) : (
        <span>
          {countTasks === 0 ? 'Belum ada agenda darurat hari ini' : <>Tercatat {taskAccent} agenda fokus hari ini</>}, alokasi anggaran terpakai {budgetAccent}, serta {pendingJobsCount === 0 ? 'berkas lamaran belum ada yang aktif' : <>terdapat {jobAccent} berkas lamaran aktif dipantau</>}.
        </span>
      );
    } else if (hour >= 11 && hour < 15) {
      periodLabel = 'Siang';
      content = (
        <span>
          {countTasks === 0 ? 'Agenda siang ini berjalan lancar' : <>Agenda siang ini mencatat {taskAccent} tugas</>}, penyerapan anggaran berada di {budgetAccent}, serta terdapat {jobAccent} proses lamaran kerja aktif.
        </span>
      );
    } else if (hour >= 15 && hour < 18.5) {
      periodLabel = 'Sore';
      content = (
        <span>
          Rangkuman sore: {countTasks === 0 ? 'semua agenda hari ini tuntas' : <>{taskAccent} agenda masih berjalan</>}, realisasi anggaran mencapai {budgetAccent}, dan {jobAccent} lamaran dalam pipeline seleksi.
        </span>
      );
    } else {
      periodLabel = 'Malam';
      content = (
        <span>
          Rekapitulasi malam: {countTasks === 0 ? 'hari ini produktif dan rapi' : <>{taskAccent} agenda terdata</>}, penyerapan anggaran tercatat {budgetAccent}, serta {jobAccent} status lamaran kerja terpantau.
        </span>
      );
    }

    return { periodLabel, content };
  }, [currentTime, todayTasks.length, budgetRatioPercent, pendingJobsCount]);

  const monthlyBars = useMemo(() => {
    const list = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(currentTime.getFullYear(), currentTime.getMonth() - i, 1);
      const mName = NAMA_BULAN[d.getMonth()].slice(0, 3);
      const totalExp = spendingList
        .filter(item => {
          if (!item || !item[1] || item[2] !== 'Expense') return false;
          const dt = new Date(item[1]);
          if (isNaN(dt.getTime())) return false;
          return dt.getFullYear() === d.getFullYear() && dt.getMonth() === d.getMonth();
        })
        .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
      list.push({ m: mName, total: totalExp });
    }

    const maxExp = Math.max(...list.map(x => x.total), 1);
    return list.map((item, idx) => {
      const heightPx = Math.max(Math.round((item.total / maxExp) * 52), 16);
      let color = '#CBD5E1';
      if (idx === 3) color = '#2E3192';
      else if (idx === 2) color = '#A5B4FC';
      else if (idx === 1) color = '#E2E8F0';
      return { m: item.m, h: `${heightPx}px`, c: color };
    });
  }, [spendingList, currentTime]);

  const weeklyTaskProgress = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeekTasks = tasksList.filter(item => {
      if (!item || !item[1]) return false;
      const d = new Date(item[1]);
      if (isNaN(d.getTime())) return true;
      return d >= startOfWeek && d <= endOfWeek;
    });

    const completed = thisWeekTasks.filter(item => String(item[5] || '').toLowerCase() === 'completed').length;
    const total = thisWeekTasks.length > 0 ? thisWeekTasks.length : tasksList.slice(0, 7).length || 7;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, rate };
  }, [tasksList]);

  const savingsRate = useMemo(() => {
    const curYear = currentTime.getFullYear();
    const curMonth = currentTime.getMonth();
    const monthIncome = spendingList
      .filter(item => {
        if (!item || !item[1] || item[2] !== 'Income') return false;
        const d = new Date(item[1]);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      })
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);

    if (monthIncome === 0) return 65;
    const saved = monthIncome - currentMonthExpense;
    if (saved <= 0) return 0;
    return Math.min(Math.round((saved / monthIncome) * 100), 100);
  }, [spendingList, currentMonthExpense, currentTime]);

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '60px', background: 'transparent', fontFamily: 'Poppins, sans-serif' }}>

      {/* 1. HERO HEADER */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 45%, #4338CA 100%)',
        minHeight: '270px',
        padding: '24px 20px 65px 20px',
        overflow: 'hidden',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        color: '#FFFFFF'
      }}>
        <MemphisDecorations />

        <div style={{ position: 'relative', zIndex: 4, maxWidth: '48%' }}>
          <div style={{
            display: 'inline-block',
            background: '#F59E0B',
            color: '#1E1B4B',
            fontSize: '10px',
            fontWeight: '600',
            padding: '4px 12px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: '10px',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
          }}>
            Personal Assistant
          </div>

          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
            Halo, {currentUserName}!
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.88)', lineHeight: '1.45' }}>
            Kelola pengeluaran, agenda tugas, dan karir dalam satu ruang terpadu.
          </p>
        </div>

        <div style={{
          position: 'absolute',
          right: '0px',
          bottom: '-3px',
          width: '290px',
          height: '250px',
          zIndex: 3,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          pointerEvents: 'none'
        }}>
          <img
            src={jaxImg}
            alt="Jax Assistant"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'bottom right',
              display: 'block',
              filter: 'drop-shadow(0 10px 22px rgba(15, 23, 42, 0.35))'
            }}
          />
        </div>
      </div>

      {/* 2. LEMBAR KONTEN PUTIH */}
      <div style={{
        marginTop: '-35px',
        background: '#FFFFFF',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 18px',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.05)'
      }}>

        {/* --- BANNER PULSE DENGAN SAPAAN DINAMIS --- */}
        <div style={{
          background: '#fbb83a',
          border: '1.5px solid #E2E8F0',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 4px 16px rgba(46, 49, 146, 0.04)'
        }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', background: '#2E3192', color: '#FFFFFF', padding: '3px 9px', borderRadius: '6px', fontWeight: '700', letterSpacing: '0.5px' }}>
                {pulseData.periodLabel.toUpperCase()} PULSE
              </span>
              <span style={{ fontSize: '11px', color: '#3f597d', fontWeight: '500' }}>
                Status Sistem Terkini
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', fontWeight: '500', color: '#1E1B4B', lineHeight: '1.55' }}>
              {pulseData.content}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNotifModal(true)}
            style={{
              background: activeNotifications.length > 0 ? '#2E3192' : '#FFFFFF',
              border: activeNotifications.length > 0 ? '1.5px solid #F59E0B' : '1px solid #CBD5E1',
              padding: '8px 14px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              color: activeNotifications.length > 0 ? '#FFFFFF' : '#475569',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              flexShrink: 0
            }}
          >
            <FiBell size={15} />
            <span>{activeNotifications.length} Reminder</span>
          </button>
        </div>

        <NotificationModal
          isOpen={showNotifModal}
          onClose={() => setShowNotifModal(false)}
          notifications={activeNotifications}
        />

        {/* PENANGGALAN MINGGUAN */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
                Hari Ini
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1E1B4B' }}>
                {formattedHeaderDate}
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '12px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '0.3px' }}>
                {formattedHeaderClock}
              </span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#64748B' }}>WIB</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {weekDays.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  minWidth: '40px',
                  padding: '9px 4px',
                  borderRadius: '14px',
                  textAlign: 'center',
                  background: item.isToday ? 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)' : '#FFFFFF',
                  color: item.isToday ? '#FFFFFF' : '#64748B',
                  boxShadow: item.isToday ? '0 4px 12px rgba(46, 49, 146, 0.28)' : '0 1px 3px rgba(0,0,0,0.02)',
                  border: item.isToday ? '1px solid #2E3192' : '1px solid #E2E8F0',
                  transition: 'transform 0.2s ease'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '600', color: item.isToday ? '#F59E0B' : '#94A3B8' }}>
                  {item.dayCode}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '2px', color: item.isToday ? '#FFFFFF' : '#1E293B' }}>
                  {item.dateNum}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 KARTU AKSES CEPAT MODUL */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Akses Cepat Modul</h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>3 Menu Tersedia</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <Link to="/spending" className="modul-card-interactive" style={modulCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <SpendingTileGraphic />
                <div style={{ flex: 1 }}>
                  <h4 style={moduleTitle}>Spending Hub</h4>
                  <p style={moduleSubtitle}>Catatan uang keluar & mutasi dana harian</p>
                </div>
                <div style={{ ...moduleArrowCircle, background: '#2E3192' }}>
                  <FiArrowRight size={13} color="#F59E0B" />
                </div>
              </div>
            </Link>

            <Link to="/tasks" className="modul-card-interactive" style={modulCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <TasksTileGraphic />
                <div style={{ flex: 1 }}>
                  <h4 style={moduleTitle}>Tasks & Agenda</h4>
                  <p style={moduleSubtitle}>Prioritas pengerjaan & Catatan Agenda Kegiatan</p>
                </div>
                <div style={{ ...moduleArrowCircle, background: '#059669' }}>
                  <FiArrowRight size={13} color="#FFFFFF" />
                </div>
              </div>
            </Link>

            <Link to="/workiez" className="modul-card-interactive" style={modulCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <WorkiezTileGraphic />
                <div style={{ flex: 1 }}>
                  <h4 style={moduleTitle}>Workiez Tracker</h4>
                  <p style={moduleSubtitle}>Monitoring status lamaran kerja & interview</p>
                </div>
                <div style={{ ...moduleArrowCircle, background: '#1E1B4B' }}>
                  <FiArrowRight size={13} color="#F59E0B" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* BARIS 1: AGENDA & TUGAS PRIORITAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          <div style={contentBlockCard}>
            <div style={cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AgendaTileGraphic />
                <h3 style={sectionHeaderTitle}>Agenda Hari Ini</h3>
              </div>
              <Link to="/tasks" style={linkSeeAll}>Lihat semua &rarr;</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {todayTasks.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', padding: '6px 0' }}>
                  Tidak ada agenda untuk hari ini.
                </div>
              ) : (
                todayTasks.map((item, idx) => (
                  <div key={idx} style={agendaItemRow}>
                    <span style={agendaTimeText}>Tugas</span>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E3192', marginTop: '6px', flexShrink: 0 }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={itemPrimaryText}>{item[2] || 'Tanpa Judul'}</div>
                      <div style={itemSecondaryText}>{item[3] || 'Kategori Umum'} {item[6] && item[6] !== '-' ? `• ${item[6]}` : ''}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={contentBlockCard}>
            <div style={cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PriorityTileGraphic />
                <h3 style={sectionHeaderTitle}>Tugas Prioritas (7 Hari)</h3>
              </div>
              <Link to="/tasks" style={linkSeeAll}>Lihat semua &rarr;</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {priorityTasks.length === 0 ? (
                <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', padding: '6px 0' }}>
                  Semua tugas prioritas selesai.
                </div>
              ) : (
                priorityTasks.map((item, idx) => (
                  <div key={idx} style={taskItemRowStyle}>
                    <div style={checkboxCircleStyle}></div>
                    <div style={{ flex: 1 }}>
                      <div style={itemPrimaryText}>{item[2] || 'Tanpa Judul'}</div>
                      <div style={itemSecondaryText}>Tenggat: {item[1] ? String(item[1]).slice(0, 10) : 'Segera'}</div>
                    </div>
                    <span style={{ color: '#E11D48', fontSize: '13px' }}>🚩</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BARIS 2: JOB TRACKER */}
        <div style={contentBlockCard}>
          <div style={cardHeaderRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <JobTrackerTileGraphic />
              <div>
                <h3 style={sectionHeaderTitle}>Job Tracker</h3>
                <span style={{ fontSize: '10px', color: '#64748B' }}>Monitoring aplikasi & tahapan interview</span>
              </div>
            </div>
            <Link to="/workiez" style={linkSeeAll}>Kelola Lamaran &rarr;</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase' }}>Lamaran Berjalan</span>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E1B4B', marginTop: '2px' }}>
                  {pendingJobsCount} <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Aplikasi</span>
                </div>
              </div>
              <div style={{ background: 'rgba(46, 49, 146, 0.08)', color: '#2E3192', padding: '8px', borderRadius: '10px' }}>
                <FiBriefcase size={16} />
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#7C3AED', fontWeight: '600', textTransform: 'uppercase' }}>Tahap Interview</span>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#7C3AED', marginTop: '2px' }}>
                  {jobInterviewCount} <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>Sesi</span>
                </div>
              </div>
              <div style={{ background: '#F3E8FF', color: '#7C3AED', padding: '8px', borderRadius: '10px' }}>
                <span style={{ fontSize: '13px' }}>🎯</span>
              </div>
            </div>

            {jobOverdueCount > 0 && (
              <div style={{ background: '#FFFBEB', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#D97706', fontWeight: '600', textTransform: 'uppercase' }}>Perlu Follow-up</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#D97706', marginTop: '2px' }}>
                    {jobOverdueCount} <span style={{ fontSize: '11px', color: '#B45309', fontWeight: '500' }}>&ge; 30 Hari</span>
                  </div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#D97706', padding: '8px', borderRadius: '10px' }}>
                  <FiAlertCircle size={16} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BARIS 3: RINGKASAN FINANSIAL & PROGRES MINGGUAN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          <div style={contentBlockCard}>
            <div style={cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FinanceTileGraphic />
                <h3 style={sectionHeaderTitle}>Ringkasan Finansial</h3>
              </div>
              <Link to="/spending" style={linkSeeAll}>Detail &rarr;</Link>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Pengeluaran Periode Ini</span>
                <div style={{ fontSize: '20px', fontWeight: '600', color: '#1E293B', marginTop: '2px', letterSpacing: '-0.3px' }}>
                  Rp {currentMonthExpense.toLocaleString('id-ID')}
                </div>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>
                  {expenseDiffText}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '56px' }}>
                {monthlyBars.map((bar, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '10px', height: bar.h, background: bar.c, borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '600' }}>{bar.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={contentBlockCard}>
            <div style={cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ProgressTileGraphic />
                <h3 style={sectionHeaderTitle}>Progres Mingguan</h3>
              </div>
              <Link to="/tasks" style={linkSeeAll}>Detail &rarr;</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>Tugas Selesai</span>
                  <span style={{ color: '#1E293B' }}>{weeklyTaskProgress.completed} dari {weeklyTaskProgress.total}</span>
                </div>
                <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${weeklyTaskProgress.rate}%`, height: '100%', background: '#2E3192', borderRadius: '10px' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', marginBottom: '4px' }}>
                  <span style={{ color: '#475569' }}>Capaian Target Tabungan</span>
                  <span style={{ color: '#1E293B' }}>{savingsRate}%</span>
                </div>
                <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${savingsRate}%`, height: '100%', background: '#F59E0B', borderRadius: '10px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const modulCardStyle = {
  textDecoration: 'none',
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: '16px',
  padding: '14px 16px',
  display: 'block',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)'
};

const moduleTitle = {
  margin: '0 0 2px 0',
  fontSize: '13px',
  fontWeight: '600',
  color: '#1E1B4B'
};

const moduleSubtitle = {
  margin: 0,
  fontSize: '11px',
  color: '#64748B',
  lineHeight: '1.3'
};

const moduleArrowCircle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const contentBlockCard = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '18px',
  padding: '16px 18px'
};

const cardHeaderRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '14px'
};

const sectionHeaderTitle = {
  margin: 0,
  fontSize: '13px',
  fontWeight: '600',
  color: '#1E1B4B'
};

const linkSeeAll = {
  textDecoration: 'none',
  fontSize: '11px',
  color: '#2E3192',
  fontWeight: '600'
};

const agendaItemRow = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px'
};

const agendaTimeText = {
  fontSize: '11px',
  fontWeight: '600',
  color: '#64748B',
  width: '36px',
  flexShrink: 0
};

const itemPrimaryText = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#1E1B4B',
  lineHeight: '1.3'
};

const itemSecondaryText = {
  fontSize: '10px',
  color: '#64748B',
  marginTop: '2px'
};

const taskItemRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '8px 10px',
  borderRadius: '10px',
  background: '#FFFFFF',
  border: '1px solid #E2E8F0'
};

const checkboxCircleStyle = {
  width: '15px',
  height: '15px',
  borderRadius: '50%',
  border: '1.5px solid #CBD5E1',
  flexShrink: 0
};