import {
  cancelMyBorrowOrder,
  createBorrowOrder,
  getBorrowOrder,
  getMyBorrowOrder,
  listBorrowOrders,
  listMyBorrowOrders,
  listOverdueBorrowOrders,
  updateBorrowOrderStatus
} from '../services/borrow-order.service.js';
import { sendSuccess } from '../utils/response.js';

export async function createBorrowOrderController(request, response) {
  const order = await createBorrowOrder({
    userId: request.user.id,
    ...request.body
  });

  return sendSuccess(response, { order }, 201);
}

export async function listMyBorrowOrdersController(request, response) {
  const result = await listMyBorrowOrders({
    userId: request.user.id,
    ...request.validated.query
  });

  return sendSuccess(response, { items: result.items }, 200, result.meta);
}

export async function getMyBorrowOrderController(request, response) {
  const order = await getMyBorrowOrder(
    request.validated.params.id,
    request.user.id
  );

  return sendSuccess(response, { order });
}

export async function cancelMyBorrowOrderController(request, response) {
  const order = await cancelMyBorrowOrder(
    request.validated.params.id,
    request.user.id
  );

  return sendSuccess(response, { order });
}

export async function listBorrowOrdersController(request, response) {
  const result = await listBorrowOrders(request.validated.query);

  return sendSuccess(response, { items: result.items }, 200, result.meta);
}

export async function getBorrowOrderController(request, response) {
  const order = await getBorrowOrder(request.validated.params.id);

  return sendSuccess(response, { order });
}

export async function updateBorrowOrderStatusController(request, response) {
  const order = await updateBorrowOrderStatus(
    request.validated.params.id,
    request.body,
    request.user.id
  );

  return sendSuccess(response, { order });
}

export async function listOverdueBorrowOrdersController(request, response) {
  const result = await listOverdueBorrowOrders(request.validated.query);

  return sendSuccess(
    response,
    {items: result.items},
    200,
    result.meta
  );
}
