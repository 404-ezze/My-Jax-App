import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiX, 
  FiHome, 
  FiDollarSign, 
  FiCheckSquare, 
  FiBriefcase, 
  FiClock, 
  FiSettings, 
  FiChevronRight
} from 'react-icons/fi';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  const sidebarWidth = '300px';
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [hoveredSecondaryIdx, setHoveredSecondaryIdx] = useState(null);

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      desc: 'Ringkasan analitik & metrik',
      icon: FiHome,
      color: '#2563EB',
      bgLight: '#EFF6FF'
    },
    {
      path: '/spending',
      label: 'Spending Hub',
      desc: 'Pencatatan kas & pengeluaran',
      icon: FiDollarSign,
      color: '#3B82F6',
      bgLight: '#EFF6FF'
    },
    {
      path: '/tasks',
      label: 'Tasks & Agenda',
      desc: 'Target tugas & prioritas',
      icon: FiCheckSquare,
      color: '#10B981',
      bgLight: '#ECFDF5'
    },
    {
      path: '/workiez',
      label: 'Job Tracker',
      desc: 'Monitoring lamaran kerja',
      icon: FiBriefcase,
      color: '#F59E0B',
      bgLight: '#FFFBEB'
    }
  ];

  const secondaryItems = [
    { path: '/history', label: 'Riwayat Log', icon: FiClock },
    { path: '/settings', label: 'Pengaturan Sistem', icon: FiSettings }
  ];

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
            background: 'rgba(15, 23, 42, 0.45)', 
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
        background: 'rgba(255, 255, 255, 0.94)', 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999, 
        transition: 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1)', 
        boxShadow: '15px 0 35px rgba(15, 23, 42, 0.08)', 
        display: 'flex', 
        flexDirection: 'column',
        boxSizing: 'border-box',
        fontFamily: 'Poppins, sans-serif'
      }}>
        
        <div style={{ 
          padding: '24px 20px 20px 20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #F1F5F9' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img 
              src="/image/logo_myjax.png" 
              alt="Logo" 
              style={{ 
                width: '36px', 
                height: '36px', 
                objectFit: 'contain', 
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '3px',
                flexShrink: 0
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ paddingLeft: '2px' }}>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
                MY JAX
              </h3>
              <span style={{ 
                display: 'block', 
                marginTop: '4px', 
                fontSize: '11px', 
                color: '#64748B', 
                fontWeight: '500',
                lineHeight: '1.3' 
              }}>
                Productivity & Financial Management System
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

        {/* Menu Navigasi Utama */}
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', paddingLeft: '8px', marginBottom: '4px' }}>
            Modul Utama
          </span>

          {menuItems.map((item, idx) => {
            const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();
            const isHovered = hoveredIdx === idx;
            const Icon = item.icon;

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
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isActive ? '#F8FAFC' : isHovered ? '#F1F5F9' : 'transparent',
                  border: isActive ? '1px solid #E2E8F0' : '1px solid transparent',
                  transform: isHovered && !isActive ? 'translateX(4px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    background: isActive ? item.bgLight : isHovered ? '#E2E8F0' : '#F1F5F9', 
                    color: item.color, 
                    padding: '8px', 
                    borderRadius: '10px', 
                    display: 'flex',
                    transition: 'all 0.2s ease'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: isActive ? '600' : '500', color: isActive ? '#0F172A' : '#334155' }}>
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
                    color={isActive ? '#0F172A' : '#94A3B8'} 
                    style={{ transform: isHovered ? 'translateX(2px)' : 'none', transition: 'transform 0.2s ease' }} 
                  />
                )}
              </Link>
            );
          })}

          <div style={{ borderTop: '1px solid #F1F5F9', margin: '12px 0 8px 0' }} />

          <span style={{ fontSize: '10px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', paddingLeft: '8px', marginBottom: '4px' }}>
            Preferensi
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
                  gap: '12px',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  color: isActive ? '#0F172A' : isHovered ? '#1E293B' : '#64748B',
                  background: isActive ? '#F8FAFC' : isHovered ? '#F1F5F9' : 'transparent',
                  transform: isHovered && !isActive ? 'translateX(4px)' : 'none',
                  fontSize: '12px',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={15} color={isActive ? '#0F172A' : isHovered ? '#334155' : '#94A3B8'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer Bersih */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: '600', color: '#94A3B8', letterSpacing: '0.4px' }}>
            © 2026, Eze. All rights reserved.
          </p>
        </div>

      </aside>
    </>
  );
}