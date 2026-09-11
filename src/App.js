import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiHome, 
  FiBriefcase, 
  FiBell, 
  FiArrowRight, 
  FiPlus, 
  FiUser, 
  FiCalendar
} from 'react-icons/fi';
import jaxImg from './assets/jaxdashbaor.png';

import Sidebar from './pages/Sidebar';
import SpendingHome from './pages/SpendingHome';
import TasksHome from './pages/TasksHome';
import WorkiezHome from './pages/WorkiezHome';
import Profile from './pages/Profile';

export const API_URL = 'https://script.google.com/macros/s/AKfycbxmBNZzRsi1uk7plivv_4ul2hiUn9w1uWAWcaElwWZGAcruUBfMTrYLorHK6bPcUJU/exec';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const KODE_HARI = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];

// --- DEKORASI ORNAMEN VEKTOR MEMPHIS GEOMETRIS ---
const MemphisDecorations = () => (
  <>
    <svg style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.85, pointerEvents: 'none', zIndex: 1 }} width="75" height="24" viewBox="0 0 80 20" fill="none">
      <path d="M2 10 Q 12 0, 22 10 T 42 10 T 62 10 T 78 10" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>

    <div style={{
      position: 'absolute',
      top: '-25px',
      right: '110px',
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      border: '3px solid #F59E0B',
      opacity: 0.35,
      pointerEvents: 'none',
      zIndex: 1
    }} />

    <div style={{
      position: 'absolute',
      top: '45px',
      right: '30px',
      width: '42px',
      height: '42px',
      borderRadius: '50%',
      background: 'rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(4px)',
      pointerEvents: 'none',
      zIndex: 1
    }} />

    <div style={{
      position: 'absolute',
      top: '75px',
      left: '-35px',
      width: '85px',
      height: '85px',
      borderRadius: '50%',
      border: '3px solid #F59E0B',
      opacity: 0.55,
      pointerEvents: 'none',
      zIndex: 1
    }} />

    <div style={{
      position: 'absolute',
      top: '80px',
      left: '38%',
      color: '#F59E0B',
      fontSize: '18px',
      fontWeight: '900',
      opacity: 0.7,
      userSelect: 'none',
      pointerEvents: 'none',
      zIndex: 1
    }}>
      ✕
    </div>

    <svg style={{ position: 'absolute', top: '105px', left: '16px', opacity: 0.35, pointerEvents: 'none', zIndex: 1 }} width="44" height="44">
      <pattern id="dot-pattern-hero" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
      </pattern>
      <rect width="44" height="44" fill="url(#dot-pattern-hero)" />
    </svg>
  </>
);

// --- TILE GRAFIS MODUL UTAMA ---
const SpendingTileGraphic = () => (
  <div style={{
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: 'linear-gradient(145deg, #3B3DBF 0%, #24248A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(36, 36, 138, 0.28)',
    flexShrink: 0
  }}>
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
  <div style={{
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: 'linear-gradient(145deg, #059669 0%, #046A4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.28)',
    flexShrink: 0
  }}>
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
  <div style={{
    width: '46px',
    height: '46px',
    borderRadius: '14px',
    background: 'linear-gradient(145deg, #1E1B4B 0%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.28)',
    flexShrink: 0
  }}>
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

// --- MINI TILE GRAFIS KHUSUS ---
const AgendaTileGraphic = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3B3DBF 0%, #24248A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(36, 36, 138, 0.25)',
    flexShrink: 0
  }}>
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
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)',
    flexShrink: 0
  }}>
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <path d="M10 5.5L11.3 8.2L14.3 8.6L12.1 10.7L12.6 13.7L10 12.3L7.4 13.7L7.9 10.7L5.7 8.6L8.7 8.2L10 5.5Z" fill="#F59E0B" />
    </svg>
  </div>
);

const FinanceTileGraphic = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #24248A 0%, #1E1B4B 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(30, 27, 75, 0.25)',
    flexShrink: 0
  }}>
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" fill="#FFFFFF" />
      <path d="M2.5 8H17.5" stroke="#24248A" strokeWidth="1.5" />
      <circle cx="14" cy="12" r="1.5" fill="#F59E0B" />
      <rect x="5" y="11" width="5" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const ProgressTileGraphic = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
    flexShrink: 0
  }}>
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" fill="#FFFFFF" />
      <rect x="5.5" y="10.5" width="2" height="4" rx="0.8" fill="#CBD5E1" />
      <rect x="9" y="8" width="2" height="6.5" rx="0.8" fill="#059669" />
      <rect x="12.5" y="5.5" width="2" height="9" rx="0.8" fill="#F59E0B" />
    </svg>
  </div>
);

