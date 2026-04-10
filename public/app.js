const usageForm = document.getElementById("usageForm");
const refillForm = document.getElementById("refillForm");
const usageModal = document.getElementById("usageModal");
const openUsageModalButton = document.getElementById("openUsageModalButton");
const closeUsageModalButton = document.getElementById("closeUsageModalButton");
const usageMessage = document.getElementById("usageMessage");
const refillMessage = document.getElementById("refillMessage");
const currentUsageCard = document.getElementById("currentUsageCard");
const averageUsageCard = document.getElementById("averageUsageCard");
const estimatedDateCard = document.getElementById("estimatedDateCard");
const daysRemainingCard = document.getElementById("daysRemainingCard");
const refillTableBody = document.getElementById("refillTableBody");
const usageHistoryGrid = document.getElementById("usageHistoryGrid");

function formatDate(dateString) {
  if (!dateString) return "--";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function calculateDaysRemaining(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const targetDate = new Date(dateString);
  today.setHours(0, 0, 0, 0); targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.className = `text-sm ${isError ? "font-medium text-rose-600" : "font-medium text-emerald-600"}`;
}

openUsageModalButton.addEventListener("click", () => { usageModal.classList.remove("hidden"); usageModal.classList.add("flex"); });
closeUsageModalButton.addEventListener("click", () => { usageModal.classList.add("hidden"); usageModal.classList.remove("flex"); });

function renderRefillTable(refillDates) {
  refillTableBody.innerHTML = "";
  if (!refillDates.length) return refillTableBody.innerHTML = `<tr><td colspan="2" class="px-6 py-8 text-center text-sm text-slate-500">No refill history available.</td></tr>`;
  refillDates.slice().reverse().forEach((date, index) => {
    refillTableBody.innerHTML += `<tr class="hover:bg-slate-50 transition"><td class="px-6 py-4 text-sm font-medium text-slate-700">${index + 1}</td><td class="px-6 py-4 text-sm text-slate-600">${formatDate(date)}</td></tr>`;
  });
}

function renderUsageHistory(dailyUsage) {
  usageHistoryGrid.innerHTML = "";
  if (!dailyUsage.length) return usageHistoryGrid.innerHTML = `<div class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">No daily usage records available.</div>`;
  dailyUsage.slice().reverse().forEach(entry => {
    usageHistoryGrid.innerHTML += `<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-brand-200 hover:bg-white"><p class="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Usage Entry</p><p class="mt-3 text-lg font-bold text-slate-900">${entry.amount} kg</p><p class="mt-1 text-sm text-slate-500">${formatDate(entry.date)}</p></div>`;
  });
}

function renderOverview(data) {
  const latestUsage = data.dailyUsage.length ? data.dailyUsage[data.dailyUsage.length - 1].amount : null;
  const daysRemaining = calculateDaysRemaining(data.estimatedNextRefillDate);
  currentUsageCard.textContent = latestUsage !== null ? `${latestUsage} kg` : "-- kg";
  averageUsageCard.textContent = data.averageDailyUsage ? `${data.averageDailyUsage} kg` : "-- kg";
  estimatedDateCard.textContent = data.estimatedNextRefillDate ? formatDate(data.estimatedNextRefillDate) : "--";
  daysRemainingCard.textContent = daysRemaining === null ? "-- days" : (daysRemaining < 0 ? "Due now" : `${daysRemaining} days`);
}

async function loadData() {
  try {
    const response = await fetch("/api/data");
    const data = await response.json();
    renderOverview(data); renderRefillTable(data.refillDates); renderUsageHistory(data.dailyUsage);
  } catch (error) { console.error("Failed to load dashboard data:", error); }
}

usageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const date = document.getElementById("usageDate").value;
  const amount = parseFloat(document.getElementById("usageAmount").value);
  try {
    const response = await fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, amount }) });
    if (!response.ok) throw new Error("Failed to save");
    showMessage(usageMessage, "Usage record saved.");
    usageForm.reset(); await loadData();
    setTimeout(() => { usageModal.classList.add("hidden"); usageModal.classList.remove("flex"); usageMessage.textContent = ""; }, 800);
  } catch (error) { showMessage(usageMessage, "Error saving usage.", true); }
});

refillForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const date = document.getElementById("refillDate").value;
  try {
    const response = await fetch("/api/refill", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date }) });
    if (!response.ok) throw new Error("Failed to save");
    showMessage(refillMessage, "Refill date saved.");
    refillForm.reset(); await loadData();
  } catch (error) { showMessage(refillMessage, "Error saving refill.", true); }
});

loadData();