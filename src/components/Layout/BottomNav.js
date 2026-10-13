import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCalendar, FiPlus, FiBriefcase, FiUser } from 'react-icons/fi';

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navItem = (path, IconComponent, label) => {
    const isActive = currentPath === path.toLowerCase();
    return (
      <Link
        to={path}
        style={{
          textDecoration: 'none',
          color: isActive ? '#2E3192' : '#94A3B8',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          flex: 1
        }}
      >
        <IconComponent size={18} color={isActive ? '#2E3192' : '#94A3B8'} />
        <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500' }}>{label}</span>
      </Link>
    );
  };

  return (
    <div
      style={{
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
      }}
    >
      {navItem('/', FiHome, 'Home')}
      {navItem('/tasks', FiCalendar, 'Tasks')}

      {/* Tombol Cepat Catat Spending */}
      <Link
        to="/spending"
        style={{
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
        }}
      >
        <FiPlus size={22} color="#F59E0B" />
      </Link>

      {navItem('/workiez', FiBriefcase, 'Workiez')}
      {navItem('/profile', FiUser, 'Profile')}
    </div>
  );
}