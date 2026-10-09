import { DataTypes } from 'sequelize';

export function initBorrowOrderModel(sequelize) {
  return sequelize.define(
    'BorrowOrder',
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
      },
      code: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
      },
      userId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'user_id'
      },
      status: {
        type: DataTypes.ENUM(
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
      note: { type: DataTypes.TEXT, allowNull: true },
      adminNote: { type: DataTypes.TEXT, allowNull: true, field: 'admin_note' },
      dueAt: { type: DataTypes.DATE, allowNull: true, field: 'due_at' },
      processedBy: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        field: 'processed_by'
      },
      processedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'processed_at'
      }
    },
    { tableName: 'borrow_orders', underscored: true, timestamps: true }
  );
}
