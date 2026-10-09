function hasTable(tables, tableName) {
  return tables.some((table) => {
    const currentName = typeof table === 'string' ? table : table.tableName;
    return currentName.toLowerCase() === tableName.toLowerCase();
  });
}

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();

  if (!hasTable(tables, 'users')) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      username: { type: Sequelize.STRING(100), allowNull: true, unique: true },
      email: { type: Sequelize.STRING(255), allowNull: true, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      full_name: { type: Sequelize.STRING(150), allowNull: true },
      phone: { type: Sequelize.STRING(30), allowNull: true },
      avatar_url: { type: Sequelize.STRING(500), allowNull: true },
      role: {
        type: Sequelize.ENUM('admin', 'editor', 'user'),
        allowNull: false,
        defaultValue: 'user'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  }

  const tablesAfterUsers = await queryInterface.showAllTables();

  if (!hasTable(tablesAfterUsers, 'book_categories')) {
    await queryInterface.createTable('book_categories', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: { type: Sequelize.STRING(150), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(180), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      created_by: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  }

  const tablesAfterCategories = await queryInterface.showAllTables();

  if (!hasTable(tablesAfterCategories, 'books')) {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      category_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'book_categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(280), allowNull: false, unique: true },
      author: { type: Sequelize.STRING(180), allowNull: true },
      isbn: { type: Sequelize.STRING(20), allowNull: true, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      cover_url: { type: Sequelize.STRING(500), allowNull: true },
      published_year: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'draft'
      },
      created_by: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.dropTable('books');
  await queryInterface.dropTable('book_categories');
  await queryInterface.dropTable('users');
}
