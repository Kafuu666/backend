const router = require('express').Router();
const controller = require('../controllers/habitController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators');

router.use(auth);

// PENTING: rute /logs harus didaftarkan sebelum /:id agar "logs" tidak dianggap sebagai id
router.get('/logs/today', controller.today);
router.get('/logs', validate(v.historyQuery, 'query'), controller.history);

router.get('/', validate(v.listHabits, 'query'), controller.list);
router.post('/', validate(v.createHabit), controller.create);
router.get('/:id', validate(v.idParam, 'params'), controller.get);
router.put('/:id', validate(v.idParam, 'params'), validate(v.updateHabit), controller.update);
router.delete('/:id', validate(v.idParam, 'params'), controller.remove);

router.post('/:id/complete', validate(v.idParam, 'params'), validate(v.completeBody), controller.complete);
router.delete(
  '/:id/complete',
  validate(v.idParam, 'params'),
  validate(v.uncompleteQuery, 'query'),
  controller.uncomplete
);

module.exports = router;
