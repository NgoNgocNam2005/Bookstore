import {DataTypes} from 'sequelize';

export const initUserInvitationModel = (sequelize) => {
    return sequelize.define(
        'UserInvitation',
        {
            id: {
                type: DataTypes.BIGINT.UNSIGNED,
                autoIncrement: true,
                primaryKey: true
            },
            userId: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: false,
                unique: true,
                field: 'user_id'
            },
            createdBy: {
                type: DataTypes.BIGINT.UNSIGNED,
                allowNull: true,
                field: 'created_by'
            },
            tokenHash: {
                type: DataTypes.STRING(64),
                allowNull: false,
                unique: true,
                field: 'token_hash'
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                field: 'expires_at'
            },
            usedAt: {
                type: DataTypes.DATE,
                allowNull: true,
                field: 'used_at'
            }
        },
        {
            tableName: 'user_invitations',
            underscored: true,
            timestamps: true
        }
    );
}