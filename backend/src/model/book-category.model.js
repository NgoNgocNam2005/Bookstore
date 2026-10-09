import { DataTypes } from 'sequelize';

export function initBookCategoryModel(sequelize) {
  return sequelize.define(
    'BookCategory',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(150), allowNull: false, unique: true },
      slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'created_by' }
    },
    { tableName: 'book_categories', underscored: true, timestamps: true }
  );
}
