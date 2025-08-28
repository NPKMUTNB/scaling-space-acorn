# คู่มือการใช้งานระบบจัดการสินค้า (Product Management)

ไฟล์นี้อธิบายการทำงานของระบบ CRUD สินค้า พร้อมระบบค้นหาสินค้าด้วยรหัสสินค้า และระบบ login เพื่อขอ JWT token ก่อนเข้าถึงข้อมูลสินค้า

## 1. โครงสร้างข้อมูลสินค้า (Product)
- `id` : รหัสสินค้า (อัตโนมัติ)
- `code` : รหัสสินค้า (เช่น P001)
- `name` : ชื่อสินค้า
- `price` : ราคาสินค้า

ตัวอย่างข้อมูลสินค้าเริ่มต้น:
```js
let products = [
  { id: 1, code: 'P001', name: 'Laptop', price: 25000 },
  { id: 2, code: 'P002', name: 'Mouse', price: 500 },
  { id: 3, code: 'P003', name: 'Keyboard', price: 1200 }
]
```

## 2. ระบบ Login และ JWT
- ผู้ใช้ต้อง login (POST /login) เพื่อขอ JWT token
- ทุก endpoint ที่เกี่ยวกับสินค้า ต้องแนบ token ใน header: `Authorization: Bearer <token>`

### ตัวอย่างการขอ token
```bash
curl -X POST -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"alice123"}' http://localhost:3000/login
```

## 3. Endpoint สำหรับสินค้า

### 3.1 สร้างสินค้าใหม่
- `POST /products`
- ต้อง login
- Body: `{ "code": "P004", "name": "Monitor", "price": 5000 }`
- ตัวอย่าง:
```bash
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"code":"P004","name":"Monitor","price":5000}' http://localhost:3000/products
```

### 3.2 อ่านสินค้าทั้งหมด
- `GET /products`
- ต้อง login
- ตัวอย่าง:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/products
```

### 3.3 อ่านสินค้าด้วย id
- `GET /products/:id`
- ต้อง login
- ตัวอย่าง:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/products/1
```

### 3.4 ค้นหาสินค้าด้วยรหัสสินค้า
- `GET /products/code/:code`
- ต้อง login
- ตัวอย่าง:
```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/products/code/P001
```

### 3.5 แก้ไขสินค้า
- `PUT /products/:id`
- ต้อง login
- Body: `{ "name": "New Name", "price": 999 }`
- ตัวอย่าง:
```bash
curl -X PUT -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"New Name","price":999}' http://localhost:3000/products/1
```

### 3.6 ลบสินค้า
- `DELETE /products/:id`
- ต้อง login
- ตัวอย่าง:
```bash
curl -X DELETE -H "Authorization: Bearer <token>" http://localhost:3000/products/1
```

## 4. หมายเหตุ
- ทุก endpoint สินค้าต้องแนบ JWT token ที่ได้จาก /login
- ข้อมูลสินค้าเก็บในหน่วยความจำ (in-memory) จะหายเมื่อรีสตาร์ทเซิร์ฟเวอร์
- เหมาะสำหรับการทดลองหรือศึกษาการทำงาน Express.js และ JWT
