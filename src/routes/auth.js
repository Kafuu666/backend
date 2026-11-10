const router = require('express').Router();
const controller = require('../controllers/authController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators');

router.post('/register', validate(v.register), controller.register);
router.post('/login', validate(v.login), controller.login);
router.get('/me', auth, controller.me);
router.post('/logout', auth, controller.logout);

module.exports = router;
