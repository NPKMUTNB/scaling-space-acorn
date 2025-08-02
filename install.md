# คู่มือการติดตั้งและเริ่มต้นใช้งานระบบ (install.md)

## 1. Clone โปรเจกต์จาก GitHub

```bash
git clone <URL_REPOSITORY>
cd codespaces-express
```
> **หมายเหตุ:**
> - เปลี่ยน `<URL_REPOSITORY>` เป็น URL จริงของ repository ที่ต้องการ clone

## 2. ติดตั้ง dependencies

```bash
npm install
```

## 3. ติดตั้ง jsonwebtoken (ถ้ายังไม่ได้ติดตั้ง)

```bash
npm install jsonwebtoken
```

## 4. เริ่มต้นเซิร์ฟเวอร์

```bash
node index.js
```

- หากต้องการเปลี่ยนพอร์ต ให้แก้ไขค่าตัวแปร `port` ในไฟล์ `index.js`

## 5. ทดสอบระบบ
- สามารถใช้ Postman, curl หรือ REST Client อื่น ๆ ทดสอบ endpoint ตามคู่มือในไฟล์ `basic.md` และ `product.md`

## 6. หมายเหตุ
- หากพบ error ว่า "EADDRINUSE: address already in use" ให้หยุดโปรเซสที่ใช้พอร์ตนั้น หรือเปลี่ยนพอร์ตในไฟล์ index.js
- ระบบนี้ใช้ in-memory data ข้อมูลจะหายเมื่อปิด/รีสตาร์ทเซิร์ฟเวอร์
