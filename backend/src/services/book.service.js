import { Op } from 'sequelize';
import { Book, BookCategory } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { generateUniqueSlug } from '../utils/slugify.js';

const categoryInclude = {
  model: BookCategory,
  as: 'category',
  attributes: ['id', 'name', 'slug', 'status']
};

async function findBookOrThrow(bookId) {
  const book = await Book.findByPk(bookId, {
    include: [categoryInclude]
  });

  if (!book) {
    throw new AppError('Book not found', 404, 'BOOK_NOT_FOUND');
  }

  return book;
}

async function findActiveCategoryOrThrow(categoryId) {
  const category = await BookCategory.findOne({
    where: { id: categoryId, status: 'active' }
  });

  if (!category) {
    throw new AppError(
      'Active book category not found',
      400,
      'CATEGORY_NOT_FOUND'
    );
  }

  return category;
}

export async function listBooks({
  categoryId,
  search,
  status,
  page,
  limit
}) {
  const pagination = getPagination(page, limit);
  const where = status
    ? { status }
    : { status: { [Op.ne]: 'inactive' } };

  if (categoryId) where.categoryId = categoryId;

  if (search) {
    // Escape % and _ characters for LIKE clause
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');
    where[Op.or] = [
      { title: { [Op.like]: `%${safeSearch}%` } },
      { author: { [Op.like]: `%${safeSearch}%` } },
      { isbn: { [Op.like]: `%${safeSearch}%` } }
    ];
  }

  const result = await Book.findAndCountAll({
    where,
    include: [categoryInclude],
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true
  });

  return {
    items: result.rows,
    meta: getPaginationMeta(pagination.page, pagination.limit, result.count)
  };
}

export async function getBook(bookId) {
  return findBookOrThrow(bookId);
}

export async function createBook(data, userId) {
  await findActiveCategoryOrThrow(data.categoryId);

  const book = await Book.create({
    ...data,
    slug: await generateUniqueSlug(Book, data.title),
    createdBy: userId,
    status: data.status ?? 'draft'
  });

  return findBookOrThrow(book.id);
}

export async function updateBook(bookId, data) {
  const book = await findBookOrThrow(bookId);
  const updateData = { ...data };

  if (data.categoryId !== undefined) {
    await findActiveCategoryOrThrow(data.categoryId);
  }

  if (data.title !== undefined && data.title !== book.title) {
    updateData.slug = await generateUniqueSlug(Book, data.title, bookId);
  }

  await book.update(updateData);

  return findBookOrThrow(bookId);
}

export async function deactivateBook(bookId) {
  const book = await findBookOrThrow(bookId);

  await book.update({ status: 'inactive' });

  return book;
}
