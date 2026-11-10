const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/habits', require('./habits'));
router.use('/calendar', require('./calendar'));
router.use('/statistics', require('./statistics'));
router.use('/categories', require('./categories'));
router.use('/reminders', require('./reminders'));

module.exports = router;
