const router = require('express').Router();
const controller = require('../controllers/calendarController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators');

router.use(auth);

router.get('/', validate(v.calendarQuery, 'query'), controller.month);
router.get('/:date', validate(v.dateParam, 'params'), controller.day);

module.exports = router;
