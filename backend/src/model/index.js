import sequelize from '../config/database.js';
import { initBookCategoryModel } from './book-category.model.js';
import { initBookModel } from './book.model.js';
import { initBorrowOrderItemModel } from './borrow-order-item.model.js';
import { initBorrowOrderModel } from './borrow-order.model.js';
import {initBookCopyModel} from './book-copy.model.js';
import { initUserModel } from './user.model.js';

const User = initUserModel(sequelize);
const BookCategory = initBookCategoryModel(sequelize);
const Book = initBookModel(sequelize);
const BorrowOrder = initBorrowOrderModel(sequelize);
const BorrowOrderItem = initBorrowOrderItemModel(sequelize);
const BookCopy = initBookCopyModel(sequelize);
User.hasMany(BookCategory, { foreignKey: 'createdBy', as: 'createdCategories' });
BookCategory.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
BookCategory.hasMany(Book, { foreignKey: 'categoryId', as: 'books' });
Book.belongsTo(BookCategory, { foreignKey: 'categoryId', as: 'category' });
User.hasMany(Book, { foreignKey: 'createdBy', as: 'createdBooks' });
Book.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(BorrowOrder, { foreignKey: 'userId', as: 'borrowOrders' });
BorrowOrder.belongsTo(User, { foreignKey: 'userId', as: 'customer' });
User.hasMany(BorrowOrder, { foreignKey: 'processedBy', as: 'processedBorrowOrders' });
BorrowOrder.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });
BorrowOrder.hasMany(BorrowOrderItem, { foreignKey: 'orderId', as: 'items' });
BorrowOrderItem.belongsTo(BorrowOrder, { foreignKey: 'orderId', as: 'order' });
BorrowOrderItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });
Book.hasMany(BorrowOrderItem, { foreignKey: 'bookId', as: 'borrowOrderItems' });
Book.hasMany(BookCopy, {foreignKey: 'bookId', as: 'copies'});
BookCopy.belongsTo(Book, {foreignKey: 'bookId', as: 'book'});
BorrowOrderItem.belongsTo(BookCopy, {foreignKey: 'copyId', as: 'copy'});
BookCopy.hasMany(BorrowOrderItem, {foreignKey: 'copyId', as: 'borrowOrderItems'});

export {
  Book,
  BookCopy,
  BookCategory,
  BorrowOrder,
  BorrowOrderItem,
  User,
  sequelize
};
