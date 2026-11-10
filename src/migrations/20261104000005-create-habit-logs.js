'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habit_logs', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      habit_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'habits', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      log_date: { type: Sequelize.DATEONLY, allowNull: false },
      completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
    });
    // Satu kebiasaan hanya punya satu log per tanggal (mencegah log ganda)
    await queryInterface.addIndex('habit_logs', ['habit_id', 'log_date'], {
      unique: true,
      name: 'uq_habit_logs_habit_date',
    });
    await queryInterface.addIndex('habit_logs', ['user_id', 'log_date'], { name: 'idx_habit_logs_user_date' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habit_logs');
  },
};
