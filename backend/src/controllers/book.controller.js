import {
  createBook,
  deactivateBook,
  getBook,
  listBooks,
  updateBook
} from '../services/book.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listBooksController(request, response) {
  const result = await listBooks(request.validated.query);

  return sendSuccess(
    response,
    { items: result.items },
    200,
    result.meta
  );
}

export async function getBookController(request, response) {
  const book = await getBook(request.validated.params.id);

  return sendSuccess(response, { book });
}

export async function createBookController(request, response) {
  const book = await createBook(request.body, request.user.id);

  return sendSuccess(response, { book }, 201);
}

export async function updateBookController(request, response) {
  const book = await updateBook(
    request.validated.params.id,
    request.body
  );

  return sendSuccess(response, { book });
}

export async function deleteBookController(request, response) {
  const book = await deactivateBook(request.validated.params.id);

  return sendSuccess(response, {
    book,
    message: 'Book deactivated successfully'
  });
}
