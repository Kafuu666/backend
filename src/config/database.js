const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const cfg = configs[env] || configs.development;

const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, cfg);

module.exports = sequelize;