// --- KOMPONEN UTAMA DASHBOARD ---
function Dashboard() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthName = NAMA_BULAN[now.getMonth()];
  const currentDayName = NAMA_HARI[now.getDay()];
  const currentDateNum = now.getDate();

  const formattedHeaderDate = `${currentDayName}, ${currentDateNum} ${currentMonthName} ${currentYear}`;

  // State Data Database Real-time
  const [tasksList, setTasksList] = useState([]);
  const [spendingList, setSpendingList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Ambil data Tasks & Spending dari API Google Apps Script
  useEffect(() => {
    setLoadingData(true);
    const fetchTasksPromise = fetch(`${API_URL}?sheetName=Tasks`)
      .then(res => res.json())
      .then(resData => {
        let rows = [];
        if (Array.isArray(resData)) rows = resData;
        else if (resData && Array.isArray(resData.data)) rows = resData.data;
        else if (resData && Array.isArray(resData.values)) rows = resData.values;

        if (rows.length > 0) {
          const rowText = String(rows[0][2] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('judul') || rowText.includes('task') || rowText.includes('id') || rowText.includes('tugas')) {
            rows = rows.slice(1);
          }
        }
        return rows.reverse();
      })
      .catch(() => []);

    const fetchSpendingPromise = fetch(`${API_URL}?sheetName=Spending`)
      .then(res => res.json())
      .then(resData => {
        let rows = [];
        if (Array.isArray(resData)) rows = resData;
        else if (resData && Array.isArray(resData.data)) rows = resData.data;
        else if (resData && Array.isArray(resData.values)) rows = resData.values;

        if (rows.length > 0) {
          const rowText = String(rows[0][1] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('tanggal') || rowText.includes('date') || rowText.includes('id') || rowText.includes('spending')) {
            rows = rows.slice(1);
          }
        }
        return rows.reverse();
      })
      .catch(() => []);

    Promise.all([fetchTasksPromise, fetchSpendingPromise]).then(([tasksData, spendingData]) => {
      setTasksList(tasksData);
      setSpendingList(spendingData);
      setLoadingData(false);
    });
  }, []);

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

  // 1. Data Agenda Hari Ini & Tugas Prioritas
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const matchToday = tasksList.filter(item => {
      if (!item || !item[1]) return false;
      const d = new Date(item[1]);
      if (isNaN(d.getTime())) return false;
      return d.toISOString().split('T')[0] === todayStr;
    });

    if (matchToday.length > 0) return matchToday.slice(0, 3);
    return tasksList.filter(item => String(item[5] || '').toLowerCase() !== 'completed').slice(0, 3);
  }, [tasksList]);

  const priorityTasks = useMemo(() => {
    const highTasks = tasksList.filter(item => {
      const p = String(item[4] || '').toLowerCase();
      const s = String(item[5] || '').toLowerCase();
      return (p.includes('tinggi') || p.includes('urgent')) && s !== 'completed';
    });

    if (highTasks.length > 0) return highTasks.slice(0, 3);
    return tasksList.filter(item => String(item[5] || '').toLowerCase() !== 'completed').slice(0, 3);
  }, [tasksList]);

  // 2. Data Finansial Bulan Berjalan & Perbandingan 4 Bulan
  const currentMonthExpense = useMemo(() => {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return spendingList
      .filter(item => {
        if (!item || !item[1] || item[2] !== 'Expense') return false;
        const d = new Date(item[1]);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === curYear && d.getMonth() === curMonth;
      })
      .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);
  }, [spendingList]);

  const lastMonthExpense = useMemo(() => {
    const dTarget = new Date(now.getFullYear(), now.getMonth() - 1, 1);
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
  }, [spendingList]);

  const expenseDiffText = useMemo(() => {
    if (lastMonthExpense === 0) return 'Perhitungan pengeluaran bulan ini';
    const diff = ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
    if (diff <= 0) {
      return `↓ ${Math.abs(Math.round(diff))}% lebih hemat dari bulan lalu`;
    }
    return `↑ ${Math.round(diff)}% dari bulan lalu`;
  }, [currentMonthExpense, lastMonthExpense]);

  // Diagram 4 Bulan Terakhir
  const monthlyBars = useMemo(() => {
    const list = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
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
  }, [spendingList]);

  // 3. Data Progres Mingguan (Tasks Minggu Ini & Tabungan)
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
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
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
  }, [spendingList, currentMonthExpense]);

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '55px', background: 'transparent' }}>
      
      {/* 1. HERO HEADER GRAFIS */}
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

        {/* Teks Sapaan */}
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

          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.4px', lineHeight: '1.2' }}>
            Halo, Eze!
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: 'rgba(255, 255, 255, 0.88)', lineHeight: '1.45' }}>
            Kelola pengeluaran, agenda tugas, dan karir dalam satu ruang terpadu.
          </p>
        </div>

        {/* Gambar Jax Dashboard */}
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
        padding: '24px 18px ',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.05)'
      }}>
        
        {/* Header Kalender Real-time */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px' }}>📅</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E1B4B', textTransform: 'capitalize' }}>
              {formattedHeaderDate}
            </span>
          </div>

          {/* Strip Pemilih Hari Real-time */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {weekDays.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  flex: 1,
                  minWidth: '38px',
                  padding: '8px 4px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  background: item.isToday ? 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)' : '#F8FAFC',
                  color: item.isToday ? '#F59E0B' : '#64748B',
                  boxShadow: item.isToday ? '0 4px 12px rgba(46, 49, 146, 0.35)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: item.isToday ? '1.5px solid #F59E0B' : '1px solid #E2E8F0'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}>{item.dayCode}</div>
                <div style={{ fontSize: '13px', fontWeight: '600', marginTop: '2px', color: item.isToday ? '#FFFFFF' : '#1E293B' }}>
                  {item.dateNum}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 KARTU MODUL UTAMA */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E293B' }}>Akses Cepat Modul</h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>3 Ruang Kerja</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            
            {/* Modul 1: Spending Hub */}
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

            {/* Modul 2: Tasks & Agenda */}
            <Link to="/tasks" className="modul-card-interactive" style={modulCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <TasksTileGraphic />
                <div style={{ flex: 1 }}>
                  <h4 style={moduleTitle}>Tasks & Agenda</h4>
                  <p style={moduleSubtitle}>Prioritas pengerjaan & tenggat waktu</p>
                </div>
                <div style={{ ...moduleArrowCircle, background: '#059669' }}>
                  <FiArrowRight size={13} color="#FFFFFF" />
                </div>
              </div>
            </Link>

            {/* Modul 3: Workiez Tracker */}
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

        {/* AGENDA HARI INI & TUGAS PRIORITAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          
          {/* Card 1: Agenda */}
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

          {/* Card 2: Tugas Prioritas */}
          <div style={contentBlockCard}>
            <div style={cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PriorityTileGraphic />
                <h3 style={sectionHeaderTitle}>Tugas Prioritas</h3>
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

        {/* RINGKASAN KEUANGAN & PROGRES CAPAIAN */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          
          {/* Ringkasan Finansial */}
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

          {/* Progres Produktivitas */}
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

function History() { 
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: '#1E293B', padding: '24px 16px' }}>
      <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 6px 0', color: '#1E1B4B' }}>Riwayat Aktivitas</h3>
      <p style={{ color: '#64748B', fontSize: '13px' }}>Catatan log pembaruan data dan transaksi.</p>
    </div>
  ); 
}

// --- NAVIGASI BAWAH SELULER (CLEAN WHITE) ---
function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navItem = (path, IconComponent, label) => {
    const isActive = currentPath === path.toLowerCase();
    return (
      <Link to={path} style={{ 
        textDecoration: 'none', 
        color: isActive ? '#2E3192' : '#94A3B8', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '3px',
        flex: 1
      }}>
        <IconComponent size={18} color={isActive ? '#2E3192' : '#94A3B8'} />
        <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500' }}>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      width: '100%', 
      background: 'rgba(255, 255, 255, 0.95)', 
      backdropFilter: 'blur(16px)', 
      WebkitBackdropFilter: 'blur(16px)', 
      display: 'flex', 
      justifyContent: 'space-around', 
      alignItems: 'center', 
      padding: '8px 12px 14px 12px', 
      borderTop: '1px solid #E2E8F0', 
      boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.04)',
      zIndex: 900
    }}>
      {navItem('/', FiHome, 'Home')}
      {navItem('/tasks', FiCalendar, 'Tasks')}
      
      {/* Tombol Tambah Cepat Tengah */}
      <Link to="/spending" style={{
        background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)',
        color: '#FFFFFF',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        boxShadow: '0 4px 14px rgba(46, 49, 146, 0.35)',
        marginTop: '-16px',
        flexShrink: 0
      }}>
        <FiPlus size={22} color="#F59E0B" />
      </Link>

      {navItem('/workiez', FiBriefcase, 'Workiez')}
      {navItem('/profile', FiUser, 'Profile')}
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingTop: '58px' }}>        
        
        {/* HEADER TETAP (CLEAN WHITE) */}
        <header style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(16px)', 
          WebkitBackdropFilter: 'blur(16px)',
          padding: '10px 18px', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          zIndex: 100, 
          borderBottom: '1px solid #E2E8F0', 
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={toggleSidebar} 
              style={{ 
                background: '#F8FAFC', 
                border: '1px solid #E2E8F0', 
                cursor: 'pointer', 
                padding: '6px', 
                display: 'flex', 
                borderRadius: '8px', 
                color: '#1E1B4B' 
              }}
            >
              <FiMenu size={17} />
            </button>
            
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#1E1B4B', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                MY JAX
              </h2>
              <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
                Personal Assistant
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: '#F8FAFC', 
              border: '1px solid #E2E8F0',
              borderRadius: '50%', 
              padding: '7px', 
              color: '#475569', 
              display: 'flex', 
              cursor: 'pointer' 
            }}>
              <FiBell size={14} />
            </div>

            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)',
                color: '#F59E0B',
                fontSize: '11px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(46, 49, 146, 0.25)'
              }}>
                E
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>Eze</span>
            </Link>
          </div>
        </header>

        {/* Sidebar Navigasi */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Konten Halaman */}
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Profile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/spending" element={<SpendingHome />} />
            <Route path="/tasks" element={<TasksHome />} />
            <Route path="/workiez" element={<WorkiezHome />} />
          </Routes>
        </main>
        
        <BottomNav />
      </div>
    </Router>
  );
}

// --- GAYA TAMPILAN ELEGAN & SPASI PRESISI ---
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
  color: '#1E293B'
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
  color: '#1E293B'
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
  color: '#1E293B',
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