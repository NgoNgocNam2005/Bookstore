import {
  createBookCopy,
  getBookCopy,
  listBookCopies,
  updateBookCopyStatus
} from '../services/book-copy.service.js';
import { sendSuccess } from '../utils/response.js';

export const createBookCopyController = async (request, response) => {
    const copy = await createBookCopy(request.validated.body);
    return sendSuccess(response, { copy }, 201);
};

export const listBookCopiesController = async (request, response) => {
    const result = await listBookCopies(request.validated.query);
    return sendSuccess(
        response, 
        {items: result.items},
        200,
        result.meta
    );
}

export const getBookCopyController = async(request, response) => {
    const copy = await getBookCopy(request.validated.params.id);
    return sendSuccess(response, {copy});
}

export const updateBookCopyStatusController = async(request, response) => {
    const copy = await updateBookCopyStatus(request.validated.params.id, request.validated.body.status);
    return sendSuccess(response, {copy});
}
