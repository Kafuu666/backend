'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habits', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      name: { type: Sequelize.STRING(150), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      icon: { type: Sequelize.STRING(50), allowNull: true },
      frequency: { type: Sequelize.ENUM('DAILY', 'WEEKLY'), allowNull: false, defaultValue: 'DAILY' },
      target_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      reminder_time: { type: Sequelize.TIME, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('habits', ['user_id', 'is_active'], { name: 'idx_habits_user_active' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habits');
  },
};
