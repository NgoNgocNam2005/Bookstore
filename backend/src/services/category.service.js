import { Op } from 'sequelize';
import { Book, BookCategory } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { generateUniqueSlug } from '../utils/slugify.js';

async function findCategoryOrThrow(categoryId) {
  const category = await BookCategory.findByPk(categoryId);

  if (!category) {
    throw new AppError('Book category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  return category;
}

export async function listCategories({ status, search, page, limit }) {
  const where = status ? { status } : {};
  const pagination = getPagination(page, limit);

  if (search) {
    // Escape % and _ characters for LIKE clause
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');
    where[Op.or] = [
      { name: { [Op.like]: `%${safeSearch}%` } },
      { description: { [Op.like]: `%${safeSearch}%` } }
    ];
  }

  const result = await BookCategory.findAndCountAll({
    where,
    attributes: {
      include: [
        [
          BookCategory.sequelize.literal(`(
            SELECT COUNT(*)
            FROM books AS book
            WHERE
              book.category_id = BookCategory.id
              AND book.status != 'inactive'
          )`),
          'bookCount'
        ]
      ]
    },
    order: [['name', 'ASC']],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true
  });

  return {
    items: result.rows.map(row => row.get({ plain: true })),
    meta: getPaginationMeta(pagination.page, pagination.limit, result.count)
  };
}

export async function getCategory(categoryId) {
  const category = await findCategoryOrThrow(categoryId);
  const bookCount = await Book.count({
    where: {
      categoryId,
      status: { [Op.ne]: 'inactive' }
    }
  });

  return {
    ...category.get({ plain: true }),
    bookCount
  };
}

export async function createCategory(data, userId) {
  const existing = await BookCategory.findOne({
    where: { name: data.name }
  });

  if (existing) {
    throw new AppError(
      'A category with this name already exists',
      409,
      'CATEGORY_NAME_EXISTS'
    );
  }

  return BookCategory.create({
    name: data.name,
    slug: await generateUniqueSlug(BookCategory, data.name),
    description: data.description ?? null,
    createdBy: userId,
    status: 'active'
  });
}

export async function updateCategory(categoryId, data) {
  const category = await findCategoryOrThrow(categoryId);
  const updateData = {};

  if (data.name !== undefined && data.name !== category.name) {
    const existing = await BookCategory.findOne({
      where: {
        name: data.name,
        id: { [Op.ne]: categoryId }
      }
    });

    if (existing) {
      throw new AppError(
        'A category with this name already exists',
        409,
        'CATEGORY_NAME_EXISTS'
      );
    }

    updateData.name = data.name;
    updateData.slug = await generateUniqueSlug(BookCategory, data.name, categoryId);
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  await category.update(updateData);

  return category;
}

export async function deactivateCategory(categoryId) {
  const category = await findCategoryOrThrow(categoryId);
  const activeBookCount = await Book.count({
    where: {
      categoryId,
      status: { [Op.ne]: 'inactive' }
    }
  });

  if (activeBookCount > 0) {
    throw new AppError(
      'Category still contains active books',
      409,
      'CATEGORY_HAS_BOOKS'
    );
  }

  await category.update({ status: 'inactive' });

  return category;
}
