function hasTable(tables, tableName) {
  return tables.some((table) => {
    const currentName = typeof table === 'string' ? table : table.tableName;
    return currentName.toLowerCase() === tableName.toLowerCase();
  });
}

export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();

  if (!hasTable(tables, 'borrow_orders')) {
    await queryInterface.createTable('borrow_orders', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      code: { type: Sequelize.STRING(40), allowNull: false, unique: true },
      user_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'approved',
          'borrowed',
          'returned',
          'rejected',
          'cancelled'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      note: { type: Sequelize.TEXT, allowNull: true },
      admin_note: { type: Sequelize.TEXT, allowNull: true },
      due_at: { type: Sequelize.DATE, allowNull: true },
      processed_by: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      processed_at: { type: Sequelize.DATE, allowNull: true },
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

  const tablesAfterOrders = await queryInterface.showAllTables();

  if (!hasTable(tablesAfterOrders, 'borrow_order_items')) {
    await queryInterface.createTable('borrow_order_items', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      order_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'borrow_orders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      book_id: {
        type: Sequelize.BIGINT.UNSIGNED,
        allowNull: false,
        references: { model: 'books', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    await queryInterface.addConstraint('borrow_order_items', {
      fields: ['order_id', 'book_id'],
      type: 'unique',
      name: 'borrow_order_items_order_book_unique'
    });
  }
}

export async function down(queryInterface) {
  await queryInterface.dropTable('borrow_order_items');
  await queryInterface.dropTable('borrow_orders');
}
