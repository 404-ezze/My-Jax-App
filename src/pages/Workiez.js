import React, { useState, useRef } from 'react';
import { API_URL } from '../App';
import { 
  FiX, 
  FiMic, 
  FiCheck, 
  FiCheckCircle, 
  FiRotateCcw, 
  FiCalendar, 
  FiFileText, 
  FiLoader,
  FiBriefcase,
  FiLink,
  FiActivity
} from 'react-icons/fi';

export default function Workiez({ isOpen, onClose, onSuccess }) {
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

    const payload = {
      sheetName: 'Workiez',
      rowData: [
        `WRK-${Date.now()}`,
        formData.tanggal,
        formData.perusahaan,
        formData.posisi,
        formData.linkLoker || '-',
        formData.status,
        formData.catatan || '-'
      ]
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.status === 'success') {
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
      } else {
        alert('Gagal mencatat lamaran: ' + result.message);
      }
    } catch (error) {
      alert('Kendala jaringan: ' + error.message);
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

    if (lower.includes('di ')) {
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
        <div style={{ ...modalBoxStyle, maxWidth: '520px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
                Catat Lamaran Kerja Baru
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Dokumentasikan aplikasi loker untuk memantau status seleksi.</span>
            </div>
            <button onClick={onClose} style={iconCloseBtnStyle}>
              <FiX size={17} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button type="button" onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }} style={toolActionBtnStyle}>
              <FiMic size={14} />
              <span>Input Cepat Lewat Suara</span>
            </button>
          </div>

          {formError && (
            <div style={{ marginBottom: '14px', padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '12px' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={formLabelStyle}>Nama Perusahaan *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiBriefcase size={14} /></span>
                  <input 
                    type="text" 
                    name="perusahaan" 
                    placeholder="Contoh: PT Pelindo" 
                    value={formData.perusahaan} 
                    onChange={handleChange} 
                    style={{ ...formInputStyle, paddingLeft: '34px', fontWeight: '600' }} 
                    required
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Posisi / Role *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFileText size={14} /></span>
                  <input 
                    type="text" 
                    name="posisi" 
                    placeholder="Contoh: Frontend Developer" 
                    value={formData.posisi} 
                    onChange={handleChange} 
                    style={{ ...formInputStyle, paddingLeft: '34px', fontWeight: '600' }} 
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={formLabelStyle}>Tanggal Apply *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiCalendar size={14} /></span>
                  <input 
                    type="date" 
                    name="tanggal" 
                    value={formData.tanggal} 
                    onChange={handleChange} 
                    style={{ ...formInputStyle, paddingLeft: '34px' }} 
                    required
                  />
                </div>
              </div>

              <div>
                <label style={formLabelStyle}>Status Awal</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiActivity size={14} /></span>
                  <select name="status" value={formData.status} onChange={handleChange} style={{ ...formInputStyle, paddingLeft: '34px' }}>
                    <option value="Applied">Applied (Terkirim)</option>
                    <option value="Screening">Screening (CV Review)</option>
                    <option value="Interview">Interview</option>
                    <option value="Offering">Offering</option>
                    <option value="Accepted">Accepted (Diterima)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={formLabelStyle}>Link Lowongan Kerja (Opsional)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiLink size={14} /></span>
                <input 
                  type="text" 
                  name="linkLoker" 
                  placeholder="Contoh: linkedin.com/jobs/..." 
                  value={formData.linkLoker} 
                  onChange={handleChange} 
                  style={{ ...formInputStyle, paddingLeft: '34px' }} 
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={formLabelStyle}>Catatan Tambahan</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFileText size={14} /></span>
                <input 
                  type="text" 
                  name="catatan" 
                  placeholder="Contoh: Submit via website resmi karir" 
                  value={formData.catatan} 
                  onChange={handleChange} 
                  style={{ ...formInputStyle, paddingLeft: '34px' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <button type="button" onClick={onClose} style={modalCancelBtnStyle}>
                Batal
              </button>
              <button type="submit" disabled={formSubmitting} style={modalSubmitBtnStyle}>
                {formSubmitting ? <FiLoader className="spin" size={14} /> : <FiCheck size={14} />}
                <span>{formSubmitting ? 'Menyimpan...' : 'Simpan Lamaran'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Pop-up Voice Command */}
      {showVoiceModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10000 }}>
          <div style={modalBoxStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>Perintah Suara Lamaran</h3>
              <button onClick={() => { if (isRecording && recognitionRef.current) recognitionRef.current.stop(); setShowVoiceModal(false); }} style={iconCloseBtnStyle}>
                <FiX size={17} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B' }}>{voiceStatus}</p>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button" 
                onMouseDown={startHoldingRecord}
                onMouseUp={stopHoldingRecord}
                onTouchStart={startHoldingRecord}
                onTouchEnd={stopHoldingRecord}
                style={{ 
                  background: isRecording ? '#DC2626' : '#1E293B', 
                  color: '#FFFFFF', border: 'none', padding: '12px 20px', 
                  borderRadius: '12px', fontSize: '13px', fontWeight: '600', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  userSelect: 'none', WebkitUserSelect: 'none'
                }}
              >
                <FiMic size={16} /> {isRecording ? 'Merekam... Lepas untuk Selesai' : 'Tahan untuk Bicara'}
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '50px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', color: '#0F172A', fontStyle: recognizedText ? 'normal' : 'italic' }}>
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Apply Frontend Dev di Pelindo"'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRecognizedText('')} style={modalCancelBtnStyle}>
                <FiRotateCcw size={13} /> Reset
              </button>
              <button type="button" onClick={handleApplyVoiceData} disabled={!recognizedText} style={{ ...modalSubmitBtnStyle, opacity: recognizedText ? 1 : 0.5 }}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Sukses */}
      {showSuccessModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalBoxStyle, textAlign: 'center', padding: '28px 24px' }}>
            <div style={{ display: 'inline-flex', background: '#DCFCE7', color: '#16A34A', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
              <FiCheckCircle size={28} />
            </div>
            
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
              Lamaran Berhasil Dicatat
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Riwayat lamaran berhasil tersimpan rapi ke spreadsheet.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                src="/image/successjax.png" 
                alt="Sukses" 
                style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '12px' }} 
              />
            </div>

            <button 
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }} 
              style={{ ...modalSubmitBtnStyle, width: '100%', justifyContent: 'center' }}
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
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF', borderRadius: '18px', padding: '22px',
  width: '100%', maxWidth: '390px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B'
};

const toolActionBtnStyle = {
  flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0',
  padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: '500',
  color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
};

const formLabelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const formInputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: '10px',
  border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', color: '#0F172A'
};

const modalCancelBtnStyle = {
  padding: '8px 14px', background: '#F1F5F9', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px', background: '#0F172A', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px'
};