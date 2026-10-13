export const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

// 1. Helper Validasi Status Otorisasi & Auto-Logout saat Token Kedaluwarsa
export function handleAuthError(res) {
  if (res && res.status === 401) {
    // Bersihkan seluruh sesi kredensial dan cache
    localStorage.removeItem('jax_auth_mode');
    localStorage.removeItem('jax_google_token');
    localStorage.removeItem('jax_user_name');
    localStorage.removeItem('jax_user_email');
    localStorage.removeItem('jax_user_avatar');
    localStorage.removeItem('jax_user_sheet_id');
    localStorage.removeItem('myjax_user_profile');

    localStorage.removeItem('jax_cache_spending');
    localStorage.removeItem('jax_cache_tasks');
    localStorage.removeItem('jax_cache_workiez');

    localStorage.removeItem('jax_guest_spending');
    localStorage.removeItem('jax_guest_tasks');
    localStorage.removeItem('jax_guest_workiez');

    sessionStorage.clear();

    alert('Sesi login Google telah berakhir demi keamanan. Silakan masuk kembali.');
    window.location.reload();
    return true;
  }
  return false;
}

// 2. Helper untuk Mendapatkan Sheet ID (gid) Berdasarkan Nama Tab
async function getSheetIdByName(token, spreadsheetId, sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  const found = data.sheets?.find(s => s.properties.title === sheetName);
  return found ? found.properties.sheetId : 0;
}

// 3. Buat Spreadsheet Baru Otomatis Lengkap dengan Sheet, Header, dan Nama Pengguna
export async function createInitialSpreadsheet(accessToken, userName = 'User') {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const fileTitle = `MY JAX - Personal Data ${userName}`.trim();

  const payload = {
    properties: {
      title: fileTitle
    },
    sheets: [
      {
        properties: { title: 'Spending' },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Tanggal' } },
              { userEnteredValue: { stringValue: 'Tipe' } },
              { userEnteredValue: { stringValue: 'Kategori' } },
              { userEnteredValue: { stringValue: 'Keterangan' } },
              { userEnteredValue: { stringValue: 'Nominal' } },
              { userEnteredValue: { stringValue: 'Metode' } }
            ]
          }]
        }]
      },
      {
        properties: { title: 'Tasks' },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Deadline' } },
              { userEnteredValue: { stringValue: 'Judul' } },
              { userEnteredValue: { stringValue: 'Kategori' } },
              { userEnteredValue: { stringValue: 'Prioritas' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'Catatan' } }
            ]
          }]
        }]
      },
      {
        properties: { title: 'Workiez' },
        data: [{
          startRow: 0,
          startColumn: 0,
          rowData: [{
            values: [
              { userEnteredValue: { stringValue: 'ID' } },
              { userEnteredValue: { stringValue: 'Tanggal' } },
              { userEnteredValue: { stringValue: 'Perusahaan' } },
              { userEnteredValue: { stringValue: 'Posisi' } },
              { userEnteredValue: { stringValue: 'Lokasi' } },
              { userEnteredValue: { stringValue: 'Status' } },
              { userEnteredValue: { stringValue: 'Catatan' } }
            ]
          }]
        }]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gagal membuat berkas spreadsheet baru.');

  return data.spreadsheetId;
}

// 4. Deteksi apakah berkas sudah ada di Google Drive pengguna, buat jika belum ada
export async function findOrCreateMyJaxSheet(accessToken, userName = 'User') {
  const fileTitle = `MY JAX - Personal Data ${userName}`.trim();
  const query = encodeURIComponent(`name = '${fileTitle}' and trashed = false and mimeType = 'application/vnd.google-apps.spreadsheet'`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const res = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gagal mencari berkas di Google Drive.');

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  return await createInitialSpreadsheet(accessToken, userName);
}

// 5. Helper untuk Mengambil Seluruh Baris dari Tab Sheet Tertentu
export async function fetchSheetData(sheetName) {
  const token = localStorage.getItem('jax_google_token');
  const sheetId = localStorage.getItem('jax_user_sheet_id');
  if (!token || !sheetId) return [];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}!A2:Z`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (handleAuthError(res)) return [];
  const data = await res.json();
  if (!res.ok) return [];

  return data.values || [];
}

// 6. Helper untuk Menambahkan Baris Data Baru ke Tab Sheet
export async function appendRowToSheet(sheetName, rowArray) {
  const token = localStorage.getItem('jax_google_token');
  const sheetId = localStorage.getItem('jax_user_sheet_id');
  if (!token || !sheetId) {
    throw new Error('Sesi akun tidak aktif atau Sheet ID belum terpasang.');
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: `${sheetName}!A1`,
      majorDimension: 'ROWS',
      values: [rowArray]
    })
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gagal menyimpan ke Google Sheet.');

  return data;
}

// 7. Helper untuk Memperbarui Baris Tertentu Berdasarkan ID Unik (Kolom A)
export async function updateRowInSheet(sheetName, uniqueId, newRowArray) {
  const token = localStorage.getItem('jax_google_token');
  const spreadsheetId = localStorage.getItem('jax_user_sheet_id');
  if (!token || !spreadsheetId) throw new Error('Sesi akun tidak aktif.');

  const rows = await fetchSheetData(sheetName);
  const rowIndex = rows.findIndex(r => String(r[0]) === String(uniqueId));

  if (rowIndex === -1) {
    throw new Error(`Data dengan ID ${uniqueId} tidak ditemukan.`);
  }

  // Baris 1 adalah header, data dimulai dari baris 2
  const actualRowNumber = rowIndex + 2;
  const encodedSheet = encodeURIComponent(sheetName);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheet}!A${actualRowNumber}:Z${actualRowNumber}?valueInputOption=USER_ENTERED`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range: `${sheetName}!A${actualRowNumber}:Z${actualRowNumber}`,
      majorDimension: 'ROWS',
      values: [newRowArray]
    })
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gagal memperbarui baris.');

  return data;
}

// 8. Helper untuk Menghapus Baris Berdasarkan ID Unik (Kolom A)
export async function deleteRowInSheet(sheetName, uniqueId) {
  const token = localStorage.getItem('jax_google_token');
  const spreadsheetId = localStorage.getItem('jax_user_sheet_id');
  if (!token || !spreadsheetId) throw new Error('Sesi akun tidak aktif.');

  const rows = await fetchSheetData(sheetName);
  const rowIndex = rows.findIndex(r => String(r[0]) === String(uniqueId));

  if (rowIndex === -1) {
    throw new Error(`Data dengan ID ${uniqueId} tidak ditemukan.`);
  }

  // Row index di sheets API berbasis 0: row 1 (header) = 0, row 2 (data pertama) = 1
  const sheetIndex0 = rowIndex + 1;
  const gid = await getSheetIdByName(token, spreadsheetId, sheetName);

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: gid,
              dimension: 'ROWS',
              startIndex: sheetIndex0,
              endIndex: sheetIndex0 + 1
            }
          }
        }
      ]
    })
  });

  if (handleAuthError(res)) throw new Error('Sesi kedaluwarsa.');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Gagal menghapus baris dari Google Sheets.');

  return data;
}