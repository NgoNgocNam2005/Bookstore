import { DataTypes } from 'sequelize';

export function initUserModel(sequelize) {
  return sequelize.define(
    'User',
    {
      id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      username: { type: DataTypes.STRING(100), unique: true, allowNull: true },
      email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: true,
        validate: { isEmail: true }
      },
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash'
      },
      fullName: { type: DataTypes.STRING(150), allowNull: true, field: 'full_name' },
      phone: { type: DataTypes.STRING(30), allowNull: true },
      avatarUrl: { type: DataTypes.STRING(500), allowNull: true, field: 'avatar_url' },
      role: {
        type: DataTypes.ENUM('admin', 'editor', 'staff', 'user'),
        allowNull: false,
        defaultValue: 'user'
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: 'last_login_at' }
    },
    { tableName: 'users', underscored: true, timestamps: true }
  );
}
