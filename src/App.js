import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiMenu, 
  FiHome, 
  FiDollarSign, 
  FiCheckSquare, 
  FiBriefcase, 
  FiBell, 
  FiBarChart2, 
  FiPieChart, 
  FiTrendingUp 
} from 'react-icons/fi';

// Import Komponen Navigasi & Halaman Utama
import Sidebar from './pages/Sidebar';
import SpendingHome from './pages/SpendingHome';
import TasksHome from './pages/TasksHome';
import WorkiezHome from './pages/WorkiezHome';

export const API_URL = 'https://script.google.com/macros/s/AKfycbxmBNZzRsi1uk7plivv_4ul2hiUn9w1uWAWcaElwWZGAcruUBfMTrYLorHK6bPcUJU/exec';

// --- KOMPONEN HALAMAN DASBOR UTAMA ---
function Dashboard() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '30px' }}>
      
      {/* Banner Notifikasi Sistem */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.85)', 
        backdropFilter: 'blur(16px)', 
        WebkitBackdropFilter: 'blur(16px)',
        padding: '16px 18px', 
        borderRadius: '20px', 
        marginBottom: '22px', 
        border: '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 12px 30px rgba(37, 99, 235, 0.06)',
        display: 'flex', 
        alignItems: 'flex-start', 
        gap: '14px'
      }}>
        <div style={{ 
          background: '#2563EB', 
          color: '#FFFFFF', 
          padding: '8px', 
          borderRadius: '12px', 
          display: 'flex', 
          marginTop: '2px', 
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
          flexShrink: 0
        }}>
          <FiBell size={18} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '700', color: '#1E3A8A' }}>
            Notifikasi Sistem JAX
          </h4>
          <p style={{ margin: 0, fontSize: '12px', color: '#3B82F6', fontWeight: '500', lineHeight: '1.45' }}>
            Pantau ringkasan arus kas keuangan, target tugas akademik, serta kemajuan lamaran kerja Anda secara terpusat.
          </p>
        </div>
      </div>

      {/* Ringkasan Analitik */}
      <h3 style={{ 
        color: '#0F172A', 
        fontSize: '15px', 
        fontWeight: '700', 
        marginBottom: '14px', 
        letterSpacing: '-0.3px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <FiBarChart2 color="#2563EB" size={17} /> 
        <span>Ringkasan Modul JAX</span>
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={chartCardStyle}>
          <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '10px', borderRadius: '12px', color: '#2563EB', marginBottom: '10px', display: 'flex' }}>
            <FiPieChart size={20} />
          </div>
          <span style={cardSubLabelStyle}>Spending</span>
          <strong style={cardValueLabelStyle}>Tersinkron</strong>
        </div>

        <div style={chartCardStyle}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '12px', color: '#10B981', marginBottom: '10px', display: 'flex' }}>
            <FiCheckSquare size={20} />
          </div>
          <span style={cardSubLabelStyle}>Tasks</span>
          <strong style={cardValueLabelStyle}>Agenda Aktif</strong>
        </div>

        <div style={chartCardStyle}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px', color: '#F59E0B', marginBottom: '10px', display: 'flex' }}>
            <FiBriefcase size={20} />
          </div>
          <span style={cardSubLabelStyle}>Job Tracker</span>
          <strong style={cardValueLabelStyle}>Terpantau</strong>
        </div>
      </div>

      {/* Menu Pintasan Cepat (Quick Access) */}
      <h3 style={{ 
        color: '#0F172A', 
        fontSize: '15px', 
        fontWeight: '700', 
        marginBottom: '14px', 
        letterSpacing: '-0.3px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <FiTrendingUp color="#2563EB" size={17} /> 
        <span>Akses Cepat Modul</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link to="/spending" style={quickLinkStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <FiDollarSign size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Spending Hub</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Rekap pemasukan, pengeluaran & grafik bulanan</div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>Buka &rarr;</span>
        </Link>

        <Link to="/tasks" style={quickLinkStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#ECFDF5', color: '#059669', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <FiCheckSquare size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Tasks & Agenda</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Manajemen prioritas & deadline akademik</div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Buka &rarr;</span>
        </Link>

        <Link to="/workiez" style={quickLinkStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#FFFBEB', color: '#D97706', padding: '10px', borderRadius: '12px', display: 'flex' }}>
              <FiBriefcase size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Job Tracker (Workiez)</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Monitoring status lamaran kerja & notifikasi follow-up</div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: '#D97706', fontWeight: '600' }}>Buka &rarr;</span>
        </Link>
      </div>

    </div>
  );
}

function History() { 
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: '#0F172A' }}>
      <h3 style={{ fontWeight: '700', fontSize: '18px', margin: '0 0 6px 0' }}>Riwayat Aktivitas</h3>
      <p style={{ color: '#64748B', fontSize: '13px' }}>Log rekam jejak sinkronisasi cloud sistem JAX akan ditampilkan di sini.</p>
    </div>
  ); 
}

