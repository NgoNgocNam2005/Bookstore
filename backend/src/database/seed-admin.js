import sequelize from '../config/database.js';
import { User } from '../model/index.js';
import { hashPassword } from '../utils/password.js';

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

try {
  if (!email || !password) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required'
    );
  }

  await sequelize.authenticate();

  const existingUser = await User.findOne({ where: { email } });

  if (existingUser) {
    console.log(`Admin user already exists: ${email}`);
  } else {
    await User.create({
      email,
      username: email.split('@')[0],
      passwordHash: await hashPassword(password),
      fullName: 'Administrator',
      role: 'admin',
      status: 'active'
    });

    console.log(`Admin user created: ${email}`);
  }
} catch (error) {
  console.error('Unable to seed admin user:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
