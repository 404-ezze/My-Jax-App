import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiMenu, FiBell } from 'react-icons/fi';
import { GoogleOAuthProvider } from '@react-oauth/google';

import Sidebar from './pages/Sidebar';
import SpendingHome from './pages/Spending/SpendingHome';
import TasksHome from './pages/Tasks/TasksHome';
import WorkiezHome from './pages/Workiez/WorkiezHome';
import Profile from './pages/Profile';
import Home from './pages/Dashboard/Dashboard';
import Auth from './pages/Auth/Register';
import Navbar from './components/Layout/BottomNav';

import NotificationModal from './utils/NotificationModal';
import { runNotificationEngine } from './utils/NotificationEngine';

function History() {
  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', color: '#1E293B', padding: '24px 16px' }}>
      <h3 style={{ fontWeight: '600', fontSize: '18px', margin: '0 0 6px 0', color: '#1E1B4B' }}>Riwayat Aktivitas</h3>
      <p style={{ color: '#64748B', fontSize: '13px' }}>Catatan log pembaruan data dan transaksi.</p>
    </div>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const [authMode, setAuthMode] = useState(() => localStorage.getItem('jax_auth_mode'));
  const currentUserName = localStorage.getItem('jax_user_name') || (authMode === 'guest' ? 'Tamu' : 'Pengguna');
  const currentUserAvatar = localStorage.getItem('jax_user_avatar');

  const [showGlobalNotif, setShowGlobalNotif] = useState(false);
  const [globalNotifs, setGlobalNotifs] = useState([]);

  const handleSyncNotifications = useCallback((alerts) => {
    if (Array.isArray(alerts)) {
      setGlobalNotifs(alerts);
    }
  }, []);

  useEffect(() => {
    try {
      const isGuest = authMode === 'guest';
      const cachedTasks = JSON.parse(localStorage.getItem(isGuest ? 'jax_guest_tasks' : 'jax_cache_tasks') || '[]');
      const cachedSpending = JSON.parse(localStorage.getItem(isGuest ? 'jax_guest_spending' : 'jax_cache_spending') || '[]');
      const cachedWorkiez = JSON.parse(localStorage.getItem(isGuest ? 'jax_guest_workiez' : 'jax_cache_workiez') || '[]');
      const monthlyBudget = Number(localStorage.getItem('jax_monthly_budget') || 3500000);

      const alerts = runNotificationEngine({
        tasks: Array.isArray(cachedTasks) ? cachedTasks : [],
        transactions: Array.isArray(cachedSpending) ? cachedSpending : [],
        workiez: Array.isArray(cachedWorkiez) ? cachedWorkiez : [],
        monthlyBudget
      });

      if (Array.isArray(alerts)) {
        setGlobalNotifs(alerts);

        if (alerts.some(a => a && a.type === 'danger')) {
          const todayStr = new Date().toISOString().split('T')[0];
          const sessionKey = `jax_autopopup_${todayStr}`;
          if (!sessionStorage.getItem(sessionKey)) {
            setShowGlobalNotif(true);
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      }
    } catch (e) {
      console.warn('Gagal evaluasi cache notifikasi:', e);
    }
  }, [authMode]);

  // Pembersihan Sesi dan Cache Total Saat Logout
  const handleLogout = () => {
    // 1. Kredensial dan sesi akun
    localStorage.removeItem('jax_auth_mode');
    localStorage.removeItem('jax_user_name');
    localStorage.removeItem('jax_user_email');
    localStorage.removeItem('jax_user_avatar');
    localStorage.removeItem('jax_google_token');
    localStorage.removeItem('jax_user_sheet_id');
    localStorage.removeItem('myjax_user_profile');

    // 2. Cache data pengguna Google
    localStorage.removeItem('jax_cache_tasks');
    localStorage.removeItem('jax_cache_spending');
    localStorage.removeItem('jax_cache_workiez');

    // 3. Cache data mode tamu
    localStorage.removeItem('jax_guest_tasks');
    localStorage.removeItem('jax_guest_spending');
    localStorage.removeItem('jax_guest_workiez');

    sessionStorage.clear();
    setIsSidebarOpen(false);
    setAuthMode(null);
  };

  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '475897066133-dc2ptqhs131h7de44pcf9u3059jj5h5g.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {!authMode ? (
        <Auth onAuthSuccess={(mode) => setAuthMode(mode)} />
      ) : (
        <Router>
          <div style={{ minHeight: '100vh', background: '#F8FAFC', paddingTop: '58px' }}>

            {/* HEADER */}
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
                <div
                  onClick={() => setShowGlobalNotif(true)}
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '50%',
                    padding: '7px',
                    color: globalNotifs.length > 0 ? '#2E3192' : '#475569',
                    display: 'flex',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  title="Notifikasi"
                >
                  <FiBell size={14} />
                  {globalNotifs.length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '8px',
                      height: '8px',
                      background: '#DC2626',
                      borderRadius: '50%',
                      border: '1.5px solid #FFFFFF'
                    }} />
                  )}
                </div>

                <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {currentUserAvatar ? (
                    <img
                      src={currentUserAvatar}
                      alt="Avatar"
                      style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
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
                      {currentUserName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#1E293B' }}>{currentUserName}</span>
                </Link>
              </div>
            </header>

            {/* Modal Notifikasi */}
            <NotificationModal
              isOpen={showGlobalNotif}
              onClose={() => setShowGlobalNotif(false)}
              notifications={globalNotifs}
            />

            <Sidebar
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              onLogout={handleLogout}
            />

            <main>
              <Routes>
                <Route path="/" element={<Home onSyncNotifications={handleSyncNotifications} />} />
                <Route path="/spending" element={<SpendingHome />} />
                <Route path="/tasks" element={<TasksHome />} />
                <Route path="/workiez" element={<WorkiezHome />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />
                <Route path="/history" element={<History />} />
              </Routes>
            </main>

            <Navbar />

          </div>
        </Router>
      )}
    </GoogleOAuthProvider>
  );
}