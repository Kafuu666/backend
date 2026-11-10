const ApiError = require('../utils/ApiError');

const messages = {
  'any.required': '{{#label}} wajib diisi',
  'string.empty': '{{#label}} tidak boleh kosong',
  'string.base': '{{#label}} harus berupa teks',
  'string.min': '{{#label}} minimal {{#limit}} karakter',
  'string.max': '{{#label}} maksimal {{#limit}} karakter',
  'string.email': 'Format email tidak valid',
  'string.pattern.base': 'Format {{#label}} tidak valid',
  'number.base': '{{#label}} harus berupa angka',
  'number.min': '{{#label}} minimal {{#limit}}',
  'number.max': '{{#label}} maksimal {{#limit}}',
  'any.only': 'Nilai {{#label}} tidak valid',
  'array.min': '{{#label}} minimal berisi {{#limit}} item',
  'array.unique': '{{#label}} tidak boleh berisi nilai ganda',
  'object.min': 'Minimal satu field harus diisi',
};

/**
 * Validasi request dengan Joi. Hasil validasi (sudah dikonversi/dibersihkan) tersedia di
 * req.valid.body / req.valid.query / req.valid.params.
 */
const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const { value, error } = schema.validate(req[source] || {}, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
      messages,
      errors: { wrap: { label: false } },
    });
    if (error) {
      const details = error.details.map((d) => ({ field: d.path.join('.'), message: d.message }));
      return next(new ApiError(422, 'Validasi gagal', details));
    }
    req.valid = req.valid || {};
    req.valid[source] = value;
    return next();
  };

module.exports = validate;
