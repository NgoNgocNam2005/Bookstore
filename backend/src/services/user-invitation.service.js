import { createHash, randomBytes } from 'node:crypto';
import { Op } from 'sequelize';
import { sequelize, User, UserInvitation } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { hashPassword } from '../utils/password.js';
import { toPublicUser } from '../utils/user.js';
import { sendUserInvitationEmail } from '../utils/email.js';
import { tr } from 'zod/v4/locales';



const INVITATION_TTL_MS = 60 * 60 * 1000;

const createInvitationToken = () => {
    return randomBytes(32).toString('base64url');
}

const hashToken = (token) => {
    return createHash('sha256').update(token).digest('hex');
}

const deliverInvitation = async(user, token) => {
    try{
        await sendUserInvitationEmail({ to: user.email, token});
    }catch{
        throw new AppError(
            'Account was created, but the invitation email was not delivered. Retry using the resend invitation endpoint.',
            503,
            'INVITATION_EMAIL_FAILED'
        );
    }
}


export const createUserInvitation = async (data, createdBy) => {
    const email = data.email.trim().toLowerCase();
    const username = data.username?.trim().toLowerCase() || null;
    const identifiers = [{email}];

    if (username) identifiers.push({username});

    const existingUser = await User.findOne({
        where: { [Op.or]: identifiers}
    });

    if (existingUser) {
        throw new AppError(
            'Email or username is already in use', 409, 'USER_ALREADY_EXISTS'
        );
    }

    const token = createInvitationToken();
    const randomUnusablePassword = randomBytes(32).toString('base64url');
    const passwordHash = await hashPassword(randomUnusablePassword);
    let user;

    try {
        user = await sequelize.transaction(async (transaction) => {
            const createdUser = await User.create({
                email,
                username,
                fullName: data.fullName.trim(),
                phone: data.phone?.trim() || null,
                passwordHash,
                role: 'user',
                status: 'invited'

            },
            {transaction});
            
            await UserInvitation.create({
                userId: createdUser.id,
                createdBy,
                tokenHash: hashToken(token),
                expiresAt: new Date(Date.now() + INVITATION_TTL_MS)

            },
            {transaction});
            return createdUser;
        });

    }catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError'){
            throw new AppError(
                'Email or username is already in use',
                 409,
                'USER_ALREADY_EXISTS'
            );
        }
        throw error;
    }

    await deliverInvitation(user, token);
    return toPublicUser(user);
} 


export const resendUserInvitation = async (userId, createdBy) => {
    const token = createInvitationToken();

    const user = await sequelize.transaction(async (transaction) =>{
        const invitedUser = await User.findByPk(userId, {
            transaction, 
            lock: transaction.LOCK.UPDATE
        });

        if (!invitedUser || invitedUser.status !== 'invited'){
            throw new AppError(
                'Pending invitation was not found', 404, 'INVITATION_NOT_FOUND'
            );
        }

        const invitation = await UserInvitation.findOne({
            where: {userId: invitedUser.id},
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!invitation){
            throw new AppError(
                'Pending invitation was not found',
                404,
                'INVITATION_NOT_FOUND'
            );
        }

        await invitation.update({
            tokenHash: hashToken(token),
            expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
            usedAt: null,
            createdBy
        }, {transaction});
        return invitedUser;
    });

    await deliverInvitation(user, token);
    
    return toPublicUser(user);
}

export const activateInvitedUser = async({token, password}) => {
    const tokenHash = hashToken(token);
    await sequelize.transaction(async (transaction) => {
        const invitation = await UserInvitation.findOne({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: {[Op.gt]: new Date()}
            },
            transaction,
            lock: transaction.LOCK.UPDATE
        });

        if (!invitation) {
            throw new AppError(
                'Invitation token is invalid or expired',
                400,
                'INVALID_INVITATION_TOKEN'
            );
        }

        const user = await User.findByPk(invitation.userId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (!user || user.status !== 'invited' || user.role !== 'user'){
            throw new AppError(
                'Invitation token is invalid or expired',
                400,
                'INVALID_INVITATION_TOKEN'
            );
        }

        await user.update({
            passwordHash: await hashPassword(password),
            status: 'active'
        }, {transaction});
        await invitation.update({usedAt: new Date()}, {transaction});
    });
}