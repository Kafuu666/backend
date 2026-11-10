const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isValidDateStr,
  isValidMonthStr,
  addDays,
  dayOfWeek,
  eachDay,
  monthRange,
  toDateString,
  trimTime,
} = require('../src/utils/date');

test('isValidDateStr menolak tanggal yang tidak ada di kalender', () => {
  assert.equal(isValidDateStr('2026-11-04'), true);
  assert.equal(isValidDateStr('2026-02-30'), false);
  assert.equal(isValidDateStr('2026-13-01'), false);
  assert.equal(isValidDateStr('04-11-2026'), false);
});

test('isValidMonthStr', () => {
  assert.equal(isValidMonthStr('2026-11'), true);
  assert.equal(isValidMonthStr('2026-13'), false);
});

test('addDays melewati batas bulan dan tahun', () => {
  assert.equal(addDays('2026-11-30', 1), '2026-12-01');
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
});

test('dayOfWeek: 1 = Senin ... 7 = Minggu', () => {
  assert.equal(dayOfWeek('2026-11-02'), 1); // Senin
  assert.equal(dayOfWeek('2026-11-04'), 3); // Rabu
  assert.equal(dayOfWeek('2026-11-08'), 7); // Minggu
});

test('eachDay dan monthRange', () => {
  assert.deepEqual(eachDay('2026-11-29', '2026-12-01'), ['2026-11-29', '2026-11-30', '2026-12-01']);
  assert.deepEqual(monthRange('2026-02'), { from: '2026-02-01', to: '2026-02-28' });
  assert.deepEqual(monthRange('2028-02'), { from: '2028-02-01', to: '2028-02-29' });
});

test('toDateString memakai zona waktu yang diminta', () => {
  const instant = new Date('2026-11-04T18:30:00Z'); // sudah 5 Nov di Jakarta (UTC+7)
  assert.equal(toDateString(instant, 'Asia/Jakarta'), '2026-11-05');
  assert.equal(toDateString(instant, 'UTC'), '2026-11-04');
});

test('trimTime memotong detik', () => {
  assert.equal(trimTime('19:00:00'), '19:00');
  assert.equal(trimTime(null), null);
});
