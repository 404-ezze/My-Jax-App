import React, { useState, useRef } from 'react';
import { API_URL } from '../App';
import { 
  FiLoader, 
  FiCheckCircle, 
  FiX, 
  FiCamera, 
  FiMic, 
  FiCheck, 
  FiCalendar, 
  FiFileText, 
  FiTag, 
  FiCreditCard, 
  FiRotateCcw 
} from 'react-icons/fi';
import { createWorker } from 'tesseract.js';

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

  // --- State Voice Command ---
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tekan dan tahan tombol untuk berbicara.');
  const recognitionRef = useRef(null);

  // --- State Scan Struk OCR ---
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('Mempersiapkan pemindaian gambar...');
  const [extractedNominal, setExtractedNominal] = useState('');
  const [extractedCategory, setExtractedCategory] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- LOGIC OCR STRUK (ASLI TETAP UTUH) ---
  // --- LOGIC OCR STRUK CERDAS (ANTI-TAHUN & SPESIFIK E-WALLET/STRUK) ---
  const handleScanReceipt = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setShowOcrModal(true);
    setOcrLoading(true);
    setOcrStatus('Menganalisis total tagihan struk...');
    setExtractedNominal('');

    try {
      const worker = await createWorker('ind+eng');
      const ret = await worker.recognize(file);
      const text = ret.data.text;
      await worker.terminate();

      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      let detectedNominalVal = null;

      // Filter angka agar TIDAK membaca tahun (2020-2035) atau nomor ID/telepon panjang
      const isValidMoneyNumber = (num) => {
        if (!num || isNaN(num)) return false;
        const currentYear = new Date().getFullYear();
        // Cegah tahun (misal: 2020 - 2035)
        if (num >= 2020 && num <= currentYear + 5) return false;
        // Nominal uang wajar: minimal Rp 500 dan di bawah 100 juta
        return num >= 500 && num <= 100000000;
      };

      const parseNumberFromStr = (str) => {
        if (!str) return null;
        // Bersihkan karakter selain angka, titik, dan koma
        let clean = str.replace(/[^\d.,]/g, '');
        // Tangani format Rp 25.000,00 atau 25,000.00
        if (clean.includes(',') && clean.includes('.')) {
          if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
            clean = clean.substring(0, clean.lastIndexOf(',')).replace(/\./g, '');
          } else {
            clean = clean.substring(0, clean.lastIndexOf('.')).replace(/,/g, '');
          }
        } else {
          // Tangani pemisah ribuan standar Indonesia (titik)
          clean = clean.replace(/[.,]/g, '');
        }
        const val = parseInt(clean, 10);
        return isValidMoneyNumber(val) ? val : null;
      };

      // PRIORITAS 1: Cari baris dengan label kata kunci transaksi (GoPay / Struk Kasir)
      const primaryKeywords = [
        'total bayar', 'total transaksi', 'total pembayaran', 
        'jumlah transfer', 'nominal transfer', 'total belanja', 
        'grand total', 'total tagihan', 'total', 'jumlah'
      ];

      for (let i = 0; i < lines.length; i++) {
        const lineLower = lines[i].toLowerCase();
        
        for (const kw of primaryKeywords) {
          if (lineLower.includes(kw)) {
            // Cek apakah angka ada di baris yang sama
            const numInSameLine = parseNumberFromStr(lines[i]);
            if (numInSameLine) {
              detectedNominalVal = numInSameLine;
              break;
            }
            // Jika angka ada di baris berikutnya (pola GoPay / mobile banking)
            if (lines[i + 1]) {
              const numInNextLine = parseNumberFromStr(lines[i + 1]);
              if (numInNextLine) {
                detectedNominalVal = numInNextLine;
                break;
              }
            }
          }
        }
        if (detectedNominalVal) break;
      }

      // PRIORITAS 2: Cari format teks yang diawali awalan 'Rp' atau 'IDR'
      if (!detectedNominalVal) {
        for (const line of lines) {
          const rpMatch = line.match(/(?:rp|idr)\s*([\d.,]+)/i);
          if (rpMatch && rpMatch[1]) {
            const parsed = parseNumberFromStr(rpMatch[1]);
            if (parsed) {
              detectedNominalVal = parsed;
              break;
            }
          }
        }
      }

      // PRIORITAS 3: Ekstraksi fallback (ambil angka uang valid terbesar, buang tahun & jam)
      if (!detectedNominalVal) {
        const allCandidates = [];
        for (const line of lines) {
          // Abaikan baris tanggal / waktu (contoh: 28/08/2026 atau 14:30:00)
          if (line.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/) || line.match(/\d{1,2}:\d{2}/)) {
            continue;
          }
          const matches = line.match(/\b\d{1,3}(?:[.,]\d{3})+\b|\b\d{4,8}\b/g);
          if (matches) {
            matches.forEach(m => {
              const val = parseNumberFromStr(m);
              if (val) allCandidates.push(val);
            });
          }
        }
        if (allCandidates.length > 0) {
          detectedNominalVal = Math.max(...allCandidates);
        }
      }

      // Deteksi Kategori Cerdas
      const lowerText = text.toLowerCase();
      let detectedCategory = 'Kebutuhan Pokok';
      if (lowerText.includes('kopi') || lowerText.includes('cafe') || lowerText.includes('resto') || lowerText.includes('makan') || lowerText.includes('gofood') || lowerText.includes('shopeefood')) {
        detectedCategory = 'Jajan & Hiburan';
      } else if (lowerText.includes('bensin') || lowerText.includes('spbu') || lowerText.includes('pertamina') || lowerText.includes('goride') || lowerText.includes('gocar') || lowerText.includes('grab')) {
        detectedCategory = 'Transportasi';
      } else if (lowerText.includes('pln') || lowerText.includes('listrik') || lowerText.includes('pdam') || lowerText.includes('pulsa') || lowerText.includes('indihome') || lowerText.includes('wifi')) {
        detectedCategory = 'Kost & Tagihan';
      }

      // Deteksi Sumber Dana Otomatis dari Struk
      let detectedDana = formData.sumberDana;
      if (lowerText.includes('gopay')) detectedDana = 'Gopay';
      else if (lowerText.includes('shopeepay')) detectedDana = 'ShopeePay';
      else if (lowerText.includes('bca')) detectedDana = 'BCA';
      else if (lowerText.includes('bni')) detectedDana = 'BNI';
      else if (lowerText.includes('jago')) detectedDana = 'Jago';
      else if (lowerText.includes('dana')) detectedDana = 'Dana';
      else if (lowerText.includes('seabank')) detectedDana = 'SeaBank';

      setExtractedNominal(detectedNominalVal ? String(detectedNominalVal) : '');
      setExtractedCategory(detectedCategory);
      setFormData(prev => ({ ...prev, sumberDana: detectedDana }));
      
      setOcrStatus(detectedNominalVal 
        ? 'Pemindaian berhasil! Silakan periksa rincian di bawah.' 
        : 'Nominal tidak terdeteksi otomatis. Silakan masukkan secara manual.'
      );
    } catch (error) {
      setOcrStatus('Gagal memindai struk: ' + error.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleApplyOcrData = () => {
    setFormData(prev => ({
      ...prev,
      kategori: extractedCategory || prev.kategori,
      item: 'Belanja Struk',
      nominal: extractedNominal || prev.nominal
    }));
    setShowOcrModal(false);
  };

  // --- LOGIC PERINTAH SUARA (ASLI TETAP UTUH) ---
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
    if (speechText.includes('gopay')) {
      detectedSumberDana = 'Gopay';
    } else if (speechText.includes('shopeepay') || speechText.includes('shopee pay')) {
      detectedSumberDana = 'ShopeePay';
    } else if (speechText.includes('jago') || speechText.includes('bank jago')) {
      detectedSumberDana = 'Jago';
    } else if (speechText.includes('bni')) {
      detectedSumberDana = 'BNI';
    } else if (speechText.includes('line bank') || speechText.includes('line')) {
      detectedSumberDana = 'Line Bank';
    } else if (speechText.includes('dana')) {
      detectedSumberDana = 'Dana';
    } else if (speechText.includes('seabank') || speechText.includes('sea bank')) {
      detectedSumberDana = 'SeaBank';
    } else if (speechText.includes('bca')) {
      detectedSumberDana = 'BCA';
    } else if (speechText.includes('tunai') || speechText.includes('cash')) {
      detectedSumberDana = 'Tunai';
    }

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
      alert('Browser Anda belum mendukung fitur perekaman suara.');
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
    setVoiceStatus('Mendengarkan... Lepas jika selesai berbicara.');
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
    setVoiceStatus('Selesai merekam. Silakan periksa hasil transkripsi.');
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
      {/* Modal Overlay Utama */}
      <div style={modalOverlayStyle}>
        <div style={{ ...modalCardStyle, maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto' }}>
          
          {/* Header Modal */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', fontSize: '17px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
                Catat Transaksi
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '400' }}>
                Kelola arus kas harian Anda secara sistematis.
              </span>
            </div>
            <button onClick={onClose} style={iconCloseBtnStyle}>
              <FiX size={17} />
            </button>
          </div>

          {/* Quick Input Bar (Scan Foto & Voice) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
            <label htmlFor="receipt-upload" style={quickActionCardStyle}>
              <div style={{ background: '#F1F5F9', color: '#334155', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <FiCamera size={14} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Pindai Struk</span>
            </label>
            <input id="receipt-upload" type="file" accept="image/*" capture="environment" onChange={handleScanReceipt} style={{ display: 'none' }} />

            <button type="button" onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }} style={quickActionCardStyle}>
              <div style={{ background: '#F1F5F9', color: '#334155', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <FiMic size={14} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Perintah Suara</span>
            </button>
          </div>

          {errorMessage && (
            <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', color: '#991B1B', fontSize: '12px', fontWeight: '500' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            
            {/* Tab Pilihan: Pengeluaran / Pemasukan */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Expense' })}
                  style={formData.tipe === 'Expense' ? activeTabPillStyle : inactiveTabPillStyle}
                >
                  Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Income' })}
                  style={formData.tipe === 'Income' ? activeTabPillStyle : inactiveTabPillStyle}
                >
                  Pemasukan
                </button>
              </div>
            </div>

            {/* Input Nominal & Tanggal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={fieldLabelStyle}>Nominal *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '14px', fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Rp</span>
                  <input 
                    type="number" 
                    name="nominal" 
                    placeholder="0" 
                    value={formData.nominal} 
                    onChange={handleChange} 
                    style={{ ...fieldInputStyle, paddingLeft: '38px', fontWeight: '700', fontSize: '14px' }} 
                    required
                  />
                </div>
              </div>

              <div>
                <label style={fieldLabelStyle}>Tanggal *</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiCalendar size={14} /></span>
                  <input 
                    type="date" 
                    name="tanggal" 
                    value={formData.tanggal} 
                    onChange={handleChange} 
                    style={{ ...fieldInputStyle, paddingLeft: '34px' }} 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: '14px' }}>
              <label style={fieldLabelStyle}>Kategori *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiTag size={14} /></span>
                <select name="kategori" value={formData.kategori} onChange={handleChange} style={{ ...fieldInputStyle, paddingLeft: '34px' }}>
                  <option value="Kebutuhan Pokok">Kebutuhan Pokok</option>
                  <option value="Jajan & Hiburan">Jajan & Hiburan</option>
                  <option value="Kost & Tagihan">Kost & Tagihan</option>
                  <option value="Transportasi">Transportasi</option>
                  <option value="Edukasi & Karier">Edukasi & Karier</option>
                  <option value="Darurat & Kesehatan">Darurat & Kesehatan</option>
                  <option value="Pemasukan">Pemasukan (Gaji/Transfer)</option>
                </select>
              </div>
            </div>

            {/* Deskripsi */}
            <div style={{ marginBottom: '14px' }}>
              <label style={fieldLabelStyle}>Keterangan Transaksi *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiFileText size={14} /></span>
                <input 
                  type="text" 
                  name="item" 
                  placeholder="Contoh: Makan siang / Tagihan internet" 
                  value={formData.item} 
                  onChange={handleChange} 
                  style={{ ...fieldInputStyle, paddingLeft: '34px' }} 
                  required
                />
              </div>
            </div>

            {/* Sumber Dana */}
            <div style={{ marginBottom: '18px' }}>
              <label style={fieldLabelStyle}>Metode / Sumber Rekening</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', color: '#64748B', display: 'flex' }}><FiCreditCard size={14} /></span>
                <select name="sumberDana" value={formData.sumberDana} onChange={handleChange} style={{ ...fieldInputStyle, paddingLeft: '34px' }}>
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
              <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={previewImage} alt="Struk" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1, fontSize: '11px', color: '#334155', fontWeight: '500' }}>
                  Struk berhasil dilampirkan.
                </div>
              </div>
            )}

            {/* Tombol Aksi */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
              <button type="button" onClick={onClose} style={modalCancelBtnStyle}>
                Batal
              </button>
              <button type="submit" disabled={loading} style={modalSubmitBtnStyle}>
                {loading ? <FiLoader className="spin" size={14} /> : <FiCheck size={14} />}
                <span>{loading ? 'Menyimpan...' : 'Simpan Catatan'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* --- POP-UP MODAL OCR STRUK --- */}
      {showOcrModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalCardStyle, maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>Pemindaian Struk</h3>
              <button onClick={() => setShowOcrModal(false)} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B' }}>
              {ocrStatus}
            </p>

            {ocrLoading ? (
              <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FiLoader className="spin" size={24} color="#0F172A" />
                <span style={{ fontSize: '12px', color: '#64748B' }}>Membaca rincian gambar...</span>
              </div>
            ) : (
              <>
                {previewImage && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <img src={previewImage} alt="Preview Struk" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E2E8F0' }} />
                  </div>
                )}
                <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px', textAlign: 'left' }}>
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Hasil Analisis:</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginTop: '2px' }}>
                    {extractedNominal ? `Rp ${Number(extractedNominal).toLocaleString('id-ID')}` : 'Nominal tidak ditemukan'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px', fontWeight: '600' }}>
                    Kategori: {extractedCategory}
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

      {/* --- POP-UP MODAL PERINTAH SUARA --- */}
      {showVoiceModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10001 }}>
          <div style={{ ...modalCardStyle, maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>
                {isRecording ? 'Mendengarkan...' : 'Perintah Suara'}
              </h3>
              <button onClick={() => { if (isRecording && recognitionRef.current) recognitionRef.current.stop(); setShowVoiceModal(false); }} style={iconCloseBtnStyle}>
                <FiX size={16} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B' }}>
              {voiceStatus}
            </p>

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
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Makan siang 35000 bayar gopay"'}
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

      {/* --- POP-UP MODAL SUKSES --- */}
      {showModal && (
        <div style={{ ...modalOverlayStyle, zIndex: 10002 }}>
          <div style={{ 
            ...modalCardStyle, 
            maxWidth: '340px', 
            textAlign: 'center', 
            padding: '28px 24px' 
          }}>
            <div style={{ display: 'inline-flex', background: '#DCFCE7', color: '#16A34A', padding: '12px', borderRadius: '50%', marginBottom: '12px' }}>
              <FiCheckCircle size={28} />
            </div>
            
            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.3px' }}>
              Transaksi Tersimpan
            </h4>
            
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
              Data berhasil disinkronkan ke pembukuan spreadsheet Anda.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <img 
                src="/image/successjax.png" 
                alt="Berhasil" 
                style={{ maxWidth: '100%', maxHeight: '140px', objectFit: 'contain', borderRadius: '12px' }} 
              />
            </div>

            <button 
              onClick={() => {
                setShowModal(false);
                onClose();
              }} 
              style={{ ...modalSubmitBtnStyle, width: '100%', justifyContent: 'center', padding: '10px 16px' }}
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// --- STYLING HUMAN-CENTRIC & MODERN (POPPINS THEME) ---
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(5px)',
  display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '16px'
};

const modalCardStyle = {
  background: '#FFFFFF', borderRadius: '20px', padding: '24px',
  width: '100%', boxShadow: '0 20px 30px -10px rgba(15, 23, 42, 0.1)',
  fontFamily: 'Poppins, sans-serif', boxSizing: 'border-box'
};

const iconCloseBtnStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0', cursor: 'pointer',
  padding: '6px', display: 'flex', alignItems: 'center', borderRadius: '8px', color: '#64748B',
  transition: 'all 0.2s ease'
};

const quickActionCardStyle = {
  background: '#F8FAFC', border: '1px solid #E2E8F0',
  padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  transition: 'all 0.2s ease'
};

const activeTabPillStyle = {
  flex: 1, padding: '7px 12px', borderRadius: '9px', border: 'none',
  background: '#0F172A', color: '#FFFFFF', fontSize: '12px', fontWeight: '600',
  cursor: 'pointer', fontFamily: 'Poppins, sans-serif', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
};

const inactiveTabPillStyle = {
  flex: 1, padding: '7px 12px', borderRadius: '9px', border: 'none',
  background: 'transparent', color: '#64748B', fontSize: '12px', fontWeight: '500',
  cursor: 'pointer', fontFamily: 'Poppins, sans-serif'
};

const fieldLabelStyle = {
  display: 'block', fontSize: '11px', fontWeight: '600',
  color: '#475569', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px'
};

const fieldInputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '10px',
  border: '1px solid #CBD5E1', fontSize: '12px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif', background: '#F8FAFC', color: '#0F172A'
};

const modalCancelBtnStyle = {
  padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#475569', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif'
};

const modalSubmitBtnStyle = {
  padding: '8px 18px', background: '#0F172A', border: 'none', borderRadius: '10px',
  fontSize: '12px', fontWeight: '600', color: '#FFFFFF', cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', display: 'flex', alignItems: 'center', gap: '6px'
};