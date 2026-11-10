const router = require('express').Router();
const controller = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const v = require('../validators');

router.use(auth);

router.get('/', controller.list);
router.post('/', validate(v.createCategory), controller.create);
router.put('/:id', validate(v.idParam, 'params'), validate(v.updateCategory), controller.update);
router.delete('/:id', validate(v.idParam, 'params'), controller.remove);

module.exports = router;
