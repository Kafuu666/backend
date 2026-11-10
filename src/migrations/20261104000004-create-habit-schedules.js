'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('habit_schedules', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      habit_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'habits', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      // 1 = Senin ... 7 = Minggu
      day_of_week: { type: Sequelize.TINYINT, allowNull: false },
    });
    await queryInterface.addIndex('habit_schedules', ['habit_id', 'day_of_week'], {
      unique: true,
      name: 'uq_habit_schedules_habit_day',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('habit_schedules');
  },
};
