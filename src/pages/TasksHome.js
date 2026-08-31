import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_URL } from '../App';
import { 
  FiCheckSquare, 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlus, 
  FiSearch, 
  FiCalendar, 
  FiLoader, 
  FiX, 
  FiClock, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiInbox, 
  FiMic, 
  FiCheck, 
  FiRotateCcw, 
  FiFileText, 
  FiTag, 
  FiFlag,
  FiList
} from 'react-icons/fi';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatDateDisplay = (rawDate) => {
  if (!rawDate) return '-';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export default function TasksHome() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Navigasi Tanggal & Periode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [periodType, setPeriodType] = useState('month');
  
  // State Filter & Search Tabel
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // --- State Modal Pop-up Tambah Task ---
  const [showFormModal, setShowFormModal] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Akademik',
    prioritas: 'Sedang',
    status: 'Pending',
    tenggat: new Date().toISOString().split('T')[0],
    catatan: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- State Pop-up Voice Command ---
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tekan dan tahan tombol untuk berbicara.');
  const recognitionRef = useRef(null);

  const fetchTasks = () => {
    setLoading(true);
    fetch(`${API_URL}?sheetName=Tasks`)
      .then(res => res.json())
      .then(resData => {
        let rows = [];
        if (Array.isArray(resData)) {
          rows = resData;
        } else if (resData && Array.isArray(resData.data)) {
          rows = resData.data;
        } else if (resData && Array.isArray(resData.values)) {
          rows = resData.values;
        }

        if (rows.length > 0) {
          const rowText = String(rows[0][2] || rows[0][0] || '').toLowerCase();
          if (rowText.includes('judul') || rowText.includes('task') || rowText.includes('id') || rowText.includes('tugas')) {
            rows = rows.slice(1);
          }
        }

        setTasks(rows.reverse());
        setLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data tugas:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handlePrevPeriod = () => {
    const newDate = new Date(selectedDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(selectedDate);
    if (periodType === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
    setCurrentPage(1);
  };

  // --- Logic Form Input ---
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul.trim()) {
      setFormError('Nama atau judul tugas wajib diisi.');
      return;
    }
    setFormError('');
    setFormSubmitting(true);

    const payload = {
      sheetName: 'Tasks',
      rowData: [
        `TSK-${Date.now()}`,
        formData.tenggat,
        formData.judul,
        formData.kategori,
        formData.prioritas,
        formData.status,
        formData.catatan
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
        setShowFormModal(false);
        setShowSuccessModal(true);
        setFormData({
          judul: '',
          kategori: 'Akademik',
          prioritas: 'Sedang',
          status: 'Pending',
          tenggat: new Date().toISOString().split('T')[0],
          catatan: ''
        });
        fetchTasks();
      } else {
        alert('Gagal menyimpan tugas: ' + result.message);
      }
    } catch (error) {
      alert('Kendala jaringan: ' + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // --- Logic Voice Command ---
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
    const speechText = recognizedText.toLowerCase();
    
    let detectedPriority = formData.prioritas;
    if (speechText.includes('tinggi') || speechText.includes('penting') || speechText.includes('urgent') || speechText.includes('darurat')) {
      detectedPriority = 'Tinggi';
    } else if (speechText.includes('rendah') || speechText.includes('santai')) {
      detectedPriority = 'Rendah';
    } else if (speechText.includes('sedang') || speechText.includes('biasa')) {
      detectedPriority = 'Sedang';
    }

    let detectedCategory = formData.kategori;
    if (speechText.includes('kuliah') || speechText.includes('tugas') || speechText.includes('kampus') || speechText.includes('dosen') || speechText.includes('skripsi')) {
      detectedCategory = 'Akademik';
    } else if (speechText.includes('proyek') || speechText.includes('project') || speechText.includes('kerja') || speechText.includes('koding')) {
      detectedCategory = 'Proyek';
    } else if (speechText.includes('rutin') || speechText.includes('harian') || speechText.includes('bersih')) {
      detectedCategory = 'Rutinitas';
    } else if (speechText.includes('pribadi') || speechText.includes('personal') || speechText.includes('beli')) {
      detectedCategory = 'Personal';
    }

    let cleanJudul = speechText
      .replace(/\b(prioritas|tingkat|penting|urgent|rendah|sedang|kategori|akademik|proyek|personal|rutinitas)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanJudul) {
      cleanJudul = cleanJudul.charAt(0).toUpperCase() + cleanJudul.slice(1);
    } else {
      cleanJudul = 'Tugas Baru dari Suara';
    }

    setFormData(prev => ({
      ...prev,
      judul: cleanJudul,
      kategori: detectedCategory,
      prioritas: detectedPriority
    }));

    setShowVoiceModal(false);
  };

  // --- Filtering & Metrik Calculation ---
  const periodTasks = useMemo(() => {
    return tasks.filter(item => {
      if (!item || !item[1]) return false;
      const tDate = new Date(item[1]);
      if (isNaN(tDate.getTime())) return true;

      if (periodType === 'week') {
        const startOfWeek = new Date(selectedDate);
        startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return tDate >= startOfWeek && tDate <= endOfWeek;
      } else {
        return tDate.getMonth() === selectedDate.getMonth() && tDate.getFullYear() === selectedDate.getFullYear();
      }
    });
  }, [tasks, selectedDate, periodType]);

  const totalCompleted = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'completed').length;
  }, [periodTasks]);

  const totalInProgress = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'in progress').length;
  }, [periodTasks]);

  const totalPending = useMemo(() => {
    return periodTasks.filter(item => String(item[5] || '').toLowerCase() === 'pending').length;
  }, [periodTasks]);

  const totalHighPriority = useMemo(() => {
    return periodTasks.filter(item => String(item[4] || '').toLowerCase() === 'tinggi').length;
  }, [periodTasks]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(tasks.map(item => item[3]).filter(Boolean));
    return Array.from(cats);
  }, [tasks]);

  const filteredTableData = useMemo(() => {
    return periodTasks.filter(item => {
      const title = String(item[2] || '').toLowerCase();
      const cat = String(item[3] || '').toLowerCase();
      const priority = String(item[4] || '').toLowerCase();
      const status = String(item[5] || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchQuery = title.includes(query) || cat.includes(query);
      const matchCat = selectedCategory === 'ALL' || item[3] === selectedCategory;
      const matchStatus = selectedStatus === 'ALL' || status === selectedStatus.toLowerCase();
      const matchPriority = selectedPriority === 'ALL' || priority === selectedPriority.toLowerCase();

      return matchQuery && matchCat && matchStatus && matchPriority;
    });
  }, [periodTasks, searchQuery, selectedCategory, selectedStatus, selectedPriority]);

  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTableData.slice(start, start + itemsPerPage);
  }, [filteredTableData, currentPage]);

  const getPriorityBadge = (priorityName) => {
    const p = String(priorityName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';

    if (p.includes('tinggi')) {
      bg = '#FFE4E6'; text = '#9F1239';
    } else if (p.includes('sedang')) {
      bg = '#FEF3C7'; text = '#92400E';
    } else if (p.includes('rendah')) {
      bg = '#F0FDF4'; text = '#15803D';
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: text, 
        padding: '3px 8px', 
        borderRadius: '6px', 
        fontSize: '11px', 
        fontWeight: '600', 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '4px' 
      }}>
        <FiFlag size={10} />
        {priorityName || 'Normal'}
      </span>
    );
  };

  const getStatusBadge = (statusName) => {
    const s = String(statusName || '').toLowerCase();
    let bg = '#F1F5F9';
    let text = '#475569';
    let label = 'Pending';

    if (s.includes('completed') || s.includes('selesai')) {
      bg = '#D1FAE5'; text = '#065F46'; label = 'Selesai';
    } else if (s.includes('progress') || s.includes('proses')) {
      bg = '#E0F2FE'; text = '#0369A1'; label = 'Berjalan';
    } else {
      bg = '#F1F5F9'; text = '#475569'; label = 'Tertunda';
    }

    return (
      <span style={{ 
        backgroundColor: bg, 
        color: text, 
        padding: '3px 8px', 
        borderRadius: '6px', 
        fontSize: '11px', 
        fontWeight: '600' 
      }}>
        {label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', color: '#1E293B', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* CSS Responsif Khusus TasksHome */}
      <style>{`
        .kpi-grid-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .filter-controls-container {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }

        .filter-dropdowns-row-tasks {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          width: 100%;
        }

        @media (max-width: 480px) {
          .filter-dropdowns-row-tasks {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 641px) {
          .kpi-grid-container {
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
          }
          .filter-controls-container {
            flex-direction: row;
            align-items: center;
            justify-content: flex-end;
            width: auto;
          }
          .filter-dropdowns-row-tasks {
            display: flex;
            width: auto;
          }
        }
      `}</style>

      {/* Header Utama */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <div style={{ background: '#F1F5F9', color: '#334155', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <FiCheckSquare size={20} />
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
              Task & Agenda Hub
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
            Kelola target pengerjaan, prioritas agenda, dan produktivitas harian.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', maxWidth: '200px' }}>
          <button 
            onClick={() => { setFormError(''); setShowFormModal(true); }}
            style={{
              width: '100%',
              background: '#0F172A', 
              color: '#FFFFFF', 
              border: 'none',
              padding: '9px 16px', 
              borderRadius: '12px', 
              fontSize: '12px', 
              fontWeight: '600',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)'
            }}
          >
            <FiPlus size={15} />
            <span>Tambah Tugas</span>
          </button>
        </div>
      </div>

      {/* Bar Navigasi Tanggal */}
      <div style={{
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px',
        padding: '10px 14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button onClick={handlePrevPeriod} style={navIconBtnStyle} title="Periode Sebelumnya">
            <FiChevronLeft size={16} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 6px', fontWeight: '600', fontSize: '12px', color: '#0F172A' }}>
            <FiCalendar size={14} color="#64748B" />
            <span>
              {periodType === 'month' 
                ? `${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                : `Mgg ${Math.ceil(selectedDate.getDate() / 7)}, ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              }
            </span>
          </div>

          <button onClick={handleNextPeriod} style={navIconBtnStyle} title="Periode Berikutnya">
            <FiChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
            <button 
              onClick={() => { setPeriodType('month'); setCurrentPage(1); }}
              style={periodType === 'month' ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              Bulanan
            </button>
            <button 
              onClick={() => { setPeriodType('week'); setCurrentPage(1); }}
              style={periodType === 'week' ? activeTabBtnStyle : inactiveTabBtnStyle}
            >
              Mingguan
            </button>
          </div>
        </div>
      </div>

      {/* 4 Kartu Metrik KPI (2x2 di Mobile) */}
      <div className="kpi-grid-container">
        
        {/* Card 1: Total Agenda */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={metricLabelStyle}>Total Agenda</span>
              <div style={metricValueStyle}>
                {periodTasks.length} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Tugas</span>
              </div>
            </div>
            <div style={{ background: '#F1F5F9', color: '#334155', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiList size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#64748B', fontWeight: '500' }}>
            Periode aktif terpilih
          </div>
        </div>

        {/* Card 2: Tugas Selesai */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#065F46' }}>Selesai</span>
              <div style={metricValueStyle}>
                {totalCompleted} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Tugas</span>
              </div>
            </div>
            <div style={{ background: '#D1FAE5', color: '#059669', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiCheckCircle size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#064E3B', fontWeight: '500' }}>
            {periodTasks.length > 0 ? Math.round((totalCompleted / periodTasks.length) * 100) : 0}% penyelesaian
          </div>
        </div>

        {/* Card 3: Sedang Berjalan */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #0284C7' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#0369A1' }}>Berjalan</span>
              <div style={metricValueStyle}>
                {totalInProgress} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Aktif</span>
              </div>
            </div>
            <div style={{ background: '#E0F2FE', color: '#0284C7', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiClock size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#075985', fontWeight: '500' }}>
            {totalPending} antrean pending
          </div>
        </div>

        {/* Card 4: Prioritas Tinggi */}
        <div style={{ ...metricCardBase, borderLeft: '4px solid #E11D48' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ ...metricLabelStyle, color: '#9F1239' }}>Urgen</span>
              <div style={metricValueStyle}>
                {totalHighPriority} <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748B' }}>Tinggi</span>
              </div>
            </div>
            <div style={{ background: '#FFE4E6', color: '#E11D48', padding: '7px', borderRadius: '10px', display: 'flex' }}>
              <FiAlertCircle size={15} />
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '10px', color: '#881337', fontWeight: '500' }}>
            Perlu atensi segera
          </div>
        </div>

      </div>

      {/* Kontainer Daftar Tugas & Filter */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '18px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        
        {/* Header Seksi & Kontrol Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
              Daftar Tugas & Agenda
            </h2>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Rekapitulasi target tugas pada rentang waktu terpilih.
            </span>
          </div>

          {/* Form Filter Responsif (Full-width di HP) */}
          <div className="filter-controls-container">
            {/* Search Bar Input */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
              <FiSearch size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px' }} />
              <input 
                type="text" 
                placeholder="Cari agenda..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px', 
                  borderRadius: '10px', 
                  border: '1px solid #E2E8F0',
                  fontSize: '12px', 
                  outline: 'none', 
                  background: '#F8FAFC', 
                  color: '#0F172A',
                  fontFamily: 'Poppins, sans-serif',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Dropdown Kategori, Status & Prioritas (3 Kolom Responsif) */}
            <div className="filter-dropdowns-row-tasks">
              <select 
                value={selectedCategory} 
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                style={filterSelectResponsiveStyle}
              >
                <option value="ALL">Semua Kategori</option>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>

              <select 
                value={selectedStatus} 
                onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                style={filterSelectResponsiveStyle}
              >
                <option value="ALL">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select 
                value={selectedPriority} 
                onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                style={filterSelectResponsiveStyle}
              >
                <option value="ALL">Semua Prioritas</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Konten Data (Card View di HP & Tabel di Desktop) */}
        {loading ? (
          <div style={{ padding: '50px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '12px' }}>
            <FiLoader className="spin" size={16} />
            <span>Memuat agenda...</span>
          </div>
        ) : filteredTableData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
            <FiInbox size={26} style={{ display: 'block', margin: '0 auto 8px auto', color: '#94A3B8' }} />
            Tidak ada agenda tugas yang cocok dengan filter pada periode ini.
          </div>
        ) : (
          <>
            {/* 1. TAMPILAN MOBILE: KARTU LIST RINGKAS */}
            <div className="mobile-cards-view">
              {paginatedData.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0F172A', lineHeight: '1.3' }}>
                        {item[2] || 'Tanpa Judul'}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                        Tenggat: <strong>{formatDateDisplay(item[1])}</strong>
                      </span>
                    </div>
                    {getStatusBadge(item[5])}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600' }}>
                      {item[3] || 'Umum'}
                    </span>
                    {getPriorityBadge(item[4])}
                  </div>

                  {item[6] && item[6] !== '-' && (
                    <div style={{ background: '#F8FAFC', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                      {item[6]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 2. TAMPILAN DESKTOP: TABEL STANDAR */}
            <div className="desktop-table-view" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Tenggat</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Nama Tugas</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Kategori</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Prioritas</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: '600' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #F8FAFC' }}>
                      <td style={{ padding: '12px 14px', color: '#64748B', whiteSpace: 'nowrap', fontWeight: '500' }}>
                        {formatDateDisplay(item[1])}
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0F172A' }}>
                        {item[2] || 'Tanpa Judul'}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '500' }}>
                          {item[3] || 'Umum'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getPriorityBadge(item[4])}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {getStatusBadge(item[5])}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748B', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item[6] || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B', flexWrap: 'wrap', gap: '8px' }}>
          <span>
            {filteredTableData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–{Math.min(currentPage * itemsPerPage, filteredTableData.length)} dari {filteredTableData.length} baris
          </span>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={paginationBtnStyle}
            >
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num}
                onClick={() => setCurrentPage(num)}
                style={{
                  ...paginationBtnStyle,
                  background: currentPage === num ? '#0F172A' : '#FFFFFF',
                  color: currentPage === num ? '#FFFFFF' : '#475569',
                  border: currentPage === num ? '1px solid #0F172A' : '1px solid #E2E8F0'
                }}
              >
                {num}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={paginationBtnStyle}
            >
              Selanjutnya
            </button>
          </div>
        </div>

      </div>

      {/* --- POP-UP MODAL FORM TAMBAH TASK --- */}
      {showFormModal && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalBoxStyle, maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
                  Tambah Agenda Tugas
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Catat target pengerjaan atau gunakan perintah suara.</span>
              </div>
              <button onClick={() => setShowFormModal(false)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>

            {/* Quick Action Perintah Suara */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button type="button" onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }} style={toolActionBtnStyle}>
                <div style={{ background: '#F1F5F9', color: '#334155', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <FiMic size={14} />
                </div>
                <span>Input Cepat Lewat Suara</span>
              </button>
            </div>

            {formError && (
              <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#991B1B', fontSize: '12px', fontWeight: '500' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={formLabelStyle}>Nama Tugas / Agenda *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiCheckSquare size={14} /></span>
                  <input 
                    type="text" 
                    name="judul" 
                    placeholder="Contoh: Menyelesaikan Analisis Data Bab 4" 
                    value={formData.judul} 
                    onChange={handleFormChange} 
                    style={{ ...formInputStyle, paddingLeft: '34px', fontWeight: '600' }} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={formLabelStyle}>Kategori</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiTag size={14} /></span>
                    <select name="kategori" value={formData.kategori} onChange={handleFormChange} style={{ ...formInputStyle, paddingLeft: '34px' }}>
                      <option value="Akademik">Akademik</option>
                      <option value="Proyek">Proyek</option>
                      <option value="Personal">Personal</option>
                      <option value="Rutinitas">Rutinitas</option>
                      <option value="Urgen">Urgen</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={formLabelStyle}>Tenggat Waktu *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiCalendar size={14} /></span>
                    <input 
                      type="date" 
                      name="tenggat" 
                      value={formData.tenggat} 
                      onChange={handleFormChange} 
                      style={{ ...formInputStyle, paddingLeft: '34px' }} 
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={formLabelStyle}>Tingkat Prioritas</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFlag size={14} /></span>
                    <select name="prioritas" value={formData.prioritas} onChange={handleFormChange} style={{ ...formInputStyle, paddingLeft: '34px' }}>
                      <option value="Tinggi">Tinggi</option>
                      <option value="Sedang">Sedang</option>
                      <option value="Rendah">Rendah</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={formLabelStyle}>Status Pengerjaan</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiClock size={14} /></span>
                    <select name="status" value={formData.status} onChange={handleFormChange} style={{ ...formInputStyle, paddingLeft: '34px' }}>
                      <option value="Pending">Pending (Tertunda)</option>
                      <option value="In Progress">In Progress (Berjalan)</option>
                      <option value="Completed">Completed (Selesai)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={formLabelStyle}>Catatan / Rincian Tambahan</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFileText size={14} /></span>
                  <input 
                    type="text" 
                    name="catatan" 
                    placeholder="Contoh: Perlu koordinasi dengan dosen/tim" 
                    value={formData.catatan} 
                    onChange={handleFormChange} 
                    style={{ ...formInputStyle, paddingLeft: '34px' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <button type="button" onClick={() => setShowFormModal(false)} style={modalCancelBtnStyle}>
                  Batal
                </button>
                <button type="submit" disabled={formSubmitting} style={modalSubmitBtnStyle}>
                  {formSubmitting ? <FiLoader className="spin" size={14} /> : <FiCheck size={14} />}
                  <span>{formSubmitting ? 'Menyimpan...' : 'Simpan Tugas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL VOICE COMMAND --- */}
      {showVoiceModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalBoxStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                {isRecording ? 'Mendengarkan...' : 'Perintah Suara'}
              </h3>
              <button onClick={() => { if (isRecording && recognitionRef.current) recognitionRef.current.stop(); setShowVoiceModal(false); }} style={iconCloseBtnStyle}>
                <FiX size={16} />
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
                  background: isRecording ? '#DC2626' : '#0F172A', 
                  color: '#FFFFFF', border: 'none', padding: '12px 22px', 
                  borderRadius: '12px', fontSize: '13px', fontWeight: '600', 
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                  userSelect: 'none', WebkitUserSelect: 'none', fontFamily: 'Poppins, sans-serif'
                }}
              >
                <FiMic size={15} /> {isRecording ? 'Merekam... Lepas jika Selesai' : 'Tahan untuk Bicara'}
              </button>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', minHeight: '50px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '500', color: '#0F172A', fontStyle: recognizedText ? 'normal' : 'italic', textAlign: 'center' }}>
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Kerjakan laporan magang prioritas tinggi kategori akademik"'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setRecognizedText('')} style={modalCancelBtnStyle}>
                <FiRotateCcw size={13} /> Reset
              </button>
              <button type="button" onClick={handleApplyVoiceData} disabled={!recognizedText} style={{ ...modalSubmitBtnStyle, opacity: recognizedText ? 1 : 0.6 }}>
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- POP-UP MODAL BERHASIL --- */}
      {showSuccessModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10002 }}>
          <div style={{ ...modalBoxStyle, maxWidth: '340px', textAlign: 'center', padding: '26px 22px' }}>
            <div style={{ display: 'inline-flex', background: '#DCFCE7', color: '#16A34A', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
              <FiCheckCircle size={28} />
            </div>
            
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
              Agenda Tersimpan
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Tugas berhasil dicatat ke Google Sheets dan ringkasan metrik telah diperbarui.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                src="/image/successjax.png" 
                alt="Sukses" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '140px', 
                  objectFit: 'contain', 
                  borderRadius: '12px' 
                }} 
              />
            </div>

            <button 
              onClick={() => setShowSuccessModal(false)} 
              style={{ ...modalSubmitBtnStyle, width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// --- PENDUKUNG GAYA TAMPILAN MODERN & HUMAN-CENTRIC ---

const metricCardBase = {
  background: '#FFFFFF',
  borderTop: '1px solid #E2E8F0',
  borderRight: '1px solid #E2E8F0',
  borderBottom: '1px solid #E2E8F0',
  padding: '14px 12px',
  borderRadius: '14px',
  boxSizing: 'border-box',
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.02)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const metricLabelStyle = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  display: 'block'
};

const metricValueStyle = {
  fontSize: '15px',
  fontWeight: '700',
  color: '#0F172A',
  marginTop: '4px',
  letterSpacing: '-0.3px'
};

const navIconBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '5px',
  borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569'
};

const activeTabBtnStyle = {
  background: '#FFFFFF', border: 'none', padding: '4px 10px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '700', color: '#0F172A', cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontFamily: 'Poppins, sans-serif'
};

const inactiveTabBtnStyle = {
  background: 'transparent', border: 'none', padding: '4px 10px', borderRadius: '8px',
  fontSize: '11px', fontWeight: '500', color: '#64748B', cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
};

const filterSelectResponsiveStyle = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '10px',
  border: '1px solid #E2E8F0',
  fontSize: '11px',
  color: '#334155',
  background: '#F8FAFC',
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: '600',
  boxSizing: 'border-box'
};

const paginationBtnStyle = {
  padding: '4px 8px', background: '#FFFFFF', border: '1px solid #E2E8F0',
  borderRadius: '8px', fontSize: '11px', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', fontWeight: '500'
};

const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalBoxStyle = {
  background: '#FFFFFF', borderRadius: '18px', padding: '20px',
  width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B'
};

const toolActionBtnStyle = {
  flex: 1, background: '#F8FAFC', border: '1px solid #E2E8F0',
  padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600',
  color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
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
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '4px'
};

const modalSubmitBtnStyle = {
  padding: '8px 16px', background: '#0F172A', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px'
};