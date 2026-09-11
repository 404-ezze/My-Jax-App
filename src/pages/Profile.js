import React, { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiEye, 
  FiEyeOff, 
  FiEdit3, 
  FiCheckCircle, 
  FiX, 
  FiCheck,
  FiLock,
  FiShield
} from 'react-icons/fi';

// Ornamen Grafis Latar
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

export default function Profile() {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('myjax_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      nama: 'Eze',
      username: 'eze_assistant',
      email: 'eze@myjax.space',
      password: 'password123'
    };
  });

  const [showPassword, setShowPassword] = useState(false);

  // Modal Edit Profil
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nama: userData.nama,
    username: userData.username,
    email: userData.email
  });

  // Modal Ubah Password
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

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
    setShowEditProfileModal(false);
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (passwordForm.oldPassword !== userData.password) {
      setPasswordError('Kata sandi saat ini tidak cocok.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak sesuai.');
      return;
    }

    const updated = { ...userData, password: passwordForm.newPassword };
    setUserData(updated);
    localStorage.setItem('myjax_user_profile', JSON.stringify(updated));
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', fontFamily: 'Poppins, sans-serif', paddingBottom: '24px' }}>
      
      <style>{`
        .profile-row-card {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 14px 16px;
          border-radius: 14px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .profile-row-card:hover {
          background: #FFFFFF;
          border-color: #CBD5E1;
          box-shadow: 0 4px 12px rgba(30, 27, 75, 0.04);
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
              Account & Security
            </div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              Profil Pengguna
            </h1>
          </div>

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
            {/* Avatar Modern dengan Double Ring Glow */}
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
              {userData.nama.charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1E1B4B' }}>
                  {userData.nama}
                </h2>
                <span style={{ color: '#059669', display: 'flex' }} title="Akun Terverifikasi">
                  <FiCheckCircle size={15} />
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
                @{userData.username}
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(5, 150, 105, 0.1)',
            color: '#059669',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
            Akun Aktif
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
            
            {/* Baris Nama Lengkap */}
            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBoxStyle}><FiUser size={15} /></div>
                <div>
                  <div style={dataLabelStyle}>Nama Panggilan / Lengkap</div>
                  <div style={dataValueStyle}>{userData.nama}</div>
                </div>
              </div>
            </div>

            {/* Baris Username */}
            <div className="profile-row-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={iconBoxStyle}><FiShield size={15} /></div>
                <div>
                  <div style={dataLabelStyle}>Username Akun</div>
                  <div style={dataValueStyle}>@{userData.username}</div>
                </div>
              </div>
            </div>

            {/* Baris Email */}
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

        {/* GRUP 2: KEAMANAN & KATA SANDI */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          padding: '18px',
          boxShadow: '0 2px 10px rgba(30, 27, 75, 0.02)'
        }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#1E1B4B' }}>
              Keamanan Akun
            </h3>
            <span style={{ fontSize: '11px', color: '#64748B' }}>Kelola perlindungan kredensial Anda</span>
          </div>

          <div className="profile-row-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ ...iconBoxStyle, background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
                <FiLock size={15} />
              </div>
              <div>
                <div style={dataLabelStyle}>Kata Sandi</div>
                <div style={{ ...dataValueStyle, letterSpacing: showPassword ? 'normal' : '3px' }}>
                  {showPassword ? userData.password : '••••••••••••'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={actionMiniBtnStyle}
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setPasswordError('');
                  setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setShowPasswordModal(true);
                }}
                style={{ 
                  ...actionMiniBtnStyle, 
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)', 
                  color: '#F59E0B', 
                  border: 'none',
                  fontWeight: '600', 
                  padding: '7px 12px' 
                }}
              >
                Ubah Sandi
              </button>
            </div>
          </div>
        </div>

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
                <label style={formLabelStyle}>Nama Panggilan / Lengkap</label>
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

      {/* --- MODAL UBAH PASSWORD --- */}
      {showPasswordModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>Ubah Kata Sandi</h3>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Pastikan menggunakan sandi yang aman</span>
              </div>
              <button onClick={() => setShowPasswordModal(false)} style={iconCloseBtnStyle}><FiX size={15} /></button>
            </div>

            {passwordError && (
              <div style={{ marginBottom: '12px', padding: '8px 10px', background: '#FEF2F2', borderRadius: '8px', color: '#991B1B', fontSize: '11px', fontWeight: '500' }}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSavePassword}>
              <div style={{ marginBottom: '12px' }}>
                <label style={formLabelStyle}>Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  placeholder="Masukkan sandi lama"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={formLabelStyle}>Kata Sandi Baru</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    style={{ ...formInputStyle, paddingRight: '34px' }}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    {showNewPassword ? <FiEyeOff size={13} /> : <FiEye size={13} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={formLabelStyle}>Konfirmasi Kata Sandi Baru</label>
                <input 
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Ulangi sandi baru"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  style={formInputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" style={modalSubmitBtnStyle}>
                  <FiCheck size={13} /> Perbarui Sandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- GAYA TAMPILAN PENDUKUNG ---
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
  color: '#1E293B',
  fontWeight: '600',
  marginTop: '2px'
};

const actionMiniBtnStyle = {
  background: '#FFFFFF',
  border: '1px solid #E2E8F0',
  padding: '6px 8px',
  borderRadius: '8px',
  fontSize: '11px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#64748B',
  transition: 'all 0.18s ease'
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