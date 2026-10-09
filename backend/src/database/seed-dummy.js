import sequelize from '../config/database.js';
import { BookCategory as Category, Book } from '../model/index.js';

async function seedDummyData() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Seed Categories
    const categoryData = [
      { name: 'Học từ vựng ' + Date.now(), slug: 'hoc-tu-vung-' + Date.now(), description: 'Các sách chuyên về học từ vựng các ngôn ngữ', status: 'active' },
      { name: 'Luyện thi ' + Date.now(), slug: 'luyen-thi-' + Date.now(), description: 'Sách luyện thi chứng chỉ quốc tế', status: 'active' },
      { name: 'Ngữ pháp ' + Date.now(), slug: 'ngu-phap-' + Date.now(), description: 'Sách chuyên sâu ngữ pháp', status: 'active' },
      { name: 'Khoa học viễn tưởng ' + Date.now(), slug: 'khoa-hoc-vien-tuong-' + Date.now(), description: 'Tiểu thuyết khoa học viễn tưởng', status: 'active' },
      { name: 'Văn học cổ điển ' + Date.now(), slug: 'van-hoc-co-dien-' + Date.now(), description: 'Tác phẩm văn học kinh điển', status: 'active' },
    ];
    
    let categories = await Category.findAll();
    if (categories.length === 0) {
      categories = await Category.bulkCreate(categoryData);
      console.log('Categories seeded successfully.');
    } else {
      console.log('Categories already exist, using existing ones.');
    }

    // Seed Books
    const books = [];
    const dummyAuthors = ['Nguyễn Nhật Ánh', 'Haruki Murakami', 'J.K. Rowling', 'Dale Carnegie', 'Nam Cao', 'Vũ Trọng Phụng', 'Higashino Keigo'];
    
    for (let i = 1; i <= 50; i++) {
      const categoryId = categories[Math.floor(Math.random() * categories.length)].id;
      const author = dummyAuthors[Math.floor(Math.random() * dummyAuthors.length)];
      books.push({
        categoryId,
        title: `Sách giả lập số ${i} ` + Date.now(),
        slug: `sach-gia-lap-so-${i}-` + Date.now() + '-' + Math.random().toString(36).substring(7),
        author: author,
        isbn: `978-0-${Math.floor(1000000 + Math.random() * 9000000)}-${Math.floor(10 + Math.random() * 89)}`,
        description: `Đây là mô tả giả cho cuốn sách số ${i}, dùng để test phân trang và giao diện hiển thị. Nội dung này có thể rất dài để kiểm tra tính năng cắt text của bảng.`,
        coverUrl: `https://picsum.photos/seed/book${i}/200/300`,
        publishedYear: 1990 + Math.floor(Math.random() * 34), // 1990 - 2023
        status: Math.random() > 0.8 ? 'inactive' : 'active'
      });
    }

    await Book.bulkCreate(books);
    console.log('Books seeded successfully.');

    process.exit(0);
  } catch (error) {
    console.error('Unable to seed data:', error);
    process.exit(1);
  }
}

seedDummyData();
