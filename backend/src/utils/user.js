export function toPublicUser(user) {
  const data = user.get({ plain: true });

  delete data.passwordHash;

  return data;
}
