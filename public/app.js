document.addEventListener('DOMContentLoaded', () => {
    // ── Configuration ────────────────────────────────────────────────────────
    const path = window.location.pathname;
    const isDashboard = path.endsWith('index.html') || path.endsWith('/');
    const isUsagePage = path.endsWith('usage.html');
    const isRefillPage = path.endsWith('refills.html');

    let usageChart = null;

    // ── Elements ─────────────────────────────────────────────────────────────
    const currentUsageEl = document.getElementById('currentUsage');
    const avgUsageEl = document.getElementById('avgUsage');
    const nextRefillEl = document.getElementById('nextRefill');
    const daysLeftEl = document.getElementById('daysLeft');
    const usageTableBody = document.getElementById('usageTableBody');
    const refillTableBody = document.getElementById('refillTableBody');
    const recentUsageEl = document.getElementById('recentUsage');
    const recentRefillsEl = document.getElementById('recentRefills');
    const totalMonthlyUsageEl = document.getElementById('totalMonthlyUsage');
    const refillFrequencyEl = document.getElementById('refillFrequency');

    const usageForm = document.getElementById('usageForm');
    const refillForm = document.getElementById('refillForm');

    async function fetchData() {
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            updateUI(data);
        } catch (err) { console.error('API Error:', err); }
    }

    function updateUI(data) {
        const { dailyUsage, refillDates, averageDailyUsage, estimatedNextRefillDate } = data;

        // 1. DASHBOARD LOGIC
        if (isDashboard) {
            const latest = dailyUsage.length > 0 ? dailyUsage[dailyUsage.length - 1].amount : '--';
            currentUsageEl.innerHTML = `${latest} <span class="text-lg font-normal text-slate-400">kg</span>`;
            avgUsageEl.innerHTML = `${averageDailyUsage} <span class="text-lg font-normal text-slate-400">kg</span>`;
            nextRefillEl.textContent = estimatedNextRefillDate ? formatDate(estimatedNextRefillDate) : 'N/A';

            if (estimatedNextRefillDate) {
                const diff = calculateDaysRemaining(estimatedNextRefillDate);
                daysLeftEl.textContent = diff > 0 ? diff : (diff === 0 ? 'Today' : 'Overdue');
                daysLeftEl.classList.toggle('text-rose-500', diff <= 3);
            }

            renderChart(dailyUsage);
            renderRecentLists(dailyUsage, refillDates);
        }

        // 2. USAGE PAGE LOGIC
        if (isUsagePage) {
            renderUsageTable(dailyUsage);
            const monthlyTotal = dailyUsage.reduce((sum, e) => sum + e.amount, 0);
            if (totalMonthlyUsageEl) totalMonthlyUsageEl.textContent = `Total Consumed: ${monthlyTotal.toFixed(1)} kg`;
        }

        // 3. REFILL PAGE LOGIC
        if (isRefillPage) {
            renderRefillTable(refillDates);
            if (refillFrequencyEl && refillDates.length > 1) {
                const avgDays = calculateAvgRefillInterval(refillDates);
                refillFrequencyEl.textContent = `Avg Frequency: ${avgDays} days`;
            }
        }
    }

    function renderChart(usageData) {
        const ctx = document.getElementById('usageChart');
        if (!ctx) return;
        if (usageChart) usageChart.destroy();

        const labels = usageData.slice(-7).map(e => formatDate(e.date));
        const values = usageData.slice(-7).map(e => e.amount);

        usageChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Daily Consumption (kg)',
                    data: values,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#2563eb'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    function renderUsageTable(usage) {
        if (!usageTableBody) return;
        usageTableBody.innerHTML = usage.length ? '' : '<tr><td colspan="4" class="p-8 text-center">No logs.</td></tr>';
        usage.slice().reverse().forEach(e => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="px-8 py-4 font-medium">${formatDate(e.date)}</td><td class="px-8 py-4"><span class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">${e.amount} kg</span></td><td class="px-8 py-4 text-emerald-600">Logged</td><td class="px-8 py-4 text-right">...</td>`;
            usageTableBody.appendChild(tr);
        });
    }

    function renderRefillTable(refills) {
        if (!refillTableBody) return;
        refillTableBody.innerHTML = refills.length ? '' : '<tr><td colspan="3" class="p-8 text-center">No refills.</td></tr>';
        refills.slice().reverse().forEach((d, i, arr) => {
            let interval = '--';
            if (i < arr.length - 1) {
                interval = `${Math.floor((new Date(d) - new Date(arr[i+1])) / (1000*60*60*24))} days`;
            }
            const tr = document.createElement('tr');
            tr.innerHTML = `<td class="px-8 py-4 font-medium">${formatDate(d)}</td><td class="px-8 py-4">${interval}</td><td class="px-8 py-4 text-emerald-600 font-bold px-8 text-right uppercase text-xs">Completed</td>`;
            refillTableBody.appendChild(tr);
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

    function formatDate(d) { return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
    function calculateDaysRemaining(t) { return Math.ceil((new Date(t) - new Date()) / (86400000)); }
    function calculateAvgRefillInterval(r) {
        if (r.length < 2) return 0;
        const sorted = r.sort((a,b) => new Date(a) - new Date(b));
        let total = 0;
        for(let i=1; i<sorted.length; i++) total += (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
        return Math.round(total / (sorted.length - 1));
    }

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

    fetchData();
});
