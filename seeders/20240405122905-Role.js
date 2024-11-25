module.exports = {
  async up (queryInterface) {
    await queryInterface.bulkInsert(
      'Roles',
      [
        {
          key: 'admin',
          title: 'Admin',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
        {
          key: 'user',
          title: 'User',
          createdAt: '2024-04-05 18:03:00.000+05:30',
          updatedAt: '2024-04-05 18:03:00.000+05:30',
        },
      ],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
