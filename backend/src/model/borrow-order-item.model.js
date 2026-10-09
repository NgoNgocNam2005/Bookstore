import { DataTypes } from 'sequelize';

export function initBorrowOrderItemModel(sequelize) {
  return sequelize.define(
    'BorrowOrderItem',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      orderId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'order_id'
      },
      bookId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'book_id'
      },
      copyId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'copy_id'
      }
    },
    {
      tableName: 'borrow_order_items',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['order_id', 'book_id']
        }
      ]
    }
  );
}