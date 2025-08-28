# คู่มือการใช้งานไฟล์ `index.js`

ไฟล์ `index.js` นี้เป็นตัวอย่างแอปพลิเคชัน Express.js สำหรับจัดการข้อมูลผู้ใช้ (User Management) แบบ CRUD (Create, Read, Update, Delete) โดยใช้หน่วยความจำ (in-memory) ในการเก็บข้อมูล


## โครงสร้างและการทำงาน

### 1. เริ่มต้นเซิร์ฟเวอร์
- ใช้ Express.js สร้างเซิร์ฟเวอร์ HTTP ที่พอร์ต 3000
- รองรับการรับส่งข้อมูลแบบ JSON

#### ตัวอย่างโค้ด
```js
const express = require('express')
const app = express()
const port = 3000
app.use(express.json())
```
**อธิบาย:**
- นำเข้า express และสร้าง instance ของแอป
- กำหนดพอร์ต 3000
- ใช้ middleware `express.json()` เพื่อให้รับ/ส่งข้อมูล JSON ได้

### 2. ตัวแปรหลัก
- `users` : อาเรย์เก็บข้อมูลผู้ใช้ทั้งหมด
- `nextId` : ตัวแปรสำหรับสร้าง id อัตโนมัติให้ผู้ใช้ใหม่

#### ตัวอย่างโค้ด
```js
let users = []
let nextId = 1
```
**อธิบาย:**
- `users` จะเก็บข้อมูลผู้ใช้ทั้งหมดในรูปแบบอาเรย์
- `nextId` ใช้สำหรับสร้าง id ใหม่ให้ผู้ใช้แต่ละคน

### 3. Endpoint ต่าง ๆ

#### - สร้างผู้ใช้ใหม่ (Create)
- `POST /users`

```js
app.post('/users', (req, res) => {
  const { name, email } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }
  const user = { id: nextId++, name, email }
  users.push(user)
  res.status(201).json(user)
})
```
**อธิบาย:**
- รับข้อมูล `name` และ `email` จาก body
- ตรวจสอบว่ากรอกข้อมูลครบหรือไม่ ถ้าไม่ครบส่ง error 400
- สร้าง object ผู้ใช้ใหม่และเพิ่มเข้าอาเรย์ `users`
- ส่งข้อมูลผู้ใช้ที่สร้างกลับไป (status 201)

#### - อ่านข้อมูลผู้ใช้ทั้งหมด (Read All)
- `GET /users`

```js
app.get('/users', (req, res) => {
  res.json(users)
})
```
**อธิบาย:**
- ส่งคืนอาเรย์ผู้ใช้ทั้งหมดในระบบ

#### - อ่านข้อมูลผู้ใช้รายบุคคล (Read One)
- `GET /users/:id`

```js
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})
```
**อธิบาย:**
- ค้นหาผู้ใช้จาก id ที่รับมาทาง URL
- ถ้าไม่พบ ส่ง error 404
- ถ้าพบ ส่งข้อมูลผู้ใช้

#### - แก้ไขข้อมูลผู้ใช้ (Update)
- `PUT /users/:id`

```js
app.put('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  const { name, email } = req.body
  if (name) user.name = name
  if (email) user.email = email
  res.json(user)
})
```
**อธิบาย:**
- ค้นหาผู้ใช้จาก id
- ถ้าไม่พบ ส่ง error 404
- ถ้าพบ อัปเดต `name` หรือ `email` ตามข้อมูลที่ส่งมา
- ส่งข้อมูลผู้ใช้ที่อัปเดตกลับไป

#### - ลบผู้ใช้ (Delete)
- `DELETE /users/:id`

```js
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id))
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }
  const deletedUser = users.splice(userIndex, 1)[0]
  res.json(deletedUser)
})
```
**อธิบาย:**
- ค้นหาผู้ใช้จาก id
- ถ้าไม่พบ ส่ง error 404
- ถ้าพบ ลบผู้ใช้ออกจากอาเรย์และส่งข้อมูลผู้ใช้ที่ถูกลบกลับไป

#### - Root Endpoint
- `GET /`

```js
app.get('/', (req, res) => {
  res.send('Hello World!')
})
```
**อธิบาย:**
- ทดสอบว่าเซิร์ฟเวอร์ทำงานปกติหรือไม่ โดยจะส่งข้อความ "Hello World!" กลับไป

### 4. เริ่มต้นเซิร์ฟเวอร์
```js
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
```
**อธิบาย:**
- สั่งให้แอปพลิเคชันเริ่มฟังที่พอร์ต 3000 และแสดงข้อความใน console

## หมายเหตุ
- ข้อมูลผู้ใช้จะหายไปเมื่อรีสตาร์ทเซิร์ฟเวอร์ เพราะเก็บไว้ในหน่วยความจำเท่านั้น
- เหมาะสำหรับการทดลองหรือศึกษาการทำงานของ Express.js เบื้องต้น
