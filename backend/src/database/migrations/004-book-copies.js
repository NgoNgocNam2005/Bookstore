export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('book_copies', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    book_id: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    copy_code: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    status: {
      type: Sequelize.ENUM(
        'available',
        'reserved',
        'borrowed',
        'lost',
        'damaged'
      ),
      allowNull: false,
      defaultValue: 'available'
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

  await queryInterface.addColumn(
    'borrow_order_items',
    'copy_id',
    {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: 'book_copies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.removeColumn(
    'borrow_order_items',
    'copy_id'
  );

  await queryInterface.dropTable('book_copies');
}