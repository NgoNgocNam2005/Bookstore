import { Op } from 'sequelize';
import { Book, BookCopy } from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import {
  getPagination,
  getPaginationMeta
} from '../utils/pagination.js';

const bookInclude = {
  model: Book,
  as: 'book',
  attributes: ['id', 'title', 'slug', 'status']
};

async function findActiveBookOrThrow(bookId) {
  const book = await Book.findOne({
    where: { id: bookId, status: 'active' }
  });

  if (!book) {
    throw new AppError('Active book not found', 404, 'BOOK_NOT_FOUND');
  }

  return book;
}

async function findBookCopyOrThrow(copyId) {
  const copy = await BookCopy.findByPk(copyId, {
    include: [bookInclude]
  });

  if (!copy) {
    throw new AppError(
      'Book copy not found',
      404,
      'BOOK_COPY_NOT_FOUND'
    );
  }

  return copy;
}

export async function listBookCopies({
  bookId,
  status,
  search,
  page,
  limit
}) {
  const pagination = getPagination(page, limit);
  const where = {};

  if (bookId) where.bookId = bookId;
  if (status) where.status = status;

  if (search) {
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');

    where[Op.or] = [
      { copyCode: { [Op.like]: `%${safeSearch}%` } },
      { '$book.title$': { [Op.like]: `%${safeSearch}%` } }
    ];
  }

  const result = await BookCopy.findAndCountAll({
    where,
    include: [bookInclude],
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true
  });

  return {
    items: result.rows,
    meta: getPaginationMeta(
      pagination.page,
      pagination.limit,
      result.count
    )
  };
}

export async function getBookCopy(copyId) {
  return findBookCopyOrThrow(copyId);
}

export async function createBookCopy({ bookId, copyCode }) {
  await findActiveBookOrThrow(bookId);

  const normalizedCopyCode = copyCode.trim();
  const duplicatedCopy = await BookCopy.findOne({
    where: { copyCode: normalizedCopyCode }
  });

  if (duplicatedCopy) {
    throw new AppError(
      'Copy code already exists',
      409,
      'COPY_CODE_ALREADY_EXISTS'
    );
  }

  const copy = await BookCopy.create({
    bookId,
    copyCode: normalizedCopyCode,
    status: 'available'
  });

  return findBookCopyOrThrow(copy.id);
}

export async function updateBookCopyStatus(copyId, status) {
  const copy = await findBookCopyOrThrow(copyId);

  if (['reserved', 'borrowed'].includes(copy.status)) {
    throw new AppError(
      'Reserved or borrowed copies cannot be manually updated',
      400,
      'COPY_STATUS_LOCKED'
    );
  }

  await copy.update({ status });

  return findBookCopyOrThrow(copyId);
}
