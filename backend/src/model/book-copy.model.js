import { DataTypes } from 'sequelize';
export function initBookCopyModel(sequelize) {
    return sequelize.define(
        'BookCopy',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
            autoIncrement: true,
            primaryKey: true
            },
            bookId: {
            type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false,
            field: 'book_id'
            },
            copyCode: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
                field: 'copy_code'
            },
            status: {
                type: DataTypes.ENUM(
                'available',
                'reserved',
                'borrowed',
                'lost',
                'damaged'
                ),
                allowNull: false,
                defaultValue: 'available'
            }
        },
        {
            tableName: 'book_copies',
            timestamps: true,
            underscored: true
        }
    );

}