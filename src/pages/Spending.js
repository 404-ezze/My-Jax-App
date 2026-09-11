import React, { useState, useRef } from 'react';
import { API_URL } from '../App';
import { 
  FiLoader, 
  FiCheckCircle, 
  FiX, 
  FiCamera, 
  FiImage, 
  FiMic, 
  FiCheck, 
  FiCalendar, 
  FiFileText, 
  FiTag, 
  FiCreditCard, 
  FiRotateCcw,
  FiAlertCircle
} from 'react-icons/fi';
import { createWorker } from 'tesseract.js';

// --- PRA-PEMROSESAN GAMBAR (PEMBERSIHAN BAYANGAN & PENAJAMAN TEKS STRUK) ---
const optimizeReceiptCanvas = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;
        const maxLimit = 1600;

        if (width > maxLimit || height > maxLimit) {
          if (width > height) {
            height = Math.round((height * maxLimit) / width);
            width = maxLimit;
          } else {
            width = Math.round((width * maxLimit) / height);
            height = maxLimit;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Grayscale alami dengan peregangan kontras linier
        const imgData = ctx.getImageData(0, 0, width, height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          const factor = 1.25;
          const adjusted = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
          d[i] = adjusted;
          d[i + 1] = adjusted;
          d[i + 2] = adjusted;
        }
        ctx.putImageData(imgData, 0, 0);

        canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.95);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
};

