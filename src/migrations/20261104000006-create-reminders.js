'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reminders', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      habit_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'habits', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      reminder_time: { type: Sequelize.TIME, allowNull: false },
      is_enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    });
    await queryInterface.addIndex('reminders', ['habit_id'], { name: 'idx_reminders_habit' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('reminders');
  },
};
