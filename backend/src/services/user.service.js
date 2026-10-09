import { Op } from 'sequelize';
import { User } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { toPublicUser } from '../utils/user.js';

export async function getUserProfile(userId) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return toPublicUser(user);
}

export async function updateUserProfile(userId, data) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await user.update({
    fullName: data.fullName,
    phone: data.phone,
    avatarUrl: data.avatarUrl
  });

  return toPublicUser(user);
}

export async function changeUserPassword(
  userId,
  currentPassword,
  newPassword
) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const currentPasswordMatched = await comparePassword(
    currentPassword,
    user.passwordHash
  );

  if (!currentPasswordMatched) {
    throw new AppError(
      'Current password is incorrect',
      400,
      'INVALID_CURRENT_PASSWORD'
    );
  }

  await user.update({
    passwordHash: await hashPassword(newPassword)
  });
}

export async function listUsers({ page, limit, search, role, status }) {
  const pagination = getPagination(page, limit);
  const where = {};

  if (role) where.role = role;
  if (status) where.status = status;

  if (search) {
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');
    where[Op.or] = [
      { username: { [Op.like]: `%${safeSearch}%` } },
      { email: { [Op.like]: `%${safeSearch}%` } },
      { fullName: { [Op.like]: `%${safeSearch}%` } }
    ];
  }

  const result = await User.findAndCountAll({
    where,
    attributes: { exclude: ['passwordHash'] },
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return {
    items: result.rows,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.count)
  };
}

export async function getUserById(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] }
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}

export async function updateUserByAdmin(userId, data) {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }


  const updateData = {};
  if (data.role !== undefined) updateData.role = data.role;
  if (data.status !== undefined) updateData.status = data.status;

  await user.update(updateData);

  return toPublicUser(user);
}
