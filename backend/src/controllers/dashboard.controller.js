import { getAdminDashboard } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getAdminDashboardController(_request, response) {
  const dashboard = await getAdminDashboard();

  return sendSuccess(response, { dashboard });
}

