export async function up(queryInterface, Sequelize) {
  await queryInterface.changeColumn('users', 'status', {
    type: Sequelize.ENUM('active', 'inactive', 'invited'),
    allowNull: false,
    defaultValue: 'active'
  });

  await queryInterface.createTable('user_invitations', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    created_by: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    token_hash: {
      type: Sequelize.STRING(64),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: Sequelize.DATE,
      allowNull: false
    },
    used_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal(
        'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      )
    }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('user_invitations');

  await queryInterface.bulkUpdate(
    'users',
    { status: 'inactive' },
    { status: 'invited' }
  );

  await queryInterface.changeColumn('users', 'status', {
    type: Sequelize.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  });
}