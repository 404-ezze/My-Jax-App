import React, { useState, useRef } from 'react';
import {
  FiX,
  FiMic,
  FiCheck,
  FiCheckCircle,
  FiRotateCcw,
  FiLoader
} from 'react-icons/fi';
import { appendRowToSheet } from '../../utils/GoogleStorage';

export default function WorkiezModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    perusahaan: '',
    posisi: '',
    linkLoker: '',
    status: 'Applied',
    catatan: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State Voice Command
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tekan dan tahan tombol untuk berbicara.');
  const recognitionRef = useRef(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.perusahaan.trim() || !formData.posisi.trim()) {
      setFormError('Nama perusahaan dan posisi yang dilamar wajib diisi.');
      return;
    }
    setFormError('');
    setFormSubmitting(true);

    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    const newId = `WRK-${Date.now()}`;
    const newRow = [
      newId,
      formData.tanggal,
      formData.perusahaan,
      formData.posisi,
      formData.linkLoker || '-',
      formData.status,
      formData.catatan || '-'
    ];

    try {
      if (authMode === 'google') {
        await appendRowToSheet('Workiez', newRow);
        const existing = JSON.parse(localStorage.getItem('jax_cache_workiez') || '[]');
        localStorage.setItem('jax_cache_workiez', JSON.stringify([newRow, ...existing]));
      } else {
        const guestWorkiez = JSON.parse(localStorage.getItem('jax_guest_workiez') || '[]');
        localStorage.setItem('jax_guest_workiez', JSON.stringify([newRow, ...guestWorkiez]));
      }

      setShowSuccessModal(true);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        perusahaan: '',
        posisi: '',
        linkLoker: '',
        status: 'Applied',
        catatan: ''
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Kendala penyimpanan: ' + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const startHoldingRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung Speech Recognition.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    setIsRecording(true);
    setVoiceStatus('Mendengarkan... Lepas tombol jika selesai.');
    setRecognizedText('');

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final || interim) {
        setRecognizedText(final || interim);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setIsRecording(false);
        setVoiceStatus('Gagal mengenali suara: ' + event.error);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  const stopHoldingRecord = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
    setVoiceStatus('Perekaman selesai. Tinjau hasil terjemahan suara.');
  };

  const handleApplyVoiceData = () => {
    const text = recognizedText.trim();
    if (!text) return;

    let detectedStatus = 'Applied';
    const lower = text.toLowerCase();
    if (lower.includes('interview') || lower.includes('wawancara')) detectedStatus = 'Interview';
    else if (lower.includes('screening') || lower.includes('seleksi')) detectedStatus = 'Screening';
    else if (lower.includes('diterima') || lower.includes('accepted')) detectedStatus = 'Accepted';
    else if (lower.includes('offering') || lower.includes('penawaran')) detectedStatus = 'Offering';

    let posisiVal = '';
    let companyVal = '';

    if (lower.includes(' di ')) {
      const parts = text.split(/ di /i);
      posisiVal = parts[0].replace(/apply|lamar|sebagai/gi, '').trim();
      companyVal = parts[1] ? parts[1].trim() : '';
    } else {
      posisiVal = text;
      companyVal = 'Perusahaan Target';
    }

    setFormData(prev => ({
      ...prev,
      posisi: posisiVal || prev.posisi,
      perusahaan: companyVal || prev.perusahaan,
      status: detectedStatus
    }));

    setShowVoiceModal(false);
  };

  return (
    <>
      <div style={modalOverlayStyle}>
        <div style={{ ...modalBoxStyle, maxWidth: '440px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <div style={{
                display: 'inline-block',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#D97706',
                fontSize: '10px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: '6px'
              }}>
                Entry Karir
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                Catat Lamaran Kerja
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                Dokumentasikan aplikasi loker baru ke MyJAX
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }}
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#D97706',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Input via suara"
              >
                <FiMic size={13} />
                <span>Suara</span>
              </button>

              <button onClick={onClose} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>
          </div>

          {formError && (
            <div style={{ marginBottom: '14px', padding: '8px 12px', background: '#FEF2F2', borderRadius: '8px', color: '#991B1B', fontSize: '11px', fontWeight: '500' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={formLabelStyle}>Perusahaan *</label>
                <input
                  type="text"
                  name="perusahaan"
                  placeholder="Misal: Pelindo"
                  value={formData.perusahaan}
                  onChange={handleChange}
                  style={{ ...formInputStyle, fontWeight: '700' }}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>Posisi / Role *</label>
                <input
                  type="text"
                  name="posisi"
                  placeholder="Misal: IT Staff"
                  value={formData.posisi}
                  onChange={handleChange}
                  style={{ ...formInputStyle, fontWeight: '700' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={formLabelStyle}>Tanggal Apply *</label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  style={formInputStyle}
                  required
                />
              </div>

              <div>
                <label style={formLabelStyle}>Status Awal</label>
                <select name="status" value={formData.status} onChange={handleChange} style={formInputStyle}>
                  <option value="Applied">Applied (Terkirim)</option>
                  <option value="Screening">Screening (Review CV)</option>
                  <option value="Interview">Interview</option>
                  <option value="Offering">Offering</option>
                  <option value="Accepted">Accepted (Diterima)</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={formLabelStyle}>Tautan Lowongan (Opsional)</label>
              <input
                type="text"
                name="linkLoker"
                placeholder="Contoh: linkedin.com/jobs/..."
                value={formData.linkLoker}
                onChange={handleChange}
                style={formInputStyle}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={formLabelStyle}>Catatan (Opsional)</label>
              <input
                type="text"
                name="catatan"
                placeholder="Contoh: Melalui portal karir perusahaan"
                value={formData.catatan}
                onChange={handleChange}
                style={formInputStyle}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <button type="button" onClick={onClose} style={modalCancelBtnStyle}>
                Batal
              </button>
              <button type="submit" disabled={formSubmitting} style={modalSubmitBtnStyle}>
                {formSubmitting ? <FiLoader className="spin" size={13} /> : <FiCheck size={13} />}
                <span>{formSubmitting ? 'Menyimpan...' : 'Simpan Lamaran'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pop-up Voice Command */}
      {showVoiceModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10000 }}>
          <div style={{ ...modalBoxStyle, maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>
                {isRecording ? 'Mendengarkan...' : 'Perintah Suara'}
              </h3>
              <button onClick={() => { if (isRecording && recognitionRef.current) recognitionRef.current.stop(); setShowVoiceModal(false); }} style={iconCloseBtnStyle}>
                <FiX size={15} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748B' }}>{voiceStatus}</p>

            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                onMouseDown={startHoldingRecord}
                onMouseUp={stopHoldingRecord}
                onTouchStart={startHoldingRecord}
                onTouchEnd={stopHoldingRecord}
                style={{
                  background: isRecording ? '#DC2626' : 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)',
                  color: isRecording ? '#FFFFFF' : '#F59E0B',
                  border: isRecording ? 'none' : '1px solid rgba(245, 158, 11, 0.4)',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  fontFamily: 'Poppins, sans-serif',
                  boxShadow: '0 4px 12px rgba(30, 27, 75, 0.25)'
                }}
              >
                <FiMic size={14} /> {isRecording ? 'Merekam... Lepas jika Selesai' : 'Tahan untuk Bicara'}
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '44px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: '500', color: '#1E293B', fontStyle: recognizedText ? 'normal' : 'italic', textAlign: 'center' }}>
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Lamar Software Engineer di Google"'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRecognizedText('')} style={modalCancelBtnStyle}>
                <FiRotateCcw size={12} /> Reset
              </button>
              <button type="button" onClick={handleApplyVoiceData} disabled={!recognizedText} style={{ ...modalSubmitBtnStyle, opacity: recognizedText ? 1 : 0.6 }}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Berhasil */}
      {showSuccessModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalBoxStyle, maxWidth: '340px', textAlign: 'center', padding: '26px 20px' }}>
            <div style={{ display: 'inline-flex', background: '#DCFCE7', color: '#16A34A', padding: '10px', borderRadius: '50%', marginBottom: '10px' }}>
              <FiCheckCircle size={26} />
            </div>

            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>
              Lamaran Tersimpan
            </h4>
            <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
              Riwayat aplikasi lamaran berhasil dicatat ke spreadsheet.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <img
                src="/image/successjax.png"
                alt="Sukses"
                style={{ maxWidth: '100%', maxHeight: '130px', objectFit: 'contain', borderRadius: '10px' }}
              />
            </div>

            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              style={{ ...modalSubmitBtnStyle, width: '100%', justifyContent: 'center', padding: '9px 16px' }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}

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