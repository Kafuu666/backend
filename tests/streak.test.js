const test = require('node:test');
const assert = require('node:assert/strict');
const { computeStreak } = require('../src/utils/streak');

const ALL = new Set([1, 2, 3, 4, 5, 6, 7]);
const set = (...d) => new Set(d);

test('streak harian: hari ini belum selesai tidak memutus streak', () => {
  const r = computeStreak({
    scheduledDays: ALL,
    completedDates: set('2026-11-01', '2026-11-02', '2026-11-03'),
    startDate: '2026-11-01',
    today: '2026-11-04',
  });
  assert.deepEqual(r, { current: 3, best: 3 });
});

test('streak bertambah bila hari ini selesai', () => {
  const r = computeStreak({
    scheduledDays: ALL,
    completedDates: set('2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04'),
    startDate: '2026-11-01',
    today: '2026-11-04',
  });
  assert.deepEqual(r, { current: 4, best: 4 });
});

test('hari terlewat memutus streak, best tetap tersimpan', () => {
  const r = computeStreak({
    scheduledDays: ALL,
    completedDates: set('2026-11-01', '2026-11-02', '2026-11-03', '2026-11-05'),
    startDate: '2026-11-01',
    today: '2026-11-05',
  });
  assert.deepEqual(r, { current: 1, best: 3 });
});

test('hari yang tidak dijadwalkan tidak memutus streak (Sen, Rab, Jum)', () => {
  // 2 Nov = Senin, 4 Nov = Rabu, 6 Nov = Jumat
  const r = computeStreak({
    scheduledDays: set(1, 3, 5),
    completedDates: set('2026-11-02', '2026-11-04', '2026-11-06'),
    startDate: '2026-11-01',
    today: '2026-11-07', // Sabtu, tidak dijadwalkan
  });
  assert.deepEqual(r, { current: 3, best: 3 });
});

test('kebiasaan baru yang dimulai di masa depan menghasilkan 0', () => {
  const r = computeStreak({
    scheduledDays: ALL,
    completedDates: set(),
    startDate: '2026-11-10',
    today: '2026-11-04',
  });
  assert.deepEqual(r, { current: 0, best: 0 });
});
