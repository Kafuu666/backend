// Semua tanggal diperlakukan sebagai string "YYYY-MM-DD" (tanggal kalender, tanpa jam)
// agar perhitungan tidak terpengaruh zona waktu server.

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

const parseUTC = (s) => new Date(`${s}T00:00:00Z`);
const formatUTC = (d) => d.toISOString().slice(0, 10);

function isValidDateStr(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = parseUTC(s);
  return !Number.isNaN(d.getTime()) && formatUTC(d) === s;
}

const isValidMonthStr = (s) => typeof s === 'string' && MONTH_RE.test(s);

function addDays(s, n) {
  const d = parseUTC(s);
  d.setUTCDate(d.getUTCDate() + n);
  return formatUTC(d);
}

// 1 = Senin ... 7 = Minggu
function dayOfWeek(s) {
  const d = parseUTC(s).getUTCDay(); // 0 = Minggu
  return d === 0 ? 7 : d;
}

// Mengubah objek Date (instan waktu) menjadi tanggal kalender pada zona waktu tertentu
function toDateString(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

const todayIn = (timeZone) => toDateString(new Date(), timeZone);

function eachDay(from, to) {
  const days = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  return days;
}

function monthRange(month) {
  const from = `${month}-01`;
  const [y, m] = month.split('-').map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { from, to: `${month}-${String(last).padStart(2, '0')}` };
}

// Mengambil "YYYY-MM-DD" dari nilai DATEONLY. Umumnya sudah berupa string; bila driver
// mengembalikan Date, nilainya adalah tengah malam UTC sehingga dibaca dengan UTC.
function normalizeDate(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  return formatUTC(value);
}

const trimTime = (t) => (t ? String(t).slice(0, 5) : null);

module.exports = {
  isValidDateStr,
  isValidMonthStr,
  addDays,
  dayOfWeek,
  toDateString,
  todayIn,
  eachDay,
  monthRange,
  normalizeDate,
  trimTime,
};
