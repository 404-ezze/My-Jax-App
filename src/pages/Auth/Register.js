import React, { useState, useEffect } from 'react';
import './Auth.css';
import jaxNewLogo from '../../assets/jaxxnew.png';
import { FiCheckCircle, FiDatabase } from 'react-icons/fi';
import { useGoogleLogin } from '@react-oauth/google';
import { findOrCreateMyJaxSheet, SCOPES } from '../../utils/GoogleStorage';

export default function Auth({ onAuthSuccess }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginOptions, setShowLoginOptions] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleSuccessData, setGoogleSuccessData] = useState(null);
  const [timeData, setTimeData] = useState({ time: '09:41', date: 'Selasa, 13 Oktober' });

  // Update Jam & Tanggal Lockscreen
  useEffect(() => {
    const updateLockscreenTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      setTimeData({
        time: `${hours}:${minutes}`,
        date: `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`
      });
    };

    updateLockscreenTime();
    const timer = setInterval(updateLockscreenTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // 3 Slide Penjelasan dengan Variasi Gelombang & Animasi Nyata
  const slides = [
    {
      title: 'Take Control of Your Flow!',
      desc: 'Pantau arus kas harian dan kelompokkan dana ke berbagai saku impian modular secara praktis tanpa ribet.',
      wavePath: 'M0,90 C80,180 180,-10 270,120 C320,170 350,130 375,90 L375,280 L0,280 Z',
      animClass: 'anim-levitate'
    },
    {
      title: 'Smart Habit, Clear Target!',
      desc: 'Jaga batas budget bulanan, jadwalkan tagihan rutin, dan kelola prioritas aktivitas harian Anda dalam satu layar.',
      wavePath: 'M0,130 C90,40 180,180 270,60 C320,10 350,70 375,120 L375,280 L0,280 Z',
      animClass: 'anim-sway-tilt'
    },
    {
      title: 'Realistic Growth, Real Results!',
      desc: 'Sinkronisasi data langsung ke Google Sheets Anda secara aman, atau mulai pencatatan secara mandiri melalui mode tamu.',
      wavePath: 'M0,60 C70,160 170,20 250,140 C310,190 350,110 375,70 L375,280 L0,280 Z',
      animClass: 'anim-zoom-float'
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setShowLoginOptions(true);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    scope: SCOPES,
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setErrorMessage('');
      try {
        const token = tokenResponse.access_token;
        localStorage.setItem('jax_google_token', token);

        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profile = await userRes.json();
        const userName = profile.name || 'Pengguna JAX';

        localStorage.setItem('jax_user_name', userName);
        localStorage.setItem('jax_user_email', profile.email || '');
        localStorage.setItem('jax_user_avatar', profile.picture || '');

        const sheetId = await findOrCreateMyJaxSheet(token, userName);
        localStorage.setItem('jax_user_sheet_id', sheetId);
        localStorage.setItem('jax_auth_mode', 'google');

        setGoogleSuccessData({
          name: userName,
          fileName: `MY JAX - Personal Data ${userName}`,
          sheetId
        });
      } catch (err) {
        console.error('Login Google gagal:', err);
        setErrorMessage('Gagal menghubungkan Google Sheets. Pastikan izin telah diberikan.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setErrorMessage('Otorisasi Google dibatalkan.');
    }
  });

  const handleGuest = () => {
    localStorage.setItem('jax_auth_mode', 'guest');
    localStorage.setItem('jax_user_name', 'Tamu');
    onAuthSuccess('guest');
  };

  if (googleSuccessData) {
    return (
      <div className="onboard-full-screen">
        <div className="onboard-status-container">
          <div className="onboard-status-icon-wrap">
            <FiCheckCircle size={38} color="#10B981" />
          </div>

          <h2 className="onboard-main-title">Google Drive Terhubung!</h2>
          <p className="onboard-main-desc">
            Halo <strong>{googleSuccessData.name}</strong>, spreadsheet pribadi Anda siap digunakan:
          </p>

          <div className="onboard-file-card">
            <FiDatabase size={18} color="#2563EB" />
            <div className="onboard-file-info">
              <span className="onboard-file-label">DATABASE PERSONAL</span>
              <span className="onboard-file-name">{googleSuccessData.fileName}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAuthSuccess('google')}
            className="onboard-yellow-cta-btn"
          >
            Buka Dashboard &rarr;
          </button>
        </div>
      </div>
    );
  }

  const isLastSlide = currentSlide === 2;

  return (
    <div className="onboard-full-screen">

      {/* Jam & Tanggal Lockscreen di Bagian Atas Tengah */}
      <div className="onboard-lockscreen-header">
        <span className="onboard-lockscreen-date">{timeData.date}</span>
        <h2 className="onboard-lockscreen-time">{timeData.time}</h2>
      </div>

      {/* Gelombang Kurva Meliuk Berbeda per Slide */}
      <div className="onboard-wave-layer">
        <svg viewBox="0 0 375 280" fill="none" preserveAspectRatio="none" className="onboard-wave-svg">
          <path d={slides[currentSlide].wavePath} fill="#2563EB" />
        </svg>
      </div>

      {/* Area Maskot dengan Partikel Mengapung */}
      <div className="onboard-hero-visual-area">
        <div className="onboard-glow-aura" />
        <img
          src={jaxNewLogo}
          alt="MY JAX Mascot"
          className={`onboard-mascot-img ${slides[currentSlide].animClass}`}
        />
      </div>

      {/* Area Biru Konten Teks & Tombol */}
      <div className="onboard-body-area">
        {!showLoginOptions ? (
          <div className="onboard-text-block">
            <h1 className="onboard-main-title">
              {slides[currentSlide].title}
            </h1>
            <p className="onboard-main-desc">
              {slides[currentSlide].desc}
            </p>
          </div>
        ) : (
          <div className="onboard-text-block">
            <h1 className="onboard-main-title">
              Ready to Level Up Your Life?
            </h1>
            <p className="onboard-main-desc">
              Pilih akses masuk untuk menghubungkan asisten pintar Anda dan raih target harian lebih teratur.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="onboard-error-inline">{errorMessage}</div>
        )}

        {/* Indikator Dots */}
        <div className="onboard-pagination-dots">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`onboard-dot-indicator ${currentSlide === idx ? 'active' : ''}`}
              onClick={() => { setCurrentSlide(idx); setShowLoginOptions(false); }}
            />
          ))}
        </div>

        {/* Kontrol Navigasi */}
        <div className="onboard-bottom-controls">
          {!isLastSlide ? (
            <div className="onboard-nav-between">
              <button
                type="button"
                onClick={() => setCurrentSlide(2)}
                className="onboard-skip-label"
              >
                Skip
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="onboard-next-pill-btn"
              >
                Next &gt;
              </button>
            </div>
          ) : !showLoginOptions ? (
            <button
              type="button"
              onClick={() => setShowLoginOptions(true)}
              className="onboard-yellow-cta-btn"
            >
              Get Started
            </button>
          ) : (
            <div className="onboard-auth-stack">
              <button
                type="button"
                onClick={() => handleGoogleLogin()}
                disabled={isGoogleLoading}
                className="onboard-white-social-btn"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width="18"
                  height="18"
                />
                <span>{isGoogleLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}</span>
              </button>

              <button
                type="button"
                onClick={handleGuest}
                disabled={isGoogleLoading}
                className="onboard-yellow-cta-btn"
              >
                Lanjut sebagai Tamu
              </button>

              <button
                type="button"
                onClick={() => setShowLoginOptions(false)}
                className="onboard-back-label"
              >
                &larr; Kembali
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}