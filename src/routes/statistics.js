const router = require('express').Router();
const controller = require('../controllers/statisticsController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators');

router.use(auth);

router.get('/overview', controller.overview);
router.get('/weekly', controller.weekly);
router.get('/monthly', validate(v.monthlyQuery, 'query'), controller.monthly);
router.get('/streaks', controller.streaks);

module.exports = router;
