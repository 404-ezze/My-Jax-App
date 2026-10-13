import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiX,
  FiUser,
  FiSliders,
  FiChevronRight,
  FiLogOut,
  FiShield
} from 'react-icons/fi';

// --- MINI TILE GRAFIS KHUSUS SIDEBAR (MEMPHIS DUOTONE) ---
const SidebarDashboardTile = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(46, 49, 146, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="6" height="6" rx="1.5" fill="#FFFFFF" />
      <rect x="11" y="3" width="6" height="6" rx="1.5" fill="#F59E0B" />
      <rect x="3" y="11" width="6" height="6" rx="1.5" fill="#CBD5E1" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" fill="#FFFFFF" />
    </svg>
  </div>
);

const SidebarSpendingTile = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #3B3DBF 0%, #24248A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(36, 36, 138, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#FFFFFF" />
      <path d="M2 9.5H22" stroke="#3B3DBF" strokeWidth="2" />
      <circle cx="17.5" cy="14.5" r="1.8" fill="#F59E0B" />
    </svg>
  </div>
);

const SidebarTasksTile = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #059669 0%, #046A4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)' }} />
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#FFFFFF" />
      <rect x="8" y="1.5" width="8" height="3" rx="1.5" fill="#F59E0B" />
      <path d="M7.5 9L9.5 11L14 6.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const SidebarWorkiezTile = () => (
  <div style={{
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(30, 27, 75, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" fill="#FFFFFF" />
      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#FFFFFF" strokeWidth="2" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="1" fill="#F59E0B" />
    </svg>
  </div>
);

export default function Sidebar({ isOpen, toggleSidebar, onLogout }) {
  const location = useLocation();
  const sidebarWidth = '300px';
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoveredSecondaryIdx, setHoveredSecondaryIdx] = useState(null);
  const [isHoveredLogout, setIsHoveredLogout] = useState(false);

  // Ambil profil pengguna secara dinamis
  const [userProfile, setUserProfile] = useState({
    nama: 'User',
    username: 'user_account',
    avatar: '',
    isGoogle: false
  });

  useEffect(() => {
    try {
      const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
      const isGoogle = authMode === 'google';
      const gName = localStorage.getItem('jax_user_name');
      const gEmail = localStorage.getItem('jax_user_email');
      const gAvatar = localStorage.getItem('jax_user_avatar');

      const saved = localStorage.getItem('myjax_user_profile');
      let parsed = null;
      if (saved) {
        try { parsed = JSON.parse(saved); } catch (e) {}
      }

      if (isGoogle) {
        setUserProfile({
          nama: gName || (parsed && parsed.nama) || 'Pengguna JAX',
          username: gEmail ? gEmail.split('@')[0] : (parsed && parsed.username) || 'google_user',
          avatar: gAvatar || '',
          isGoogle: true
        });
      } else {
        setUserProfile({
          nama: gName || (parsed && parsed.nama) || 'Tamu',
          username: 'guest_mode',
          avatar: '',
          isGoogle: false
        });
      }
    } catch (e) {}
  }, [isOpen]);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      desc: 'Ringkasan & agenda harian',
      TileComponent: SidebarDashboardTile
    },
    {
      path: '/spending',
      label: 'Spending Hub',
      desc: 'Pencatatan kas & mutasi dana',
      TileComponent: SidebarSpendingTile
    },
    {
      path: '/tasks',
      label: 'Tasks & Agenda',
      desc: 'Prioritas pengerjaan & jadwal',
      TileComponent: SidebarTasksTile
    },
    {
      path: '/workiez',
      label: 'Job Tracker',
      desc: 'Monitoring status lamaran kerja',
      TileComponent: SidebarWorkiezTile
    }
  ];

  const secondaryItems = [
    {
      path: '/profile',
      label: 'Profil Akun',
      desc: 'Kredensial & identitas diri',
      icon: FiUser
    },
    {
      path: '/settings',
      label: 'Pengaturan & Ekspor',
      desc: 'Data Vault & konfigurasi sistem',
      icon: FiSliders
    }
  ];

  const handleLogoutClick = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun?')) {
      if (toggleSidebar) toggleSidebar();
      if (onLogout) onLogout();
    }
  };

  return (
    <>
      {/* Backdrop Glassmorphism Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30, 27, 75, 0.45)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 9998,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Kontainer Sidebar */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: isOpen ? 0 : `-${sidebarWidth}`,
        width: sidebarWidth,
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        zIndex: 9999,
        transition: 'left 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '15px 0 35px rgba(30, 27, 75, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif'
      }}>

        {/* Header Sidebar */}
        <div style={{
          padding: '18px 18px 16px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/image/logo_myjax.png"
              alt="Logo"
              style={{
                width: '36px',
                height: '36px',
                objectFit: 'contain',
                borderRadius: '10px',
                background: '#F8FAFC',
                padding: '3px',
                border: '1px solid #E2E8F0',
                flexShrink: 0
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h3 style={{ margin: 0, color: '#1E1B4B', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                MY JAX
              </h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '3px',
                fontSize: '10px',
                color: '#64748B',
                fontWeight: '400',
                lineHeight: '1.3'
              }}>
                Personal Life Tracker
              </span>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '8px',
              color: '#64748B',
              flexShrink: 0,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EEF2F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Navigasi Modul & Preferensi */}
        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', paddingLeft: '8px', marginBottom: '4px' }}>
            Modul Utama
          </span>

          {menuItems.map((item, idx) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            const isHovered = hoveredIdx === idx;
            const TileComp = item.TileComponent;

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={toggleSidebar}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(46, 49, 146, 0.08)' : isHovered ? '#F8FAFC' : 'transparent',
                  border: isActive ? '1px solid rgba(46, 49, 146, 0.2)' : '1px solid transparent',
                  transform: isHovered && !isActive ? 'translateX(3px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TileComp />
                  <div>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#2E3192' : '#1E293B'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '400' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                {(isActive || isHovered) && (
                  <FiChevronRight
                    size={14}
                    color={isActive ? '#F59E0B' : '#94A3B8'}
                    style={{ transform: isHovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s ease' }}
                  />
                )}
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid #F1F5F9', margin: '14px 0 10px 0' }} />

          <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', paddingLeft: '8px', marginBottom: '4px' }}>
            Preferensi & Akun
          </span>

          {secondaryItems.map((item, idx) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            const isHovered = hoveredSecondaryIdx === idx;
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={toggleSidebar}
                onMouseEnter={() => setHoveredSecondaryIdx(idx)}
                onMouseLeave={() => setHoveredSecondaryIdx(null)}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  color: isActive ? '#2E3192' : isHovered ? '#1E293B' : '#64748B',
                  background: isActive ? 'rgba(46, 49, 146, 0.06)' : isHovered ? '#F8FAFC' : 'transparent',
                  border: isActive ? '1px solid rgba(46, 49, 146, 0.15)' : '1px solid transparent',
                  transform: isHovered && !isActive ? 'translateX(3px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: isActive ? '#2E3192' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    <Icon size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: isActive ? '600' : '500', color: isActive ? '#2E3192' : '#1E293B' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '9.5px', color: '#94A3B8' }}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <FiChevronRight
                  size={13}
                  color={isActive ? '#2E3192' : '#CBD5E1'}
                />
              </Link>
            );
          })}
        </div>

        {/* Footer Sidebar: Kartu Akun Aktif & Tombol Keluar */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid #F1F5F9',
          background: '#FAFAFD',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Mini Card Pengguna Aktif */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt={userProfile.nama}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    flexShrink: 0
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {(userProfile.nama || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#1E1B4B',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {userProfile.nama}
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#64748B',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  @{userProfile.username}
                </div>
              </div>
            </div>

            <span style={{
              background: userProfile.isGoogle ? '#DCFCE7' : '#FEF3C7',
              color: userProfile.isGoogle ? '#15803D' : '#D97706',
              padding: '2px 6px',
              borderRadius: '6px',
              fontSize: '9px',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {userProfile.isGoogle ? 'ONLINE' : 'TAMU'}
            </span>
          </div>

          {/* Tombol Logout Elegan */}
          <button
            type="button"
            onClick={handleLogoutClick}
            onMouseEnter={() => setIsHoveredLogout(true)}
            onMouseLeave={() => setIsHoveredLogout(false)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: isHoveredLogout ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
              border: isHoveredLogout ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid transparent',
              borderRadius: '10px',
              color: isHoveredLogout ? '#DC2626' : '#64748B',
              fontSize: '11.5px',
              fontWeight: '500',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '7px',
                background: isHoveredLogout ? '#FEE2E2' : '#F1F5F9',
                color: isHoveredLogout ? '#DC2626' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}>
                <FiLogOut size={13} />
              </div>
              <span>Keluar dari Akun</span>
            </div>

            <FiChevronRight
              size={13}
              color={isHoveredLogout ? '#DC2626' : '#94A3B8'}
              style={{
                transform: isHoveredLogout ? 'translateX(2px)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: '500', color: '#94A3B8', textAlign: 'center', letterSpacing: '0.2px' }}>
            © 2026 MY JAX System
          </p>
        </div>

      </aside>
    </>
  );
}