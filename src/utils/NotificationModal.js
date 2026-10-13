import React from 'react';
import './Notification.css';

export default function NotificationModal({ isOpen, onClose, notifications = [] }) {
  if (!isOpen) return null;

  return (
    <div className="jax-notif-overlay">
      <div className="jax-notif-card">
        {/* Ornamen Partikel */}
        <div style={{ position: 'absolute', top: '24px', left: '28px', width: '8px', height: '8px', borderRadius: '50%', background: '#FDE047', opacity: 0.8 }} />
        <div style={{ position: 'absolute', top: '48px', left: '20px', width: '5px', height: '5px', borderRadius: '50%', background: '#67E8F9', opacity: 0.7 }} />
        <div style={{ position: 'absolute', top: '22px', right: '34px', width: '9px', height: '9px', borderRadius: '50%', background: '#FDE047', opacity: 0.8 }} />
        <div style={{ position: 'absolute', top: '56px', right: '22px', width: '6px', height: '6px', borderRadius: '50%', background: '#A5F3FC', opacity: 0.7 }} />

        <button onClick={onClose} className="jax-notif-close">
          ✕
        </button>

        <div style={{ padding: '32px 24px 18px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="jax-notif-envelope">
            <div style={{
              position: 'absolute',
              top: '-16px',
              width: '76px',
              height: '42px',
              background: '#E2E8F0',
              borderRadius: '8px 8px 4px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '900',
              color: '#1E3A8A',
              letterSpacing: '2px'
            }}>
              ••••
            </div>
            <div style={{ display: 'flex', gap: '22px', marginBottom: '8px', zIndex: 2 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1E293B' }} />
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1E293B' }} />
            </div>
            <div style={{ width: '16px', height: '3px', borderRadius: '3px', background: '#1E293B', zIndex: 2 }} />
          </div>

          <div style={{
            background: '#FFFFFF',
            color: '#E11D48',
            padding: '6px 20px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: '800',
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
            marginBottom: '10px'
          }}>
            Notification
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.92)', lineHeight: '1.5', maxWidth: '300px' }}>
            {notifications.length > 0
              ? 'Berikut beberapa catatan penting yang memerlukan perhatian Anda hari ini.'
              : 'Semua sistem aman, tidak ada notifikasi genting saat ini.'}
          </p>
        </div>

        <div style={{
          padding: '0 20px 20px 20px',
          maxHeight: '260px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {notifications.length === 0 ? (
            <div style={{
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px dashed rgba(255, 255, 255, 0.3)',
              borderRadius: '16px',
              padding: '18px 14px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#FFFFFF'
            }}>
              Semua agenda dan batasan anggaran berada dalam kondisi optimal!
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div key={idx} className="jax-notif-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    color: notif.type === 'danger' ? '#FECDD3' : '#FDE68A',
                    letterSpacing: '0.5px'
                  }}>
                    {notif.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#FFFFFF' }}>
                    {notif.title || ''}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.45', fontWeight: '400' }}>
                  {notif.desc}
                </p>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#FFFFFF', padding: '16px 20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#F59E0B',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              padding: '6px 16px',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {notifications.length > 0 ? 'Tutup & Mengerti' : 'Kembali ke Dasbor'}
          </button>
        </div>
      </div>
    </div>
  );
}