export default function Spending({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    tipe: 'Expense',
    kategori: 'Kebutuhan Pokok',
    item: '',
    nominal: '',
    sumberDana: 'BCA',
    tanggal: new Date().toISOString().split('T')[0]
  });
  
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // State Voice Command
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tekan dan tahan tombol untuk berbicara.');
  const recognitionRef = useRef(null);

  // State Scan Struk OCR
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('Mempersiapkan pemindaian gambar...');
  const [isInvalidReceipt, setIsInvalidReceipt] = useState(false);
  const [extractedNominal, setExtractedNominal] = useState('');
  const [extractedCategory, setExtractedCategory] = useState('');
  const [extractedMerchant, setExtractedMerchant] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC OCR STRUK CERDAS ---
  const handleScanReceipt = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    setShowOcrModal(true);
    setOcrLoading(true);
    setIsInvalidReceipt(false);
    setOcrStatus('Menganalisis rincian transaksi...');
    setExtractedNominal('');
    setExtractedMerchant('');

    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(file);
      const rawText = ret.data.text || '';
      await worker.terminate();

      const textLower = rawText.toLowerCase();

      // 1. Validasi Keabsahan Struk / Dokumen Transaksi
      const receiptKeywords = [
        'total', 'subtotal', 'bayar', 'tagihan', 'rp', 'idr', 'qris', 
        'transaksi', 'kasir', 'struk', 'nota', 'kembali', 'tunai', 
        'gopay', 'shopeepay', 'shopee', 'bca', 'dana', 'seabank', 'jago',
        'berhasil', 'sukses', 'transfer', 'rekening', 'pembayaran'
      ];
      const isReceipt = receiptKeywords.some(kw => textLower.includes(kw));

      if (rawText.trim().length < 8 || !isReceipt) {
        setIsInvalidReceipt(true);
        setOcrStatus('Gambar yang Anda upload tidak terdeteksi sebagai struk atau bill transaksi. Silakan upload kembali foto struk pembayaran yang jelas.');
        setOcrLoading(false);
        return;
      }

      // 2. Parser Nilai Angka Rupiah Presisi
      const extractCleanNumber = (str) => {
        if (!str) return null;
        let s = str.trim();

        if (s.includes(':') || s.includes('/') || s.includes('-202')) return null;

        if (s.endsWith(',00') || s.endsWith('.00')) {
          s = s.slice(0, -3);
        } else if (s.endsWith(',0') || s.endsWith('.0')) {
          s = s.slice(0, -2);
        }

        if (s.includes('.') && s.includes(',')) {
          if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
            s = s.substring(0, s.lastIndexOf(','));
          }
        }

        const clean = s.replace(/[^\d]/g, '');
        const val = parseInt(clean, 10);

        if (isNaN(val)) return null;

        const currentYear = new Date().getFullYear();
        if (val >= 2020 && val <= currentYear + 4) return null;

        if (clean.length === 10 && !str.includes('.') && !str.includes(',')) return null;

        if (val < 500 || val > 100000000) return null;

        return val;
      };

      const rawLines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
      let detectedNominalVal = null;

      const isDigitalReceipt = textLower.includes('bca') || 
                               textLower.includes('shopee') || 
                               textLower.includes('transfer') || 
                               textLower.includes('berhasil') || 
                               textLower.includes('sukses');

      // PRIORITAS 1: Cari pola "Rp"
      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const lineLow = line.toLowerCase();

        if (lineLow.includes('kembali') || lineLow.includes('change') || lineLow.includes('diskon')) {
          continue;
        }

        const sameLineMatch = line.match(/(?:rp\.?|idr)\s*([0-9.,]+)/i);
        if (sameLineMatch && sameLineMatch[1]) {
          const parsed = extractCleanNumber(sameLineMatch[1]);
          if (parsed) {
            detectedNominalVal = parsed;
            if (isDigitalReceipt) break;
          }
        }

        if (!detectedNominalVal && (line.trim().toLowerCase() === 'rp' || line.trim().toLowerCase() === 'rp.' || line.trim().toLowerCase() === 'idr')) {
          if (rawLines[i + 1]) {
            const nextMatch = rawLines[i + 1].match(/([0-9.,]+)/);
            if (nextMatch) {
              const parsedNext = extractCleanNumber(nextMatch[1]);
              if (parsedNext) {
                detectedNominalVal = parsedNext;
                if (isDigitalReceipt) break;
              }
            }
          }
        }
      }

      // PRIORITAS 2: Kata kunci Total / Tagihan
      if (!detectedNominalVal) {
        const totalKeywords = [
          'total bayar', 'total tagihan', 'total akhir', 'grand total', 
          'jumlah transfer', 'nominal transfer', 'total belanja', 'total'
        ];

        for (let i = 0; i < rawLines.length; i++) {
          const lineLow = rawLines[i].toLowerCase();
          if (lineLow.includes('kembali') || lineLow.includes('diskon')) continue;

          for (let kw of totalKeywords) {
            if (lineLow.includes(kw)) {
              const numMatch = rawLines[i].match(/([0-9.,]+)/g);
              if (numMatch) {
                for (let part of numMatch) {
                  const p = extractCleanNumber(part);
                  if (p) { detectedNominalVal = p; break; }
                }
              }
              if (!detectedNominalVal && rawLines[i + 1]) {
                const nextMatch = rawLines[i + 1].match(/([0-9.,]+)/g);
                if (nextMatch) {
                  for (let part of nextMatch) {
                    const p = extractCleanNumber(part);
                    if (p) { detectedNominalVal = p; break; }
                  }
                }
              }
            }
            if (detectedNominalVal) break;
          }
          if (detectedNominalVal) break;
        }
      }

      // PRIORITAS 3: Fallback kandidat angka
      if (!detectedNominalVal) {
        const candidates = [];
        for (let line of rawLines) {
          if (line.includes(':') || line.includes('/')) continue;
          const parts = line.match(/([0-9.,]+)/g);
          if (parts) {
            for (let part of parts) {
              const val = extractCleanNumber(part);
              if (val) candidates.push(val);
            }
          }
        }
        if (candidates.length > 0) {
          detectedNominalVal = isDigitalReceipt ? candidates[0] : Math.max(...candidates);
        }
      }

      // Ekstraksi Nama Toko
      let merchant = '';
      if (textLower.includes('shopee')) {
        merchant = 'ShopeePay / Belanja Shopee';
      } else if (textLower.includes('bca')) {
        merchant = 'Transfer / Pembayaran BCA';
      } else {
        for (let i = 0; i < Math.min(rawLines.length, 4); i++) {
          const clean = rawLines[i].replace(/[^a-zA-Z0-9\s]/g, '').trim();
          if (clean.length > 3 && !clean.toLowerCase().includes('struk') && !clean.toLowerCase().includes('selamat')) {
            merchant = clean;
            break;
          }
        }
      }

      // Deteksi Kategori
      let detectedCategory = 'Kebutuhan Pokok';
      if (textLower.includes('shopee') || textLower.includes('tokopedia') || textLower.includes('cafe') || textLower.includes('kopi') || textLower.includes('resto') || textLower.includes('makan') || textLower.includes('gofood')) {
        detectedCategory = 'Jajan & Hiburan';
      } else if (textLower.includes('spbu') || textLower.includes('bensin') || textLower.includes('goride') || textLower.includes('grab')) {
        detectedCategory = 'Transportasi';
      } else if (textLower.includes('listrik') || textLower.includes('pln') || textLower.includes('pulsa') || textLower.includes('wifi') || textLower.includes('kost')) {
        detectedCategory = 'Kost & Tagihan';
      }

      // Deteksi Sumber Dana Otomatis
      let detectedDana = formData.sumberDana;
      if (textLower.includes('shopee') || textLower.includes('shopeepay')) detectedDana = 'ShopeePay';
      else if (textLower.includes('bca')) detectedDana = 'BCA';
      else if (textLower.includes('gopay')) detectedDana = 'Gopay';
      else if (textLower.includes('bni')) detectedDana = 'BNI';
      else if (textLower.includes('jago')) detectedDana = 'Jago';
      else if (textLower.includes('dana')) detectedDana = 'Dana';
      else if (textLower.includes('seabank')) detectedDana = 'SeaBank';
      else if (textLower.includes('tunai') || textLower.includes('cash')) detectedDana = 'Cash';

      setExtractedNominal(detectedNominalVal ? String(detectedNominalVal) : '');
      setExtractedCategory(detectedCategory);
      setExtractedMerchant(merchant || 'Belanja Struk');
      setFormData(prev => ({ ...prev, sumberDana: detectedDana }));

      setOcrStatus(detectedNominalVal 
        ? 'Struk berhasil dibaca! Silakan periksa kembali nominal di bawah.' 
        : 'Struk terdeteksi, namun nominal kurang jelas. Anda bisa memasukkan nominalnya langsung di bawah.'
      );
    } catch (err) {
      setIsInvalidReceipt(true);
      setOcrStatus('Gagal membaca struk. Pastikan gambar tidak buram dan teks terlihat jelas.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApplyOcrData = () => {
    setFormData(prev => ({
      ...prev,
      kategori: extractedCategory || prev.kategori,
      item: extractedMerchant || prev.item || 'Belanja Struk',
      nominal: extractedNominal || prev.nominal
    }));
    setShowOcrModal(false);
  };

  // --- LOGIC PERINTAH SUARA ---
  const handleApplyVoiceData = () => {
    const speechText = recognizedText.toLowerCase();
    const digits = speechText.match(/\d+/g);
    let parsedNominal = '';

    if (digits) {
      parsedNominal = digits.join('');
      if (speechText.includes('ribu') && parsedNominal < 1000) {
        parsedNominal = parsedNominal * 1000;
      } else if (speechText.includes('juta') && parsedNominal < 1000000) {
        parsedNominal = parsedNominal * 1000000;
      }
    }

    let cleanItemText = speechText
      .replace(/\b\d+\b/g, '') 
      .replace(/\b(ribu|juta|ratus|rp|harga|biaya)\b/g, '') 
      .replace(/\b(pakai|menggunakan|dengan|lewat)\s+(bca|gopay|shopeepay|shopee|jago|bni|line|dana|seabank|tunai|cash|debit)\b/g, '')
      .replace(/\s+/g, ' ') 
      .trim();

    if (cleanItemText) {
      cleanItemText = cleanItemText.charAt(0).toUpperCase() + cleanItemText.slice(1);
    } else {
      cleanItemText = 'Catatan Suara';
    }

    let detectedCategory = formData.kategori;
    if (speechText.includes('makan') || speechText.includes('kopi') || speechText.includes('jajan') || speechText.includes('nonton')) {
      detectedCategory = 'Jajan & Hiburan';
    } else if (speechText.includes('bensin') || speechText.includes('transport') || speechText.includes('ojek')) {
      detectedCategory = 'Transportasi';
    } else if (speechText.includes('kos') || speechText.includes('tagihan') || speechText.includes('listrik')) {
      detectedCategory = 'Kost & Tagihan';
    }

    let detectedSumberDana = formData.sumberDana;
    if (speechText.includes('gopay')) detectedSumberDana = 'Gopay';
    else if (speechText.includes('shopeepay') || speechText.includes('shopee pay')) detectedSumberDana = 'ShopeePay';
    else if (speechText.includes('jago') || speechText.includes('bank jago')) detectedSumberDana = 'Jago';
    else if (speechText.includes('bni')) detectedSumberDana = 'BNI';
    else if (speechText.includes('line bank') || speechText.includes('line')) detectedSumberDana = 'Line Bank';
    else if (speechText.includes('dana')) detectedSumberDana = 'Dana';
    else if (speechText.includes('seabank')) detectedSumberDana = 'SeaBank';
    else if (speechText.includes('bca')) detectedSumberDana = 'BCA';
    else if (speechText.includes('tunai') || speechText.includes('cash')) detectedSumberDana = 'Cash';

    setFormData(prev => ({
      ...prev,
      kategori: detectedCategory,
      sumberDana: detectedSumberDana,
      item: cleanItemText, 
      nominal: parsedNominal || prev.nominal
    }));

    setShowVoiceModal(false);
  };

  const startHoldingRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung perekaman suara.');
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
    setVoiceStatus('Mendengarkan... Lepas jika selesai.');
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
        setVoiceStatus('Perekaman terhenti: ' + event.error);
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
    setVoiceStatus('Selesai merekam. Periksa hasil teks.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.nominal) {
      setErrorMessage('Keterangan dan nominal transaksi wajib diisi.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const payload = {
      sheetName: 'Spending',
      rowData: [
        `SPND-${Date.now()}`,
        formData.tanggal,
        formData.tipe,
        formData.kategori,
        formData.item,
        Number(formData.nominal),
        formData.sumberDana
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
        setShowModal(true);
        setFormData({ 
          tipe: 'Expense', 
          kategori: 'Kebutuhan Pokok', 
          item: '', 
          nominal: '', 
          sumberDana: 'BCA', 
          tanggal: new Date().toISOString().split('T')[0] 
        });
        setPreviewImage(null);
        if (onSuccess) onSuccess();
      } else {
        alert('Gagal menyimpan: ' + result.message);
      }
    } catch (error) {
      alert('Kendala jaringan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal Overlay Form Utama */}
      <div style={modalOverlayStyle}>
        <div style={{ ...modalCardStyle, maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto' }}>
          
          {/* Header Form Pop-up */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
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
                Entry Transaksi
              </div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#1E1B4B', letterSpacing: '-0.3px' }}>
                Catat Transaksi
              </h3>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                Sinkronisasi otomatis ke database Google Sheets MyJAX.
              </span>
            </div>
            <button onClick={onClose} style={iconCloseBtnStyle}>
              <FiX size={16} />
            </button>
          </div>

          {/* Quick Actions (Kamera, Galeri, dan Suara) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            
            {/* 1. Ambil Foto Langsung */}
            <label htmlFor="receipt-camera" style={quickActionCardStyle}>
              <div style={{ background: 'rgba(46, 49, 146, 0.08)', color: '#2E3192', padding: '7px', borderRadius: '8px', display: 'flex' }}>
                <FiCamera size={14} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#334155' }}>Foto Struk</span>
            </label>
            <input 
              id="receipt-camera" 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleScanReceipt} 
              style={{ display: 'none' }} 
            />

            {/* 2. Ambil dari Galeri HP */}
            <label htmlFor="receipt-gallery" style={quickActionCardStyle}>
              <div style={{ background: 'rgba(46, 49, 146, 0.08)', color: '#2E3192', padding: '7px', borderRadius: '8px', display: 'flex' }}>
                <FiImage size={14} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#334155' }}>Dari Galeri</span>
            </label>
            <input 
              id="receipt-gallery" 
              type="file" 
              accept="image/*" 
              onChange={handleScanReceipt} 
              style={{ display: 'none' }} 
            />

            {/* 3. Input Perintah Suara */}
            <button type="button" onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }} style={quickActionCardStyle}>
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', padding: '7px', borderRadius: '8px', display: 'flex' }}>
                <FiMic size={14} />
              </div>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#334155' }}>Suara</span>
            </button>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: '14px', padding: '9px 12px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#991B1B', fontSize: '11px', fontWeight: '500' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Pilihan: Pengeluaran / Pemasukan */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Expense' })}
                  style={formData.tipe === 'Expense' ? activeTabPillStyle : inactiveTabPillStyle}
                >
                  Belanja / Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Income' })}
                  style={formData.tipe === 'Income' ? activeTabPillStyle : inactiveTabPillStyle}
                >
                  Dana Masuk / Kiriman
                </button>
              </div>
            </div>

            {/* Input Nominal & Tanggal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={fieldLabelStyle}>Nominal (Rp) *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontSize: '12px', fontWeight: '600', color: '#2E3192' }}>Rp</span>
                  <input 
                    type="number" 
                    name="nominal" 
                    placeholder="0" 
                    value={formData.nominal} 
                    onChange={handleChange} 
                    style={{ ...fieldInputStyle, paddingLeft: '34px', fontWeight: '600', fontSize: '13px' }} 
                    required
                  />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Tanggal *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiCalendar size={13} /></span>
                  <input 
                    type="date" 
                    name="tanggal" 
                    value={formData.tanggal} 
                    onChange={handleChange} 
                    style={{ ...fieldInputStyle, paddingLeft: '30px' }} 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: '12px' }}>
              <label style={fieldLabelStyle}>Kategori Transaksi *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiTag size={13} /></span>
                <select name="kategori" value={formData.kategori} onChange={handleChange} style={{ ...fieldInputStyle, paddingLeft: '30px' }}>
                  <option value="Kebutuhan Pokok">Kebutuhan Pokok (Makan / Harian)</option>
                  <option value="Jajan & Hiburan">Jajan & Hiburan (Kopi / Hangout)</option>
                  <option value="Kost & Tagihan">Kost & Tagihan (Listrik / Wifi / Kamar)</option>
                  <option value="Transportasi">Transportasi (Bensin / Ojek)</option>
                  <option value="Edukasi & Karier">Edukasi & Karier (Buku / Kursus)</option>
                  <option value="Darurat & Kesehatan">Darurat & Kesehatan</option>
                  <option value="Pemasukan">Dana Masuk / Kiriman</option>
                </select>
              </div>
            </div>

            {/* Keterangan Item */}
            <div style={{ marginBottom: '12px' }}>
              <label style={fieldLabelStyle}>Keterangan *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiFileText size={13} /></span>
                <input 
                  type="text" 
                  name="item" 
                  placeholder="Contoh: Nasi padang / Kopi santai" 
                  value={formData.item} 
                  onChange={handleChange} 
                  style={{ ...fieldInputStyle, paddingLeft: '30px' }} 
                  required
                />
              </div>
            </div>

            {/* Sumber Dana */}
            <div style={{ marginBottom: '16px' }}>
              <label style={fieldLabelStyle}>Metode / Rekening</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '10px', color: '#64748B', display: 'flex' }}><FiCreditCard size={13} /></span>
                <select name="sumberDana" value={formData.sumberDana} onChange={handleChange} style={{ ...fieldInputStyle, paddingLeft: '30px' }}>
                  <option value="Gopay">Gopay</option>
                  <option value="ShopeePay">ShopeePay</option>
                  <option value="Jago">Bank Jago</option>
                  <option value="BNI">BNI</option>
                  <option value="Line Bank">Line Bank</option>
                  <option value="Dana">Dana</option>
                  <option value="SeaBank">SeaBank</option>
                  <option value="BCA">BCA</option>
                  <option value="Cash">Cash (Tunai)</option>
                </select>
              </div>
            </div>

            {previewImage && (
              <div style={{ marginBottom: '14px', padding: '8px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={previewImage} alt="Struk" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                <span style={{ fontSize: '11px', color: '#334155', fontWeight: '500' }}>Lampiran struk terunggah.</span>
              </div>
            )}

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <button type="button" onClick={onClose} style={modalCancelBtnStyle}>
                Batal
              </button>
              <button type="submit" disabled={loading} style={modalSubmitBtnStyle}>
                {loading ? <FiLoader className="spin" size={13} /> : <FiCheck size={13} />}
                <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* --- POP-UP MODAL OCR STRUK & VALIDASI --- */}
      {showOcrModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalCardStyle, maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>
                {isInvalidReceipt ? 'Bukan Struk/Bill' : 'Pemindaian Struk'}
              </h3>
              <button onClick={() => setShowOcrModal(false)} style={iconCloseBtnStyle}>
                <FiX size={15} />
              </button>
            </div>
            
            {ocrLoading ? (
              <div style={{ padding: '26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <FiLoader className="spin" size={26} color="#F59E0B" />
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>Menganalisis teks & nominal struk...</span>
              </div>
            ) : isInvalidReceipt ? (
              /* Tampilan Jika Gambar Bukan Struk */
              <div style={{ padding: '8px 0 12px 0' }}>
                <div style={{ display: 'inline-flex', background: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
                  <FiAlertCircle size={26} />
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.45', padding: '0 8px' }}>
                  {ocrStatus}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => setShowOcrModal(false)} style={{ ...modalSubmitBtnStyle, padding: '8px 24px' }}>
                    Upload Ulang
                  </button>
                </div>
              </div>
            ) : (
              /* Tampilan Jika Struk Berhasil Terbaca */
              <>
                {previewImage && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img src={previewImage} alt="Preview Struk" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                )}
                
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '14px', textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '4px' }}>
                    Nominal Terdeteksi (Dapat Diedit):
                  </div>
                  
                  {/* Input Interaktif Nominal */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', fontWeight: '600', color: '#2E3192' }}>Rp</span>
                    <input 
                      type="number" 
                      value={extractedNominal} 
                      onChange={(e) => setExtractedNominal(e.target.value)} 
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '6px 10px 6px 34px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1E293B',
                        background: '#FFFFFF',
                        outline: 'none',
                        fontFamily: 'Poppins, sans-serif'
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '11px', color: '#334155', fontWeight: '500' }}>
                    Toko: <span style={{ color: '#2E3192', fontWeight: '600' }}>{extractedMerchant}</span> • Kategori: <span style={{ color: '#2E3192', fontWeight: '600' }}>{extractedCategory}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowOcrModal(false)} style={modalCancelBtnStyle}>
                    Ulangi
                  </button>
                  <button onClick={handleApplyOcrData} disabled={!extractedNominal} style={{ ...modalSubmitBtnStyle, opacity: extractedNominal ? 1 : 0.6 }}>
                    Terapkan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Pop-up Modal Perintah Suara */}
      {showVoiceModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalCardStyle, maxWidth: '360px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
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
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Makan siang 25000 bayar gopay"'}
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

      {/* Pop-up Modal Sukses */}
      {showModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10002 }}>
          <div style={{ 
            ...modalCardStyle, 
            maxWidth: '340px', 
            textAlign: 'center', 
            padding: '26px 20px' 
          }}>
            <div style={{ display: 'inline-flex', background: '#DCFCE7', color: '#16A34A', padding: '10px', borderRadius: '50%', marginBottom: '10px' }}>
              <FiCheckCircle size={26} />
            </div>
            
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#1E1B4B' }}>
              Transaksi Tersimpan
            </h4>
            
            <p style={{ margin: '0 0 14px 0', fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
              Data berhasil disinkronkan ke pembukuan spreadsheet Anda.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
              <img 
                src="/image/successjax.png" 
                alt="Berhasil" 
                style={{ maxWidth: '100%', maxHeight: '130px', objectFit: 'contain', borderRadius: '10px' }} 
              />
            </div>

            <button 
              onClick={() => {
                setShowModal(false);
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

// --- STYLING TERPADU (TEMA UNGU & KUNING) ---
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

const modalCardStyle = {
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

const quickActionCardStyle = {
  background: '#F8FAFC', 
  border: '1px solid #E2E8F0',
  padding: '10px 6px', 
  borderRadius: '12px', 
  cursor: 'pointer',
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  gap: '5px',
  transition: 'all 0.2s ease', 
  textAlign: 'center'
};

const activeTabPillStyle = {
  flex: 1, 
  padding: '6px 10px', 
  borderRadius: '8px', 
  border: '1px solid rgba(245, 158, 11, 0.4)',
  background: 'linear-gradient(135deg, #1E1B4B 0%, #2E3192 100%)', 
  color: '#F59E0B', 
  fontSize: '11px', 
  fontWeight: '600',
  cursor: 'pointer', 
  fontFamily: 'Poppins, sans-serif', 
  boxShadow: '0 2px 5px rgba(46, 49, 146, 0.25)'
};

const inactiveTabPillStyle = {
  flex: 1, 
  padding: '6px 10px', 
  borderRadius: '8px', 
  border: 'none',
  background: 'transparent', 
  color: '#64748B', 
  fontSize: '11px', 
  fontWeight: '500',
  cursor: 'pointer', 
  fontFamily: 'Poppins, sans-serif'
};

const fieldLabelStyle = {
  display: 'block', 
  fontSize: '10px', 
  fontWeight: '600',
  color: '#1E1B4B', 
  marginBottom: '4px', 
  textTransform: 'uppercase', 
  letterSpacing: '0.3px'
};

const fieldInputStyle = {
  width: '100%', 
  padding: '8px 10px', 
  borderRadius: '8px',
  border: '1px solid #CBD5E1', 
  fontSize: '12px', 
  outline: 'none',
  boxSizing: 'border-box', 
  fontFamily: 'Poppins, sans-serif', 
  background: '#F8FAFC', 
  color: '#1E293B'
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