import {
  createCategory,
  deactivateCategory,
  getCategory,
  listCategories,
  updateCategory
} from '../services/category.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listCategoriesController(request, response) {
  const result = await listCategories(request.validated.query);

  return sendSuccess(
    response,
    { items: result.items },
    200,
    result.meta
  );
}

export async function getCategoryController(request, response) {
  const category = await getCategory(request.validated.params.id);

  return sendSuccess(response, { category });
}

export async function createCategoryController(request, response) {
  const category = await createCategory(
    request.body,
    request.user.id
  );

  return sendSuccess(response, { category }, 201);
}

export async function updateCategoryController(request, response) {
  const category = await updateCategory(
    request.validated.params.id,
    request.body
  );

  return sendSuccess(response, { category });
}

export async function deleteCategoryController(request, response) {
  const category = await deactivateCategory(request.validated.params.id);

  return sendSuccess(response, {
    category,
    message: 'Category deactivated successfully'
  });
}