function Settings() { 
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: '#0F172A' }}>
      <h3 style={{ fontWeight: '700', fontSize: '18px', margin: '0 0 6px 0' }}>Pengaturan Sistem</h3>
      <p style={{ color: '#64748B', fontSize: '13px' }}>Konfigurasi parameter akun, Google Apps Script Endpoint, dan asisten suara.</p>
    </div>
  ); 
}

// --- BOTTOM NAVIGATION BAR (THUMB-FRIENDLY) ---
function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navItem = (path, IconComponent, label) => {
    const isActive = currentPath === path.toLowerCase();
    return (
      <Link to={path} style={{ 
        textDecoration: 'none', 
        color: isActive ? '#FFFFFF' : '#64748B', 
        background: isActive ? '#0F172A' : 'transparent',
        padding: '8px 14px', 
        borderRadius: '16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        transition: 'all 0.25s ease',
        boxShadow: isActive ? '0 6px 16px rgba(15, 23, 42, 0.2)' : 'none',
        flexShrink: 0
      }}>
        <IconComponent size={16} />
        <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '500' }}>{label}</span>
      </Link>
    );
  };

  return (
    <div style={{
      position: 'fixed', 
      bottom: '16px', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      width: '92%', 
      maxWidth: '420px', 
      background: 'rgba(255, 255, 255, 0.88)', 
      backdropFilter: 'blur(16px)', 
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex', 
      justifyContent: 'space-between', 
      padding: '8px 10px', 
      borderRadius: '24px', 
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.9)', 
      zIndex: 900
    }}>
      {navItem('/spending', FiDollarSign, 'Spending')}
      {navItem('/', FiHome, 'Home')}
      {navItem('/tasks', FiCheckSquare, 'Tasks')}
      {navItem('/workiez', FiBriefcase, 'Workiez')}
    </div>
  );
}

// --- STYLING BANTUAN ---
const chartCardStyle = {
  background: 'rgba(255, 255, 255, 0.85)', 
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  padding: '16px', 
  borderRadius: '18px',
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'flex-start',
  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.04)', 
  border: '1px solid rgba(255, 255, 255, 0.95)', 
  boxSizing: 'border-box'
};

const cardSubLabelStyle = {
  fontSize: '11px', 
  color: '#64748B', 
  fontWeight: '600', 
  textTransform: 'uppercase', 
  letterSpacing: '0.4px'
};

const cardValueLabelStyle = {
  fontSize: '14px', 
  color: '#0F172A', 
  marginTop: '4px', 
  fontWeight: '700'
};

const quickLinkStyle = {
  textDecoration: 'none',
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  padding: '12px 16px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  transition: 'all 0.2s ease'
};

