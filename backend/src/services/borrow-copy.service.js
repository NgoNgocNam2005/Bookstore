import {
  BookCopy,
  BorrowOrderItem
} from '../model/index.js';

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
