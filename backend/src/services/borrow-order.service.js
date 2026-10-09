import { Op } from 'sequelize';
import {
  Book,
  BookCopy,
  BorrowOrder,
  BorrowOrderItem,
  User,
  sequelize
} from '../model/index.js';
import { AppError } from '../utils/app-error.js';
import { generateBorrowOrderCode } from '../utils/borrow-order.js';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';
import { releaseReservedCopies } from './borrow-copy.service.js';

const orderStatuses = ['pending', 'approved', 'borrowed', 'returned', 'rejected', 'cancelled'];
const activeOrderStatuses = ['pending', 'approved', 'borrowed'];
const transitions = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['borrowed', 'rejected', 'cancelled'],
  borrowed: ['returned'],
  returned: [],
  rejected: [],
  cancelled: []
};

const bookInclude = {
  model: Book,
  as: 'book',
  attributes: ['id', 'title', 'slug', 'author', 'coverUrl', 'status']
};

const itemsInclude = {
  model: BorrowOrderItem,
  as: 'items',
  include: [bookInclude]
};

const customerInclude = {
  model: User,
  as: 'customer',
  attributes: ['id', 'username', 'email', 'fullName', 'phone']
};

function normalizeOrder(order) {
  return order;
}

async function findOrderOrThrow(orderId, options = {}) {
  const order = await BorrowOrder.findByPk(orderId, {
    ...options,
    include: [customerInclude, itemsInclude]
  });

  if (!order) {
    throw new AppError('Borrow order not found', 404, 'BORROW_ORDER_NOT_FOUND');
  }

  return order;
}

async function findBookIdsAlreadyInActiveOrders(userId, bookIds, transaction) {
  const orders = await BorrowOrder.findAll({
    where: {
      userId,
      status: { [Op.in]: activeOrderStatuses }
    },
    include: [{
      model: BorrowOrderItem,
      as: 'items',
      required: true,
      where: { bookId: { [Op.in]: bookIds } },
      attributes: ['bookId']
    }],
    attributes: ['id'],
    transaction
  });

  return orders.flatMap((order) => order.items.map((item) => item.bookId));
}

export async function createBorrowOrder({ userId, bookIds, note }) {
  const uniqueBookIds = [...new Set(bookIds)];
  const transaction = await sequelize.transaction();
  let orderId;

  try {
    const books = await Book.findAll({
      where: {
        id: { [Op.in]: uniqueBookIds },
        status: 'active'
      },
      attributes: ['id'],
      transaction
    });

    if (books.length !== uniqueBookIds.length) {
      throw new AppError(
        'One or more selected books are not available',
        400,
        'BOOK_NOT_AVAILABLE'
      );
    }

    const duplicatedBookIds = await findBookIdsAlreadyInActiveOrders(
      userId,
      uniqueBookIds,
      transaction
    );

    if (duplicatedBookIds.length > 0) {
      throw new AppError(
        'One or more books are already in an active borrow order',
        409,
        'BOOK_ALREADY_REQUESTED',
        { bookIds: [...new Set(duplicatedBookIds)] }
      );
    }

    const order = await BorrowOrder.create({
      code: generateBorrowOrderCode(),
      userId,
      status: 'pending',
      note: note || null
    }, { transaction });

    for(const bookId of uniqueBookIds){
      const copy = await BookCopy.findOne({
        where: {
          bookId,
          status: 'available'
        },
        order: [[ 'createdAt', 'ASC']],
        transaction,
        lock: transaction.LOCK.UPDATE
      });
      if(!copy){
        throw new AppError(
          `No available copy for book ID ${bookId}`,
          400,
          'NO_AVAILABLE_COPY',
          { bookId }
        );
      }
      await copy.update(
        {status: 'reserved'},
        {transaction}
      );
      await BorrowOrderItem.create({
        orderId: order.id,
        bookId,
        copyId: copy.id
      },
      { transaction });
    }

    orderId = order.id;
    await transaction.commit();
  } catch (error) {
    if (!transaction.finished) await transaction.rollback();
    throw error;
  }

  return findOrderOrThrow(orderId);
}

async function listOrders({ where, page, limit, search }) {
  const pagination = getPagination(page, limit);
  const conditions = { ...where };
  const include = [customerInclude, itemsInclude];

  if (search) {
    const safeSearch = search.trim().replace(/[%_]/g, '\\$&');
    conditions[Op.or] = [
      { code: { [Op.like]: `%${safeSearch}%` } },
      { '$customer.username$': { [Op.like]: `%${safeSearch}%` } },
      { '$customer.email$': { [Op.like]: `%${safeSearch}%` } },
      { '$customer.fullName$': { [Op.like]: `%${safeSearch}%` } }
    ];
  }

  const result = await BorrowOrder.findAndCountAll({
    where: conditions,
    include,
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset,
    distinct: true
  });

  return {
    items: result.rows.map(normalizeOrder),
    meta: getPaginationMeta(pagination.page, pagination.limit, result.count)
  };
}

async function borrowReservedCopies(orderId, transaction){
  const items = await BorrowOrderItem.findAll({
    where: {orderId},
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  for (const item of items){
    const copy = await BookCopy.findByPk(item.copyId, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    if(!copy || copy.status !== 'reserved'){
      throw new AppError(
        'Reserved copy was not found',409
        ,
        'COPY_STATUS_CONFLICT'
      );
    }
    await copy.update(
      {status: 'borrowed'},
      {transaction}
    );
  }
}

export async function listMyBorrowOrders({ userId, page, limit, search, status }) {
  return listOrders({
    where: { userId, ...(status ? { status } : {}) },
    page,
    limit,
    search
  });
}

export async function listBorrowOrders({ page, limit, search, status }) {
  return listOrders({
    where: status ? { status } : {},
    page,
    limit,
    search
  });
}

export async function getMyBorrowOrder(orderId, userId) {
  const order = await findOrderOrThrow(orderId);

  if (String(order.userId) !== String(userId)) {
    throw new AppError('You do not have permission to view this order', 403, 'FORBIDDEN');
  }

  return order;
}

export async function getBorrowOrder(orderId) {
  return findOrderOrThrow(orderId);
}

export async function cancelMyBorrowOrder(orderId, userId) {
  const order = await getMyBorrowOrder(orderId, userId);

  if (order.status !== 'pending') {
    throw new AppError(
      'Only pending borrow orders can be cancelled',
      400,
      'INVALID_BORROW_ORDER_STATUS'
    );
  }

  await order.update({ status: 'cancelled' });
  return findOrderOrThrow(order.id);
}

export async function updateBorrowOrderStatus(orderId, data, adminId) {
  const transaction = await sequelize.transaction();

  try {
    const order = await findOrderOrThrow(orderId, {transaction});

    if (order.status !== 'pending'){
      throw new AppError(
        'Only pending orders can be updated',
        400,
        'INVALID_BORROW_ORDER_STATUS'
      );
    }

    if (!['approved', 'cancelled'].includes(data.status)){
      throw new AppError(
        'Invalid borrow order status',
        400,
        'Invalid_Order_Status'
      );
    }
    if (data.status === 'approved') {
      await borrowReservedCopies(orderId, transaction);
    }

    if (data.status === 'cancelled') {
      await releaseReservedCopies(
        order.id,
        transaction
      );
    }
    await order.update(
      {
        status: data.status,
        adminNote: data.adminNote ?? null, 
        processedBy: adminId,
        processedAt: new Date()
      },
      {transaction}
    );
     await transaction.commit();

    return findOrderOrThrow(order.id);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    throw error;
  }
}
