import {z} from 'zod';

const emptyObject = z.object({}).passthrough();

export const adminDashboardSchema = z.object({
    body: emptyObject,
    params: emptyObject,
    query: emptyObject
});