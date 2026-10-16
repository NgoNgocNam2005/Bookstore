import { Op } from 'sequelize';
import {
  Book,
  BookCopy,
  BorrowOrder,
  BorrowOrderItem,
  User
} from '../model/index.js';

export const getAdminDashboard = async () => {
    const now = new Date();
    const [
        activeBooks,
        availableCopies,
        pendingOrders,
        borrowedCopies,
        overdueOrders,
        recentOrders
    ]
     = await Promise.all([
        Book.count({
            where: { status: 'active' }
        }),
        BookCopy.count({
            where: { status: 'available' }
        }),
        BorrowOrder.count({
            where: { status: 'pending' }
        }),
        BookCopy.count({
            where: { status: 'borrowed' }
        }),
        BorrowOrder.count({
            where: {
            status: 'borrowed',
            dueAt: { [Op.lt]: now }
        }
        }),
        BorrowOrder.findAll({
        attributes: ['id', 'code', 'status', 'dueAt', 'createdAt'],
        include: [
            {
            model: User,
            as: 'customer',
            attributes: ['id', 'username', 'email', 'fullName']
            },
            {
            model: BorrowOrderItem,
            as: 'items',
            attributes: ['id', 'bookId'],
            include: [
                {
                model: Book,
                as: 'book',
                attributes: ['id', 'title']
                }
            ]
            }
        ],
        order: [['createdAt', 'DESC']],
        limit: 5
        })
     ]);
     return {
        stats: {
            activeBooks,
            availableCopies,
            pendingOrders,
            borrowedCopies,
            overdueOrders
        },
        recentOrders
     };
}