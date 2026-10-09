# React + Node.js project

## Yêu cầu

- Node.js 20+
- npm 10+

## Cài đặt

```bash
npm install
```

Nếu PowerShell báo lỗi `running scripts is disabled`, dùng `npm.cmd` thay cho `npm`:

```bash
npm.cmd install
```

Tạo file biến môi trường từ các file mẫu nếu cần:

```bash
copy backend/.env.example backend/.env
copy frontend/.env.example frontend/.env
```

Trên macOS/Linux dùng `cp` thay cho `copy`.

## Chạy development

Chạy cả frontend và backend:

```bash
npm run dev
```

Trong trường hợp PowerShell bị chặn execution policy, dùng `npm.cmd run dev`.

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Database

MySQL schema đã được tạo:

- Host: `127.0.0.1`
- Port: `3306`
- Schema: `manageBookStore`
- Charset: `utf8mb4`

Script khởi tạo nằm tại `database/init.sql`. Hiện schema chưa có bảng nghiệp vụ; các bảng sẽ được thêm sau khi bạn định nghĩa entity trong `backend/src/model/`.

Hoặc chạy riêng:

```bash
npm run dev:frontend
npm run dev:backend
```

## Build frontend

```bash
npm run build
```

## Database migrations

Backend sử dụng Sequelize để kết nối MySQL, định nghĩa model và chạy migration.

```bash
npm run db:migrate --workspace backend
```

Migration đầu tiên tạo các bảng `users`, `book_categories` và `books`. Lệnh có thể chạy lại an toàn; migration đã chạy sẽ được ghi trong bảng `sequelize_migrations`.

Nếu PowerShell bị chặn execution policy:

```bash
npm.cmd run db:migrate --workspace backend
```

## Cấu trúc

```text
.
├── backend/
│   ├── .env.example
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── model/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── frontend/
│   ├── src/
│   ├── index.html
│   └── .env.example
├── package.json
└── README.md
```

Phần business logic, API modules, pages/components và database chưa được thêm để bạn tự construct.
