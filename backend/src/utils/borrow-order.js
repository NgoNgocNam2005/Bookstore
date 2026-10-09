import { randomBytes } from 'node:crypto';

export function generateBorrowOrderCode() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const suffix = randomBytes(3).toString('hex').toUpperCase();

  return `BOR-${timestamp}-${suffix}`;
}
