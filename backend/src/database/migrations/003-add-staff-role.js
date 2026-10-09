export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'role', {
    type: Sequelize.ENUM('admin', 'editor', 'staff', 'user'),
    allowNull: false,
    defaultValue: 'user'
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'role', {
    type: Sequelize.ENUM('admin', 'editor', 'user'),
    allowNull: false,
    defaultValue: 'user'
  });
}
