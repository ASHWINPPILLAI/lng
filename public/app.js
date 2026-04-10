document.addEventListener('DOMContentLoaded', () => {
    // ── UI Elements ──────────────────────────────────────────────────────────
    const currentUsageEl = document.getElementById('currentUsage');
    const avgUsageEl = document.getElementById('avgUsage');
    const nextRefillEl = document.getElementById('nextRefill');
    const daysLeftEl = document.getElementById('daysLeft');
    const usageListEl = document.getElementById('usageList');
    const refillListEl = document.getElementById('refillList');

    const usageForm = document.getElementById('usageForm');
    const refillForm = document.getElementById('refillForm');

    // ── API Fetching ────────────────────────────────────────────────────────
    async function fetchData() {
        try {
            const res = await fetch('/api/data');
            const data = await res.json();
            updateUI(data);
        } catch (err) {
            console.error('Fetch error:', err);
        }
    }

    function updateUI(data) {
        const { dailyUsage, refillDates, averageDailyUsage, estimatedNextRefillDate } = data;

        // Stats
        const latest = dailyUsage.length > 0 ? dailyUsage[dailyUsage.length - 1].amount : '--';
        currentUsageEl.innerHTML = `${latest} <span class="text-lg font-normal text-slate-400">kg</span>`;
        avgUsageEl.innerHTML = `${averageDailyUsage} <span class="text-lg font-normal text-slate-400">kg</span>`;
        nextRefillEl.textContent = estimatedNextRefillDate ? formatDate(estimatedNextRefillDate) : 'N/A';

        // Calculation for Days Left
        if (estimatedNextRefillDate) {
            const today = new Date();
            const target = new Date(estimatedNextRefillDate);
            const diffTime = target - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            daysLeftEl.textContent = diffDays > 0 ? diffDays : (diffDays === 0 ? 'Today' : 'Overdue');
            daysLeftEl.classList.toggle('text-rose-500', diffDays <= 3);
        } else {
            daysLeftEl.textContent = '--';
        }

        // Usage List
        usageListEl.innerHTML = dailyUsage.length ? '' : '<p class="text-slate-400 text-sm italic py-4">No records found...</p>';
        dailyUsage.slice().reverse().forEach(entry => {
            const div = document.createElement('div');
            div.className = 'flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition';
            div.innerHTML = `
                <div>
                    <p class="font-bold text-slate-800">${entry.amount} kg</p>
                    <p class="text-xs text-slate-400 font-medium">${formatDate(entry.date)}</p>
                </div>
                <div class="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
            `;
            usageListEl.appendChild(div);
        });

        // Refill List
        refillListEl.innerHTML = refillDates.length ? '' : '<p class="text-slate-400 text-sm italic">No refills recorded.</p>';
        refillDates.slice().reverse().forEach(date => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100';
            div.innerHTML = `
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span>${formatDate(date)}</span>
            `;
            refillListEl.appendChild(div);
        });
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // ── Form Submissions ────────────────────────────────────────────────────
    usageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('usageDate').value;
        const amount = parseFloat(document.getElementById('usageAmount').value);

        const res = await fetch('/api/usage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, amount })
        });

        if (res.ok) {
            usageForm.reset();
            document.getElementById('usageModal').classList.add('hidden');
            fetchData();
        }
    });

    refillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = document.getElementById('refillDate').value;

        const res = await fetch('/api/refill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date })
        });

        if (res.ok) {
            refillForm.reset();
            fetchData();
        }
    });

    // ── Initial Load ────────────────────────────────────────────────────────
    fetchData();
});
