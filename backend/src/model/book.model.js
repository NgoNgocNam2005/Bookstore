import { DataTypes } from 'sequelize';

export function initBookModel(sequelize) {
  return sequelize.define(
    'Book',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      categoryId: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        field: 'category_id'
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(280), allowNull: false, unique: true },
      author: { type: DataTypes.STRING(180), allowNull: true },
      isbn: { type: DataTypes.STRING(20), allowNull: true, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      coverUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'cover_url' },
      publishedYear: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: true,
        field: 'published_year'
      },
      status: {
        type: DataTypes.ENUM('draft', 'active', 'inactive'),
        allowNull: false,
        defaultValue: 'draft'
      },
      createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'created_by' }
    },
    { tableName: 'books', underscored: true, timestamps: true }
  );
}
