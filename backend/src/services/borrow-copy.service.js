import { AppError } from '../utils/app-error.js';
import {
  Book,
  BookCopy,
  BorrowOrderItem
} from '../model/index.js';
import {
  getPagination,
  getPaginationMeta
} from '../utils/pagination.js';
import { Op } from 'sequelize';
export async function releaseReservedCopies(
  orderId,
  transaction
) {
  const items = await BorrowOrderItem.findAll({
    where: { orderId },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  for (const item of items) {
    await BookCopy.update(
      { status: 'available' },
      {
        where: {
          id: item.copyId,
          status: 'reserved'
        },
        transaction
      }
    );
  }
}

export async function borrowReservedCopies(
  orderId,
  transaction
) {
  const items = await BorrowOrderItem.findAll({
    where: { orderId },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  for (const item of items) {
    const copy = await BookCopy.findByPk(item.copyId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!copy || copy.status !== 'reserved') {
      throw new AppError(
        'Reserved copy was not found',
        409,
        'COPY_STATUS_CONFLICT'
      );
    }

    await copy.update(
      { status: 'borrowed' },
      { transaction }
    );
  }
}

export async function returnBorrowedCopies(
  orderId,
  transaction
) {
  const items = await BorrowOrderItem.findAll({
    where: { orderId },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  for (const item of items) {
    const copy = await BookCopy.findByPk(item.copyId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!copy || copy.status !== 'borrowed') {
      throw new AppError(
        'Borrowed copy was not found',
        409,
        'COPY_STATUS_CONFLICT'
      );
    }

    await copy.update(
      { status: 'available' },
      { transaction }
    );
  }
}

const bookInclude = {
  model: Book,
  as: 'book',
  attributes: ['id', 'title', 'slug', 'categoryId']
};
const findBookOrThrow = async(bookId) => {
  const book = await Book.findOne({
    where: {
      id: bookId, 
      status: 'active'
    }
  });
  if (!book) {
    throw new AppError('Book not found or not available', 404, 'BOOK_NOT_FOUND');
  }
  return book;
}

const findBookCopyOrThrow = async(copyId) => {
  const copy = await BookCopy.findByPk(copyId, {
    include: [bookInclude]
  });
  if (!copy) {
    throw new AppError('Book copy not found', 404, 'BOOK_COPY_NOT_FOUND');
  }
  return copy;
}

export const listBookCopies = async (bookId, status, search, page, limit) => {
  const pagination = getPagination(page, limit);
  const where = {};
  if (bookId){
    where.bookId = bookId;
  }
  if (status) {
    where.status = status;
  }

  if (search) {
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');
    where[Op.or] = [
      {
        copyCode: {
          [Op.like]: `%${safeSearch}%`
        }
      },
      {
        '$book.title$': {
          [Op.like]: `%${safeSearch}%`
        }
      }
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

export const getBookCopy = async(copyId) => {
  return findBookCopyOrThrow(copyId);
}

export const createBookCopy = async({bookId, copyCode}) => {
  await findBookOrThrow(bookId);

  const normalizedCopyCode = copyCode.trim();
  const duplicatedCopy = await BookCopy.findOne({
    where: {
      copyCode: normalizedCopyCode
    }
  });

  if (duplicatedCopy) {
    throw new AppError('Book copy already exists', 409, 'BOOK_COPY_EXISTS');
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

