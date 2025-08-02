const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000

app.use(express.json())

// In-memory user storage
let users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', password: 'alice123' },
  { id: 2, name: 'Bob', email: 'bob@example.com', password: 'bob123' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', password: 'charlie123' }
]
let nextId = 4

// In-memory product storage
let products = [
  { id: 1, code: 'P001', name: 'Laptop', price: 25000 },
  { id: 2, code: 'P002', name: 'Mouse', price: 500 },
  { id: 3, code: 'P003', name: 'Keyboard', price: 1200 }
]
let nextProductId = 4

const JWT_SECRET = 'mysecretkey'

// Middleware ตรวจสอบ JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token required' })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// Create a new user
app.post('/users', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }
  const user = { id: nextId++, name, email, password }
  users.push(user)
  res.status(201).json({ id: user.id, name: user.name, email: user.email })
})
// ----------- Product CRUD (ต้อง login ก่อน) -----------

// สร้างสินค้าใหม่
app.post('/products', authenticateToken, (req, res) => {
  const { code, name, price } = req.body
  if (!code || !name || !price) {
    return res.status(400).json({ error: 'Code, name, and price are required' })
  }
  if (products.find(p => p.code === code)) {
    return res.status(409).json({ error: 'Product code already exists' })
  }
  const product = { id: nextProductId++, code, name, price }
  products.push(product)
  res.status(201).json(product)
})

// อ่านสินค้าทั้งหมด
app.get('/products', authenticateToken, (req, res) => {
  res.json(products)
})

// อ่านสินค้าด้วย id
app.get('/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id))
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
})

// ค้นหาสินค้าด้วยรหัสสินค้า
app.get('/products/code/:code', authenticateToken, (req, res) => {
  const product = products.find(p => p.code === req.params.code)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
})

// แก้ไขสินค้า
app.put('/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id))
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const { code, name, price } = req.body
  if (code) product.code = code
  if (name) product.name = name
  if (price) product.price = price
  res.json(product)
})

// ลบสินค้า
app.delete('/products/:id', authenticateToken, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const deleted = products.splice(idx, 1)[0]
  res.json(deleted)
})

// Read all users
app.get('/users', (req, res) => {
  res.json(users)
})

// Read a single user by id
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

// Update a user by id
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

// Delete a user by id
app.delete('/users/:id', (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id))
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' })
  }
  const deletedUser = users.splice(userIndex, 1)[0]
  res.json(deletedUser)
})

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