// --- KOMPONEN UTAMA ROOT ---
export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <style>{`
        /* Reset dan Penyesuaian Global */
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes floatGlow {
          0% { transform: translateY(0px) scale(1); opacity: 0.55; }
          50% { transform: translateY(-20px) scale(1.05); opacity: 0.8; }
          100% { transform: translateY(0px) scale(1); opacity: 0.55; }
        }

        .animated-bg {
          background: linear-gradient(135deg, #E0F2FE, #EFF6FF, #F8FAFC, #DBEAFE);
          background-size: 300% 300%;
          animation: gradientMove 15s ease infinite;
          position: relative;
          min-height: 100vh;
        }

        .animated-bg::before {
          content: "";
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background-image: radial-gradient(rgba(37, 99, 235, 0.07) 1px, transparent 1px);
          background-size: 24px 24px;
          pointer-events: none;
          z-index: 0;
        }

        .glow-orb-1 {
          position: fixed; top: -100px; left: -100px; width: 380px; height: 380px;
          background: radial-gradient(circle, rgba(96,165,250,0.4) 0%, rgba(59,130,246,0) 70%);
          border-radius: 50%; animation: floatGlow 9s ease-in-out infinite; z-index: 0; pointer-events: none;
        }

        .glow-orb-2 {
          position: fixed; bottom: -100px; right: -100px; width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(147,197,253,0.35) 0%, rgba(37,99,235,0) 70%);
          border-radius: 50%; animation: floatGlow 12s ease-in-out infinite reverse; z-index: 0; pointer-events: none;
        }

        /* --- STYLING RESPONSIF MOBILE (< 640px) --- */
        @media (max-width: 640px) {
          main {
            padding: 14px 12px 100px 12px !important;
          }

          /* Tampilan Tabel Desktop disembunyikan di HP */
          .desktop-table-view {
            display: none !important;
          }

          /* Tampilan Kartu diaktifkan di HP */
          .mobile-cards-view {
            display: flex !important;
            flex-direction: column;
            gap: 12px;
          }

          /* Form responsif 1-kolom di HP */
          .responsive-form-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }

          .mobile-stack {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .mobile-full-width {
            width: 100% !important;
          }
        }

        /* --- STYLING DESKTOP / TABLET (>= 641px) --- */
        @media (min-width: 641px) {
          main {
            padding: 24px 20px 110px 20px !important;
          }

          .mobile-cards-view {
            display: none !important;
          }

          .desktop-table-view {
            display: block !important;
          }
        }
      `}</style>

      <div className="animated-bg" style={{ paddingTop: '80px', fontFamily: 'Poppins, sans-serif', overflowX: 'hidden' }}>
        
        <div className="glow-orb-1"></div>
        <div className="glow-orb-2"></div>

        {/* Header / Navbar Glassmorphism Terkunci (Fixed) */}
        <header style={{ 
          background: 'rgba(255, 255, 255, 0.85)', 
          backdropFilter: 'blur(16px)', 
          WebkitBackdropFilter: 'blur(16px)',
          padding: '10px 20px', 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          boxSizing: 'border-box',
          zIndex: 100, 
          borderBottom: '1px solid rgba(255, 255, 255, 0.95)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={toggleSidebar} 
              style={{ 
                background: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #E2E8F0', 
                cursor: 'pointer', 
                padding: '8px', 
                display: 'flex', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                color: '#1E3A8A'
              }}
            >
              <FiMenu size={18} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src="/image/logo_myjax.png" 
                alt="Logo" 
                style={{ 
                  width: '34px', 
                  height: '34px', 
                  objectFit: 'contain', 
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  padding: '2px',
                  border: '1px solid #E2E8F0',
                  flexShrink: 0
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E3A8A', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                  MY JAX
                </h2>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748B', fontWeight: '500', lineHeight: '1.2' }}>
                  Executive Workspace
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Komponen Sidebar Mandiri */}
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Konten Halaman Router */}
        <main style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/spending" element={<SpendingHome />} />
            <Route path="/tasks" element={<TasksHome />} />
            <Route path="/workiez" element={<WorkiezHome />} />
          </Routes>
        </main>
        
        {/* Navigasi Bawah */}
        <BottomNav />
      </div>
    </Router>
  );
}