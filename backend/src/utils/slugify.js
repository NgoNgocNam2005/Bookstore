import { Op } from 'sequelize';

export function slugify(value) {
  return String(value)
    .replace(/đ/gi, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(Model, value, excludeId = null) {
  const baseSlug = slugify(value) || 'item';
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const where = { slug };

    if (excludeId !== null) {
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await Model.findOne({ where, attributes: ['id'] });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
