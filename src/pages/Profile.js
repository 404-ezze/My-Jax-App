import React, { useState } from 'react';
import {
  FiUser,
  FiMail,
  FiEdit3,
  FiCheckCircle,
  FiX,
  FiCheck,
  FiShield,
  FiDownload,
  FiDatabase,
  FiExternalLink
} from 'react-icons/fi';

const MemphisProfileDecorations = () => (
  <>
    <svg style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.85, pointerEvents: 'none' }} width="75" height="24" viewBox="0 0 80 20" fill="none">
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
      pointerEvents: 'none'
    }} />
  </>
);

// --- TILE GRAFIS MEMPHIS UNTUK MODUL EKSPOR DATA ---
const ExportTileSpending = () => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #3B3DBF 0%, #24248A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(36, 36, 138, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="4" fill="#FFFFFF" />
      <path d="M2 9.5H22" stroke="#3B3DBF" strokeWidth="2" />
      <circle cx="17.5" cy="14.5" r="1.8" fill="#F59E0B" />
      <rect x="5" y="13.5" width="6" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  </div>
);

const ExportTileTasks = () => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #059669 0%, #046A4A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(5, 150, 105, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.25)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="#FFFFFF" />
      <rect x="8" y="1.5" width="8" height="3" rx="1.5" fill="#F59E0B" />
      <path d="M7.5 9L9.5 11L14 6.5" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7.5" y="14" width="9" height="2" rx="1" fill="#E2E8F0" />
    </svg>
  </div>
);

const ExportTileWorkiez = () => (
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 3px 8px rgba(15, 23, 42, 0.25)',
    flexShrink: 0
  }}>
    <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.35)' }} />
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="3" fill="#FFFFFF" />
      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M3 12H21" stroke="#E2E8F0" strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="3" height="3" rx="1" fill="#F59E0B" />
    </svg>
  </div>
);

