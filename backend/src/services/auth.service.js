import { Op } from 'sequelize';
import { User } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { signAccessToken } from '../utils/jwt.js';
import { comparePassword } from '../utils/password.js';
import { toPublicUser } from '../utils/user.js';

export async function login({ identifier, password }) {
  const normalizedIdentifier = identifier.trim();

  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: normalizedIdentifier },
        { username: normalizedIdentifier }
      ]
    }
  });

  if (!user) {
    throw new AppError(
      'Invalid username/email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  if (user.status !== 'active') {
    throw new AppError('User account is inactive', 403, 'USER_INACTIVE');
  }

  const passwordMatched = await comparePassword(
    password,
    user.passwordHash
  );

  if (!passwordMatched) {
    throw new AppError(
      'Invalid username/email or password',
      401,
      'INVALID_CREDENTIALS'
    );
  }

  await user.update({ lastLoginAt: new Date() });

  return {
    accessToken: signAccessToken({
      sub: String(user.id),
      role: user.role
    }),
    user: toPublicUser(user)
  };
}

export async function findActiveUserById(userId) {
  return User.findOne({
    where: {
      id: userId,
      status: 'active'
    }
  });
}
