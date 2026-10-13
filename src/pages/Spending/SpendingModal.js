import React, { useState, useRef } from 'react';
import './Spending.css';
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
import { appendRowToSheet } from '../../utils/GoogleStorage';

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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [voiceStatus, setVoiceStatus] = useState('Tekan dan tahan tombol untuk berbicara.');
  const recognitionRef = useRef(null);
  const [showOcrModal, setShowOcrModal] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('Mempersiapkan pemindaian gambar...');
  const [isInvalidReceipt, setIsInvalidReceipt] = useState(false);
  const [extractedNominal, setExtractedNominal] = useState('');
  const [extractedCategory, setExtractedCategory] = useState('');
  const [extractedMerchant, setExtractedMerchant] = useState('');
  const [extractedMethod, setExtractedMethod] = useState('Cash');

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

      const receiptKeywords = [
        'total', 'subtotal', 'bayar', 'tagihan', 'rp', 'idr', 'qris',
        'transaksi', 'kasir', 'struk', 'nota', 'kembali', 'tunai',
        'gopay', 'shopeepay', 'shopee', 'bca', 'dana', 'seabank', 'jago',
        'mandiri', 'bri', 'bni', 'bsi', 'ovo', 'line bank', 'jenius',
        'berhasil', 'sukses', 'transfer', 'rekening', 'pembayaran', 'wondr'
      ];
      const isReceipt = receiptKeywords.some(kw => textLower.includes(kw));

      if (rawText.trim().length < 8 || !isReceipt) {
        setIsInvalidReceipt(true);
        setOcrStatus('Gambar yang diunggah tidak terdeteksi sebagai struk atau mutasi transaksi. Silakan unggah struk yang jelas.');
        setOcrLoading(false);
        return;
      }

      // Parser Nilai Angka Rupiah
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
                               textLower.includes('mandiri') ||
                               textLower.includes('bri') ||
                               textLower.includes('shopee') ||
                               textLower.includes('transfer') ||
                               textLower.includes('berhasil') ||
                               textLower.includes('sukses');

      // PRIORITAS 1: Pola "Rp"
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

      // PRIORITAS 3: Fallback angka
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

      // Ekstraksi Toko / Keterangan
      let merchant = '';
      if (textLower.includes('shopee')) {
        merchant = 'ShopeePay / Belanja Shopee';
      } else if (textLower.includes('bca')) {
        merchant = 'Transfer / Pembayaran BCA';
      } else if (textLower.includes('livin') || textLower.includes('mandiri')) {
        merchant = 'Livin / Bank Mandiri';
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
      if (textLower.includes('shopee') || textLower.includes('tokopedia') || textLower.includes('cafe') || textLower.includes('kopi') || textLower.includes('resto') || textLower.includes('makan') || textLower.includes('gofood') || textLower.includes('pawon')) {
        detectedCategory = 'Jajan & Hiburan';
      } else if (textLower.includes('spbu') || textLower.includes('bensin') || textLower.includes('goride') || textLower.includes('grab')) {
        detectedCategory = 'Transportasi';
      } else if (textLower.includes('listrik') || textLower.includes('pln') || textLower.includes('pulsa') || textLower.includes('wifi') || textLower.includes('kost')) {
        detectedCategory = 'Kost & Tagihan';
      }

      // Deteksi Metode Pembayaran
      let detectedMethod = null;
      if (textLower.includes('dana') || textLower.includes('dana id')) detectedMethod = 'DANA';
      else if (textLower.includes('seabank')) detectedMethod = 'SeaBank';
      else if (textLower.includes('wondr') || textLower.includes('bni')) detectedMethod = 'BNI';
      else if (textLower.includes('jago')) detectedMethod = 'Bank Jago';
      else if (textLower.includes('shopeepay') || textLower.includes('shopee')) detectedMethod = 'ShopeePay';
      else if (textLower.includes('gopay')) detectedMethod = 'GoPay';
      else if (textLower.includes('ovo')) detectedMethod = 'OVO';
      else if (textLower.includes('livin') || textLower.includes('mandiri')) detectedMethod = 'Mandiri';
      else if (textLower.includes('bri') || textLower.includes('brimo')) detectedMethod = 'BRI';
      else if (textLower.includes('bsi') || textLower.includes('byond')) detectedMethod = 'BSI';
      else if (textLower.includes('jenius')) detectedMethod = 'Jenius';
      else if (textLower.includes('line bank') || textLower.includes('linebank')) detectedMethod = 'Line Bank';
      else if (textLower.includes('bca') || textLower.includes('mybca') || textLower.includes('klikbca')) detectedMethod = 'BCA';
      else if (textLower.includes('tunai') || textLower.includes('cash')) detectedMethod = 'Cash';
      else detectedMethod = formData.sumberDana || 'Cash';

      setExtractedNominal(detectedNominalVal ? String(detectedNominalVal) : '');
      setExtractedCategory(detectedCategory);
      setExtractedMerchant(merchant || 'Belanja Struk');
      setExtractedMethod(detectedMethod);

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
      nominal: extractedNominal || prev.nominal,
      sumberDana: extractedMethod || prev.sumberDana
    }));
    setShowOcrModal(false);
  };

  // --- LOGIC PERINTAH SUARA (VOICE COMMAND) ---
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
      .replace(/\b(pakai|menggunakan|dengan|lewat|via)\s+(bca|mandiri|bni|bri|bsi|seabank|jago|line|line bank|jenius|gopay|shopeepay|shopee|dana|ovo|tunai|cash|debit)\b/g, '')
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
    } else if (speechText.includes('kos') || speechText.includes('tagihan') || speechText.includes('listrik') || speechText.includes('wifi')) {
      detectedCategory = 'Kost & Tagihan';
    }

    let detectedSumberDana = formData.sumberDana;
    if (speechText.includes('gopay') || speechText.includes('go pay')) detectedSumberDana = 'GoPay';
    else if (speechText.includes('shopeepay') || speechText.includes('shopee pay') || speechText.includes('shopee')) detectedSumberDana = 'ShopeePay';
    else if (speechText.includes('dana')) detectedSumberDana = 'DANA';
    else if (speechText.includes('ovo')) detectedSumberDana = 'OVO';
    else if (speechText.includes('jago') || speechText.includes('bank jago')) detectedSumberDana = 'Bank Jago';
    else if (speechText.includes('seabank') || speechText.includes('sea bank')) detectedSumberDana = 'SeaBank';
    else if (speechText.includes('line bank') || speechText.includes('line')) detectedSumberDana = 'Line Bank';
    else if (speechText.includes('jenius')) detectedSumberDana = 'Jenius';
    else if (speechText.includes('mandiri') || speechText.includes('livin')) detectedSumberDana = 'Mandiri';
    else if (speechText.includes('bri') || speechText.includes('brimo')) detectedSumberDana = 'BRI';
    else if (speechText.includes('bni') || speechText.includes('wondr')) detectedSumberDana = 'BNI';
    else if (speechText.includes('bsi')) detectedSumberDana = 'BSI';
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

  // --- SUBMIT TRANSAKSI KE GOOGLE SHEETS / LOCAL GUEST ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.nominal) {
      setErrorMessage('Keterangan dan nominal transaksi wajib diisi.');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    const authMode = localStorage.getItem('jax_auth_mode') || 'guest';
    const newId = `SPND-${Date.now()}`;
    const newRow = [
      newId,
      formData.tanggal,
      formData.tipe,
      formData.kategori,
      formData.item,
      Number(formData.nominal),
      formData.sumberDana
    ];

    try {
      if (authMode === 'google') {
        await appendRowToSheet('Spending', newRow);
        const existingTx = JSON.parse(localStorage.getItem('jax_cache_spending') || '[]');
        localStorage.setItem('jax_cache_spending', JSON.stringify([newRow, ...existingTx]));
      } else {
        const guestTx = JSON.parse(localStorage.getItem('jax_guest_spending') || '[]');
        localStorage.setItem('jax_guest_spending', JSON.stringify([newRow, ...guestTx]));
      }

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
    } catch (error) {
      alert('Kendala penyimpanan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="spending-modal-overlay">
        <div className="spending-modal-card spending-modal-card--scroll">
          <div className="spending-modal-header-main">
            <div>
              <div className="spending-modal-entry-badge">Entry Transaksi</div>
              <h3 className="spending-modal-title-main">Catat Transaksi</h3>
              <span className="spending-modal-subtitle">
                Sinkronisasi otomatis ke pembukuan MyJAX Anda.
              </span>
            </div>
            <button onClick={onClose} className="spending-modal-close">
              <FiX size={16} />
            </button>
          </div>

          <div className="spending-quick-actions">
            <label htmlFor="receipt-camera" className="spending-quick-action-card">
              <div className="spending-quick-action-icon spending-quick-action-icon--blue">
                <FiCamera size={14} />
              </div>
              <span className="spending-quick-action-text">Foto Struk</span>
            </label>
            <input
              id="receipt-camera"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleScanReceipt}
              className="spending-hidden-input"
            />

            <label htmlFor="receipt-gallery" className="spending-quick-action-card">
              <div className="spending-quick-action-icon spending-quick-action-icon--blue">
                <FiImage size={14} />
              </div>
              <span className="spending-quick-action-text">Dari Galeri</span>
            </label>
            <input
              id="receipt-gallery"
              type="file"
              accept="image/*"
              onChange={handleScanReceipt}
              className="spending-hidden-input"
            />

            <button
              type="button"
              onClick={() => { setRecognizedText(''); setShowVoiceModal(true); }}
              className="spending-quick-action-card"
            >
              <div className="spending-quick-action-icon spending-quick-action-icon--amber">
                <FiMic size={14} />
              </div>
              <span className="spending-quick-action-text">Suara</span>
            </button>
          </div>

          {errorMessage && (
            <div className="spending-modal-error">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="spending-type-field">
              <div className="spending-type-toggle">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Expense' })}
                  className={formData.tipe === "Expense" ? "spending-type-pill spending-type-pill--active" : "spending-type-pill spending-type-pill--inactive"}
                >
                  Belanja / Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tipe: 'Income' })}
                  className={formData.tipe === "Income" ? "spending-type-pill spending-type-pill--active" : "spending-type-pill spending-type-pill--inactive"}
                >
                  Dana Masuk / Kiriman
                </button>
              </div>
            </div>

            <div className="spending-amount-date-grid">
              <div>
                <label className="spending-field-label">Nominal (Rp) *</label>
                <div className="spending-input-with-icon">
                  <span className="spending-rupiah-prefix">Rp</span>
                  <input
                    type="number"
                    name="nominal"
                    placeholder="0"
                    value={formData.nominal}
                    onChange={handleChange}
                    className="spending-field-input spending-field-input--nominal"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="spending-field-label">Tanggal *</label>
                <div className="spending-input-with-icon">
                  <span className="spending-field-icon"><FiCalendar size={13} /></span>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    className="spending-field-input"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="spending-field-group">
              <label className="spending-field-label">Kategori Transaksi *</label>
              <div className="spending-input-with-icon">
                <span className="spending-field-icon"><FiTag size={13} /></span>
                <select name="kategori" value={formData.kategori} onChange={handleChange} className="spending-field-input">
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

            <div className="spending-field-group">
              <label className="spending-field-label">Keterangan *</label>
              <div className="spending-input-with-icon">
                <span className="spending-field-icon"><FiFileText size={13} /></span>
                <input
                  type="text"
                  name="item"
                  placeholder="Contoh: Nasi padang / Kopi santai"
                  value={formData.item}
                  onChange={handleChange}
                  className="spending-field-input"
                  required
                />
              </div>
            </div>

            <div className="spending-method-group">
              <label className="spending-field-label">Metode / Sumber Dana *</label>
              <div className="spending-input-with-icon">
                <span className="spending-field-icon"><FiCreditCard size={13} /></span>
                <select name="sumberDana" value={formData.sumberDana} onChange={handleChange} className="spending-field-input">
                  <optgroup label="Tunai">
                    <option value="Cash">Cash (Tunai)</option>
                  </optgroup>
                  <optgroup label="E-Wallet">
                    <option value="GoPay">GoPay</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="DANA">DANA</option>
                    <option value="OVO">OVO</option>
                  </optgroup>
                  <optgroup label="Bank Konvensional & Syariah">
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                    <option value="BSI">BSI</option>
                  </optgroup>
                  <optgroup label="Bank Digital">
                    <option value="SeaBank">SeaBank</option>
                    <option value="Bank Jago">Bank Jago</option>
                    <option value="Line Bank">Line Bank</option>
                    <option value="Jenius">Jenius</option>
                  </optgroup>
                  <optgroup label="Lainnya">
                    <option value="Lainnya">Lainnya</option>
                  </optgroup>
                </select>
              </div>
            </div>

            {previewImage && (
              <div className="spending-attachment">
                <img src={previewImage} alt="Struk" className="spending-attachment-image" />
                <span className="spending-attachment-text">Lampiran struk terunggah.</span>
              </div>
            )}

            <div className="spending-modal-footer-border">
              <button type="button" onClick={onClose} className="spending-modal-cancel">
                Batal
              </button>
              <button type="submit" disabled={loading} className="spending-modal-submit">
                {loading ? <FiLoader className="spin" size={13} /> : <FiCheck size={13} />}
                <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {showOcrModal && (
        <div className="spending-modal-overlay spending-overlay--nested">
          <div className="spending-modal-card spending-modal-card--ocr">
            <div className="spending-modal-header-compact">
              <h3 className="spending-modal-title-compact">
                {isInvalidReceipt ? 'Bukan Struk/Bill' : 'Pemindaian Struk'}
              </h3>
              <button onClick={() => setShowOcrModal(false)} className="spending-modal-close">
                <FiX size={15} />
              </button>
            </div>

            {ocrLoading ? (
              <div className="spending-ocr-loading">
                <FiLoader className="spin" size={26} color="#F59E0B" />
                <span className="spending-ocr-status">Menganalisis teks & nominal struk...</span>
              </div>
            ) : isInvalidReceipt ? (
              <div className="spending-ocr-invalid">
                <div className="spending-ocr-invalid-icon">
                  <FiAlertCircle size={26} />
                </div>
                <p className="spending-ocr-invalid-text">
                  {ocrStatus}
                </p>
                <div className="spending-ocr-button-wrap">
                  <button onClick={() => setShowOcrModal(false)} className="spending-modal-submit spending-ocr-submit">
                    Upload Ulang
                  </button>
                </div>
              </div>
            ) : (
              <>
                {previewImage && (
                  <div className="spending-ocr-preview-wrap">
                    <img src={previewImage} alt="Preview Struk" className="spending-ocr-preview-image" />
                  </div>
                )}

                <div className="spending-ocr-result-card">
                  <div className="spending-ocr-result-label">
                    Nominal Terdeteksi (Dapat Diedit):
                  </div>

                  <div className="spending-ocr-amount-wrap">
                    <span className="spending-ocr-rupiah-prefix">Rp</span>
                    <input
                      type="number"
                      value={extractedNominal}
                      onChange={(e) => setExtractedNominal(e.target.value)}
                      placeholder="0"
                      className="spending-ocr-nominal-input"
                    />
                  </div>

                  <div className="spending-ocr-info">
                    Toko: <span className="spending-ocr-info-highlight">{extractedMerchant}</span> • Kategori: <span className="spending-ocr-info-highlight">{extractedCategory}</span> • Metode: <span className="spending-ocr-info-highlight">{extractedMethod}</span>
                  </div>
                </div>

                <div className="spending-modal-footer-actions">
                  <button onClick={() => setShowOcrModal(false)} className="spending-modal-cancel">
                    Ulangi
                  </button>
                  <button
                    onClick={handleApplyOcrData}
                    disabled={!extractedNominal}
                    className={"spending-modal-submit spending-submit-disabled" + (extractedNominal ? " spending-submit-enabled" : "")}
                  >
                    Terapkan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showVoiceModal && (
        <div className="spending-modal-overlay spending-overlay--nested">
          <div className="spending-modal-card spending-modal-card--voice">
            <div className="spending-modal-header spending-modal-header--voice">
              <h3 className="spending-modal-title-compact">
                {isRecording ? 'Mendengarkan...' : 'Perintah Suara'}
              </h3>
              <button
                onClick={() => {
                  if (isRecording && recognitionRef.current) recognitionRef.current.stop();
                  setShowVoiceModal(false);
                }}
                className="spending-modal-close"
              >
                <FiX size={15} />
              </button>
            </div>

            <p className="spending-voice-status">{voiceStatus}</p>

            <div className="spending-voice-record-wrap">
              <button
                type="button"
                onMouseDown={startHoldingRecord}
                onMouseUp={stopHoldingRecord}
                onTouchStart={startHoldingRecord}
                onTouchEnd={stopHoldingRecord}
                className={isRecording ? "spending-voice-record-button spending-voice-record-button--recording" : "spending-voice-record-button spending-voice-record-button--idle"}
              >
                <FiMic size={14} /> {isRecording ? 'Merekam... Lepas jika Selesai' : 'Tahan untuk Bicara'}
              </button>
            </div>

            <div className="spending-recognized-box">
              <p className={recognizedText ? "spending-recognized-text spending-recognized-text--normal" : "spending-recognized-text spending-recognized-text--italic"}>
                {recognizedText ? `"${recognizedText}"` : 'Tahan tombol dan ucapkan, misal: "Makan siang 25000 bayar gopay"'}
              </p>
            </div>

            <div className="spending-modal-footer-actions">
              <button type="button" onClick={() => setRecognizedText('')} className="spending-modal-cancel">
                <FiRotateCcw size={12} /> Reset
              </button>
              <button
                type="button"
                onClick={handleApplyVoiceData}
                disabled={!recognizedText}
                className={"spending-modal-submit spending-submit-disabled" + (recognizedText ? " spending-submit-enabled" : "")}
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="spending-modal-overlay spending-overlay--success">
          <div className="spending-modal-card spending-modal-card--success">
            <div className="spending-success-icon">
              <FiCheckCircle size={26} />
            </div>

            <h4 className="spending-success-title">
              Transaksi Tersimpan
            </h4>

            <p className="spending-success-text">
              Data berhasil disinkronkan ke pembukuan spreadsheet Anda.
            </p>

            <div className="spending-success-image-wrap">
              <img
                src="/image/successjax.png"
                alt="Berhasil"
                className="spending-success-image"
              />
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                onClose();
              }}
              className="spending-modal-submit spending-success-submit"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </>
  );
}