// Helper Fungsi Pengunduhan CSV
const downloadCSV = (filename, csvContent) => {
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function Profile() {
  const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
  const isGoogle = authMode === 'google';
  const isGuest = authMode === 'guest';

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('myjax_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }

    if (isGoogle) {
      const gName = localStorage.getItem('jax_user_name') || 'Pengguna JAX';
      const gEmail = localStorage.getItem('jax_user_email') || 'google_user@gmail.com';
      const gUsername = gEmail.split('@')[0] || 'google_user';
      return {
        nama: gName,
        username: gUsername,
        email: gEmail,
        avatar: localStorage.getItem('jax_user_avatar') || ''
      };
    }

    return {
      nama: localStorage.getItem('jax_user_name') || 'Tamu Demo',
      username: 'guest_user',
      email: 'Mode Tamu (Offline)'
    };
  });

  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // Hitung jumlah baris data lokal
  const spendingCount = useMemoCount(isGuest ? 'jax_guest_spending' : 'jax_cache_spending');
  const tasksCount = useMemoCount(isGuest ? 'jax_guest_tasks' : 'jax_cache_tasks');
  const workiezCount = useMemoCount(isGuest ? 'jax_guest_workiez' : 'jax_cache_workiez');

  function useMemoCount(key) {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  // Modal Edit Profil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nama: userData.nama,
    username: userData.username,
    email: userData.email
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...userData,
      nama: profileForm.nama.trim() || userData.nama,
      username: profileForm.username.trim() || userData.username,
      email: profileForm.email.trim() || userData.email
    };
    setUserData(updated);
    localStorage.setItem('myjax_user_profile', JSON.stringify(updated));
    localStorage.setItem('jax_user_name', updated.nama);
    setShowEditProfileModal(false);
  };

  // --- LOGIKA EKSPOR DATA (.CSV) ---
  const handleExportData = (type) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const generateCSVString = (headers, rows) => {
      const escapeCell = (val) => {
        const str = String(val ?? '').replace(/"/g, '""');
        return `"${str}"`;
      };
      const headerRow = headers.map(escapeCell).join(',');
      const dataRows = rows.map(r => r.map(escapeCell).join(',')).join('\n');
      return `${headerRow}\n${dataRows}`;
    };

    const spKey = isGuest ? 'jax_guest_spending' : 'jax_cache_spending';
    const tsKey = isGuest ? 'jax_guest_tasks' : 'jax_cache_tasks';
    const wkKey = isGuest ? 'jax_guest_workiez' : 'jax_cache_workiez';

    if (type === 'spending' || type === 'all') {
      const spendingRaw = JSON.parse(localStorage.getItem(spKey) || '[]');
      const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal', 'Metode Pembayaran'];
      const rows = spendingRaw.map(item => [
        item[0] ?? item.id ?? '',
        item[1] ?? item.tanggal ?? '',
        item[2] ?? item.tipe ?? '',
        item[3] ?? item.kategori ?? '',
        item[4] ?? item.keterangan ?? '',
        item[5] ?? item.nominal ?? '0',
        item[6] ?? item.metode ?? ''
      ]);
      const csv = generateCSVString(headers, rows);
      downloadCSV(`Spending_Hub_${todayStr}.csv`, csv);
    }

    if (type === 'tasks' || type === 'all') {
      const tasksRaw = JSON.parse(localStorage.getItem(tsKey) || '[]');
      const headers = ['ID', 'Tenggat Waktu', 'Judul Tugas', 'Kategori', 'Prioritas', 'Status', 'Catatan / Waktu'];
      const rows = tasksRaw.map(item => [
        item[0] ?? item.id ?? '',
        item[1] ?? item.deadline ?? item.tenggat ?? '',
        item[2] ?? item.judul ?? '',
        item[3] ?? item.kategori ?? '',
        item[4] ?? item.prioritas ?? '',
        item[5] ?? item.status ?? '',
        item[6] ?? item.catatan ?? ''
      ]);
      const csv = generateCSVString(headers, rows);
      downloadCSV(`Tasks_Agenda_${todayStr}.csv`, csv);
    }

    if (type === 'workiez' || type === 'all') {
      const workiezRaw = JSON.parse(localStorage.getItem(wkKey) || '[]');
      const headers = ['ID', 'Tanggal Apply', 'Perusahaan', 'Posisi', 'Tautan Loker', 'Status', 'Catatan'];
      const rows = workiezRaw.map(item => [
        item[0] ?? item.id ?? '',
        item[1] ?? item.tanggal ?? '',
        item[2] ?? item.perusahaan ?? '',
        item[3] ?? item.posisi ?? '',
        item[4] ?? item.linkLoker ?? item.lokasi ?? '',
        item[5] ?? item.status ?? '',
        item[6] ?? item.catatan ?? ''
      ]);
      const csv = generateCSVString(headers, rows);
      downloadCSV(`Workiez_Tracker_${todayStr}.csv`, csv);
    }

    const labelMap = {
      spending: 'Data Spending Hub berhasil diunduh.',
      tasks: 'Data Tasks & Agenda berhasil diunduh.',
      workiez: 'Data Workiez Tracker berhasil diunduh.',
      all: 'Seluruh berkas CSV berhasil diekspor.'
    };

    setDownloadSuccessMessage(labelMap[type]);
    setTimeout(() => setDownloadSuccessMessage(''), 3500);
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', paddingBottom: '40px' }}>

      <style>{`
        .profile-row-card {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          gap: 12px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .profile-row-card:hover {
          background: #FFFFFF;
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(30, 27, 75, 0.04);
        }
        .export-item-card {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          gap: 14px;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.02);
          transition: all 0.2s ease;
        }
        .export-item-card:hover {
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
          transform: translateY(-1px);
        }
      `}</style>

      {/* 1. HERO HEADER GRADIENT */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 45%, #4338CA 100%)',
        minHeight: '170px',
        padding: '24px 20px 48px 20px',
        color: '#FFFFFF',
        overflow: 'hidden',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px'
      }}>
        <MemphisProfileDecorations />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              marginBottom: '6px'
            }}>
              Account & Settings
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              Profil & Pengaturan
            </h1>
          </div>

          {!isGuest && (
            <button
              onClick={() => {
                setProfileForm({
                  nama: userData.nama,
                  username: userData.username,
                  email: userData.email
                });
                setShowEditProfileModal(true);
              }}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
                color: '#1E1B4B',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)'
              }}
            >
              <FiEdit3 size={13} />
              <span>Edit Profil</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. LEMBAR KONTEN PUTIH ELEGAN */}
      <div style={{
        marginTop: '-32px',
        background: '#FFFFFF',
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        padding: '24px 18px',
        boxShadow: '0 -10px 28px rgba(15, 23, 42, 0.04)',
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>

        {/* FLOATING IDENTITY HERO CARD */}
        <div style={{
          marginTop: '-44px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 6px 20px rgba(30, 27, 75, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.nama}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 4px 12px rgba(46, 49, 146, 0.25)',
                  flexShrink: 0
                }}
              />
            ) : (
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #2E3192 0%, #1E1B4B 100%)',
                border: '3px solid #FFFFFF',
                boxShadow: '0 4px 12px rgba(46, 49, 146, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F59E0B',
                fontSize: '22px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {(userData.nama || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E1B4B' }}>
                  {userData.nama}
                </h2>
                <span style={{ color: isGoogle ? '#059669' : '#64748B', display: 'flex' }} title={isGoogle ? 'Akun Google Terverifikasi' : 'Mode Tamu'}>
                  <FiCheckCircle size={15} />
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
                @{userData.username}
              </p>
            </div>
          </div>

          <div style={{
            background: isGoogle ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.15)',
            color: isGoogle ? '#059669' : '#D97706',
            padding: '5px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isGoogle ? '#059669' : '#D97706' }}></span>
            {isGoogle ? 'Google Drive Terhubung' : 'Mode Tamu (Lokal)'}
          </div>
        </div>

        {/* NOTIFIKASI SUKSES UNDUH DATA */}
        {downloadSuccessMessage && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#065F46',
            padding: '12px 16px',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.08)'
          }}>
            <FiCheckCircle size={16} color="#059669" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {/* --- BAGIAN EXPORT DATA --- */}
        <div style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1E1B4B' }}>
                Export Data
              </h3>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
              Cadangkan seluruh berkas catatan transaksi, agenda tugas, dan lamaran kerja ke format tabel spreadsheet.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Spending Hub */}
            <div className="export-item-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <ExportTileSpending />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E1B4B', whiteSpace: 'nowrap' }}>
                      Spending Hub
                    </h4>
                    <span style={{ fontSize: '10px', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                      {spendingCount} baris
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Rekap mutasi kas, pengeluaran & tagihan rutin
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExportData('spending')}
                style={exportButtonStyle}
              >
                <FiDownload size={13} />
                <span>Unduh</span>
              </button>
            </div>

            {/* 2. Tasks & Agenda */}
            <div className="export-item-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <ExportTileTasks />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E1B4B', whiteSpace: 'nowrap' }}>
                      Tasks & Agenda
                    </h4>
                    <span style={{ fontSize: '10px', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                      {tasksCount} baris
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Daftar tenggat tugas, prioritas & status agenda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExportData('tasks')}
                style={exportButtonStyle}
              >
                <FiDownload size={13} />
                <span>Unduh</span>
              </button>
            </div>

            {/* 3. Workiez Tracker */}
            <div className="export-item-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <ExportTileWorkiez />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#1E1B4B', whiteSpace: 'nowrap' }}>
                      Workiez Tracker
                    </h4>
                    <span style={{ fontSize: '10px', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px', fontWeight: '500' }}>
                      {workiezCount} baris
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Riwayat lamaran kerja, pipeline & status interview
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleExportData('workiez')}
                style={exportButtonStyle}
              >
                <FiDownload size={13} />
                <span>Unduh</span>
              </button>
            </div>
          </div>
        </div>

        {/* GRUP 1: DATA IDENTITAS DIRI */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '18px',
          boxShadow: '0 2px 10px rgba(30, 27, 75, 0.02)'
        }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E1B4B' }}>
              Identitas Pengguna
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Informasi kontak dan data akun Anda</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBoxStyle}><FiUser size={15} /></div>
                <div>
                  <div style={dataLabelStyle}>Nama Pengguna</div>
                  <div style={dataValueStyle}>{userData.nama}</div>
                </div>
              </div>
            </div>

            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBoxStyle}><FiShield size={15} /></div>
                <div>
                  <div style={dataLabelStyle}>Status Mode Sesi</div>
                  <div style={dataValueStyle}>
                    {isGoogle ? 'Akun Google Terautentikasi' : 'Mode Tamu (Local Storage)'}
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBoxStyle}><FiMail size={15} /></div>
                <div>
                  <div style={dataLabelStyle}>Alamat Email</div>
                  <div style={dataValueStyle}>{userData.email}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GRUP 2: STATUS PENYIMPANAN / DRIVE */}
        {isGoogle && (
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '18px',
            padding: '18px',
            boxShadow: '0 2px 10px rgba(30, 27, 75, 0.02)'
          }}>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E1B4B' }}>
                  Penyimpanan Google Drive
                </h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Berkas basis data spreadsheet pribadi Anda</span>
              </div>

              {localStorage.getItem('jax_user_sheet_id') && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${localStorage.getItem('jax_user_sheet_id')}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#ECFDF5',
                    color: '#059669',
                    border: '1px solid #A7F3D0',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span>Buka Sheet</span>
                  <FiExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...iconBoxStyle, background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
                  <FiDatabase size={15} />
                </div>
                <div>
                  <div style={dataLabelStyle}>Nama Berkas Spreadsheet</div>
                  <div style={dataValueStyle}>MY JAX - Personal Data {userData.nama}</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* --- MODAL EDIT PROFIL --- */}
      {showEditProfileModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>Edit Profil Akun</h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Perbarui data identitas Anda</span>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} style={iconCloseBtnStyle}><FiX size={15} /></button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '12px' }}>
                <label style={formLabelStyle}>Nama Pengguna</label>
                <input
                  type="text"
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={formLabelStyle}>Username</label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={formLabelStyle}>Alamat Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={formInputStyle}
                  disabled={isGoogle}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowEditProfileModal(false)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" style={modalSubmitBtnStyle}>
                  <FiCheck size={13} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const exportButtonStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #E2E8F0',
  padding: '7px 14px',
  borderRadius: '10px',
  fontSize: '11.5px',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: '#2E3192',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  flexShrink: 0,
  transition: 'all 0.18s ease'
};

const iconBoxStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(46, 49, 146, 0.08)',
  color: '#2E3192',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const dataLabelStyle = {
  fontSize: '10px',
  color: '#64748B',
  fontWeight: '500',
  textTransform: 'uppercase',
  letterSpacing: '0.3px'
};

const dataValueStyle = {
  fontSize: '13px',
  color: '#1E1B4B',
  fontWeight: '600',
  marginTop: '2px'
};

const formLabelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: '600',
  color: '#1E1B4B',
  marginBottom: '4px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px'
};

const formInputStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid #CBD5E1',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'Poppins, sans-serif',
  background: '#F8FAFC',
  color: '#1E293B',
  fontWeight: '500'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(30, 27, 75, 0.55)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
  padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF',
  borderRadius: '20px',
  padding: '22px',
  width: '100%',
  boxShadow: '0 20px 35px -10px rgba(30, 27, 75, 0.25)',
  fontFamily: 'Poppins, sans-serif',
  boxSizing: 'border-box',
  border: '1px solid #E2E8F0'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  cursor: 'pointer',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '8px',
  color: '#64748B'
};

const modalCancelBtnStyle = {
  padding: '8px 14px',
  background: '#F1F5F9',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: '500',
  color: '#475569',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px',
  background: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: '600',
  color: '#1E1B4B',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)'
};