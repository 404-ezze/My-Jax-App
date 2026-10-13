export function runNotificationEngine({ tasks = [], transactions = [], workiez = [], monthlyBudget = 0 }) {
  const alerts = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Pengingat Jadwal Makan (Siang 12:00 & Malam 18:00)
  const currentHour = now.getHours();
  const todayMeals = transactions.filter(t => {
    const isToday = String(t[1] || '').startsWith(todayStr);
    const cat = String(t[3] || '').toLowerCase();
    const item = String(t[4] || '').toLowerCase();
    return isToday && (cat.includes('pokok') || cat.includes('makan') || item.includes('makan') || item.includes('siang') || item.includes('malam'));
  });

  if (currentHour >= 12 && currentHour < 15 && todayMeals.length === 0) {
    alerts.push({
      id: 'lunch-reminder',
      type: 'warning',
      category: 'Waktunya Makan Siang!',
      desc: 'Sudah lewat jam 12:00 dan belum ada catatan makan siang hari ini. Jangan lupa makan dan istirahat ya!'
    });
  }

  if (currentHour >= 18 && currentHour < 22 && todayMeals.length < 2) {
    alerts.push({
      id: 'dinner-reminder',
      type: 'warning',
      category: 'Waktunya Makan Malam!',
      desc: 'Sudah jam 18:00 ke atas. Yuk makan malam dan catat pengeluaranmu. Selamat beristirahat setelah seharian beraktivitas!'
    });
  }

  // 2. Peringatan Batas Budget Harian
  const dailyBudget = Number(localStorage.getItem('jax_daily_budget') || 100000);
  const todayExpense = transactions
    .filter(t => {
      if (!t || !t[1] || t[2] !== 'Expense') return false;
      const d = new Date(t[1]);
      return !isNaN(d.getTime()) && d.toISOString().split('T')[0] === todayStr;
    })
    .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);

  if (dailyBudget > 0 && todayExpense > dailyBudget) {
    alerts.push({
      id: `daily-overbudget-${todayStr}`,
      type: 'danger',
      category: 'Overbudget Harian Terdeteksi',
      desc: `Pengeluaran hari ini telah menyentuh Rp ${todayExpense.toLocaleString('id-ID')}, melewati batas harian Anda.`
    });
  }

  // 3. Peringatan Overbudget Bulanan / Hampir Habis
  const currentMonthExpense = transactions
    .filter(t => {
      if (!t || !t[1] || t[2] !== 'Expense') return false;
      const d = new Date(t[1]);
      return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, curr) => acc + Number(curr[5] || 0), 0);

  if (monthlyBudget > 0) {
    const usagePercent = Math.round((currentMonthExpense / monthlyBudget) * 100);
    if (usagePercent >= 100) {
      alerts.push({
        id: 'budget-exceeded',
        type: 'danger',
        category: 'Batas Anggaran Terlampaui (Overbudget)',
        desc: `Pengeluaran bulan ini mencapai Rp ${currentMonthExpense.toLocaleString('id-ID')} (${usagePercent}% dari batas bulanan).`
      });
    } else if (usagePercent >= 80) {
      alerts.push({
        id: 'budget-warning',
        type: 'warning',
        category: 'Peringatan Pemakaian Anggaran',
        desc: `Pemakaian kas sudah mencapai ${usagePercent}% dari batas bulanan.`
      });
    }
  }

  // 4. Pengingat Tenggat Tugas (H-7 dan H-3)
  tasks.forEach((task, idx) => {
    const status = String(task[5] || '').toLowerCase();
    if (status === 'completed' || !task[1]) return;

    const dueDate = new Date(task[1]);
    if (isNaN(dueDate.getTime())) return;

    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    const title = task[2] || `Tugas #${idx + 1}`;

    if (diffDays === 7 || diffDays === 3) {
      alerts.push({
        id: `task-deadline-${idx}`,
        type: diffDays === 3 ? 'danger' : 'info',
        category: 'Tasks',
        title: `Tenggat Tugas (H-${diffDays})`,
        desc: `"${title}" jatuh tempo dalam ${diffDays} hari lagi.`
      });
    }
  });

  // 5. Follow-up Lamaran Kerja > 30 Hari (Workiez)
  workiez.forEach((job, idx) => {
    const status = String(job[3] || '').toLowerCase();
    const applyDate = new Date(job[1]);
    if (isNaN(applyDate.getTime())) return;

    const daysPassed = Math.floor((now - applyDate) / (1000 * 60 * 60 * 24));
    if (daysPassed > 30 && (status.includes('applied') || status.includes('menunggu') || status.includes('review'))) {
      alerts.push({
        id: `job-followup-${idx}`,
        type: 'info',
        category: 'Follow-up Lamaran Kerja (> 30 Hari)',
        desc: `Lamaran di ${job[2] || 'Perusahaan'} sudah ${daysPassed} hari tanpa kabar. Disarankan follow-up atau arsipkan.`
      });
    }
  });

  // 6. Pengingat Jatuh Tempo Langganan (Subs Tracker: H-3 s.d. Hari-H)
  try {
    const subscriptions = JSON.parse(localStorage.getItem('jax_subscriptions') || '[]');
    const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    subscriptions.forEach((sub) => {
      if (sub.lastPaidMonth === currentMonthKey || !sub.tanggalTagihan) return;

      const subDate = new Date(sub.tanggalTagihan);
      const dueThisMonth = new Date(currentYear, currentMonth, subDate.getDate() || 1);

      const diffDays = Math.ceil((dueThisMonth - todayZero) / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 3) {
        const timeDesc = diffDays === 0 ? 'hari ini' : `${diffDays} hari lagi`;
        alerts.push({
          id: `subs-due-${sub.id}-${currentMonthKey}`,
          type: diffDays <= 1 ? 'danger' : 'warning',
          category: 'Tagihan Subs Tracker',
          desc: `Tagihan ${sub.nama} (Rp ${Number(sub.biaya || 0).toLocaleString('id-ID')}) jatuh tempo ${timeDesc}. Pastikan saldo di ${sub.metodeBayar || 'rekening'} mencukupi!`
        });
      }
    });
  } catch (e) {
    console.error('Gagal mengecek notifikasi subs:', e);
  }

  return alerts;
}