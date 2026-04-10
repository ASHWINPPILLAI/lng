document.addEventListener('DOMContentLoaded', () => {
    // ── Configuration ────────────────────────────────────────────────────────
    const path = window.location.pathname;
    const isDashboard = path.endsWith('index.html') || path.endsWith('/');
    const isUsagePage = path.endsWith('usage.html');
    const isRefillPage = path.endsWith('refills.html');

    // ── Common Elements ──────────────────────────────────────────────────────
    const currentUsageEl = document.getElementById('currentUsage');
    const avgUsageEl = document.getElementById('avgUsage');
    const nextRefillEl = document.getElementById('nextRefill');
    const daysLeftEl = document.getElementById('daysLeft');

    // ── Page Specific Elements ───────────────────────────────────────────────
    const usageTableBody = document.getElementById('usageTableBody');
    const refillTableBody = document.getElementById('refillTableBody');
    const recentUsageEl = document.getElementById('recentUsage');
    const recentRefillsEl = document.getElementById('recentRefills');
    const totalMonthlyUsageEl = document.getElementById('totalMonthlyUsage');
    const refillFrequencyEl = document.getElementById('refillFrequency');

    const usageForm = document.getElementById('usageForm');
    const refillForm = document.getElementById('refillForm');

    // ── Data Fetching ────────────────────────────────────────────────────────
    async function fetchData() {
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            updateAllViews(data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    function updateAllViews(data) {
        const { dailyUsage, refillDates, averageDailyUsage, estimatedNextRefillDate } = data;

        // 1. Update Common Dashboard Cards (if on index.html)
        if (isDashboard) {
            const latest = dailyUsage.length > 0 ? dailyUsage[dailyUsage.length - 1].amount : '--';
            currentUsageEl.innerHTML = `${latest} <span class="text-lg font-normal text-slate-400">kg</span>`;
            avgUsageEl.innerHTML = `${averageDailyUsage} <span class="text-lg font-normal text-slate-400">kg</span>`;
            
            const bar = document.getElementById('avgUsageBar');
            if(bar) bar.style.width = Math.min((averageDailyUsage / 2.0) * 100, 100) + '%';

            nextRefillEl.textContent = estimatedNextRefillDate ? formatDate(estimatedNextRefillDate) : 'N/A';

            if (estimatedNextRefillDate) {
                const diffDays = calculateDaysRemaining(estimatedNextRefillDate);
                daysLeftEl.textContent = diffDays > 0 ? diffDays : (diffDays === 0 ? 'Today' : 'Overdue');
                daysLeftEl.classList.toggle('text-rose-500', diffDays <= 3);
            }

            // Recent Summaries
            renderRecentLists(dailyUsage, refillDates);
        }

        // 2. Update Usage Page
        if (isUsagePage) {
            renderUsageTable(dailyUsage);
            if(totalMonthlyUsageEl) {
                const monthlyTotal = dailyUsage.reduce((sum, e) => sum + e.amount, 0);
                totalMonthlyUsageEl.textContent = `Total Consumed: ${monthlyTotal.toFixed(1)} kg`;
            }
        }

        // 3. Update Refill Page
        if (isRefillPage) {
            renderRefillTable(refillDates);
            if(refillFrequencyEl && refillDates.length > 1) {
                const avgDays = calculateAvgRefillInterval(refillDates);
                refillFrequencyEl.textContent = `Avg Frequency: ${avgDays} days`;
            }
        }
    }

    // ── Render Helpers ───────────────────────────────────────────────────────
    function renderUsageTable(usage) {
        if (!usageTableBody) return;
        usageTableBody.innerHTML = usage.length ? '' : '<tr><td colspan="4" class="px-8 py-10 text-center text-slate-400">No records.</td></tr>';
        
        usage.slice().reverse().forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-8 py-4 font-medium text-slate-700">${formatDate(entry.date)}</td>
                <td class="px-8 py-4"><span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">${entry.amount} kg</span></td>
                <td class="px-8 py-4 text-emerald-600 font-medium">Logged</td>
                <td class="px-8 py-4 text-right"><button class="text-slate-300 hover:text-slate-600">Edit</button></td>
            `;
            usageTableBody.appendChild(row);
        });
    }

    function renderRefillTable(refills) {
        if (!refillTableBody) return;
        refillTableBody.innerHTML = refills.length ? '' : '<tr><td colspan="3" class="px-8 py-10 text-center text-slate-400">No refills.</td></tr>';
        
        refills.slice().reverse().forEach((date, index, arr) => {
            let intervalText = '--';
            if (index < arr.length - 1) {
                const d1 = new Date(date);
                const d2 = new Date(arr[index + 1]);
                const diff = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
                intervalText = `${diff} days`;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-8 py-4 font-medium text-slate-700">${formatDate(date)}</td>
                <td class="px-8 py-4 text-slate-500">${intervalText}</td>
                <td class="px-8 py-4 text-right text-emerald-600 font-bold uppercase text-xs">Completed</td>
            `;
            refillTableBody.appendChild(row);
        });
    }

    function renderRecentLists(usage, refills) {
        if (recentUsageEl) {
            recentUsageEl.innerHTML = '';
            usage.slice(-3).reverse().forEach(e => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between p-3 bg-slate-50 rounded-xl';
                div.innerHTML = `<span class="text-sm font-medium">${formatDate(e.date)}</span> <span class="font-bold text-blue-600">${e.amount} kg</span>`;
                recentUsageEl.appendChild(div);
            });
        }
        if (recentRefillsEl) {
            recentRefillsEl.innerHTML = '';
            refills.slice(-2).reverse().forEach(d => {
                const div = document.createElement('div');
                div.className = 'flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold';
                div.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg> <span>${formatDate(d)}</span>`;
                recentRefillsEl.appendChild(div);
            });
        }
    }

    // ── Utils ────────────────────────────────────────────────────────────────
    function formatDate(dateStr) {
        return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    function calculateDaysRemaining(targetDate) {
        return Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
    }

    function calculateAvgRefillInterval(refills) {
        if (refills.length < 2) return 0;
        const sorted = refills.sort((a,b) => new Date(a) - new Date(b));
        const diffs = [];
        for(let i=1; i<sorted.length; i++) {
            diffs.push((new Date(sorted[i]) - new Date(sorted[i-1])) / (1000 * 60 * 60 * 24));
        }
        return Math.round(diffs.reduce((a,b) => a+b, 0) / diffs.length);
    }

    // ── Form Handlers ────────────────────────────────────────────────────────
    if (usageForm) {
        usageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('usageDate').value;
            const amount = parseFloat(document.getElementById('usageAmount').value);
            const res = await fetch('/api/usage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date, amount }) });
            if (res.ok) { usageForm.reset(); if(window.toggleModal) toggleModal('usageModal'); fetchData(); }
        });
    }

    if (refillForm) {
        refillForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const date = document.getElementById('refillDate').value;
            const res = await fetch('/api/refill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date }) });
            if (res.ok) { refillForm.reset(); fetchData(); }
        });
    }

    // ── Init ─────────────────────────────────────────────────────────────
    fetchData();
});
