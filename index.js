const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000

app.use(express.json())

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API Example',
      version: '1.0.0',
      description: 'API documentation with Swagger',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./index.js'],
}
const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

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
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 */
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
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing required fields
 */
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
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Product code already exists
 */
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
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of products
 */
app.get('/products', authenticateToken, (req, res) => {
  res.json(products)
})

// อ่านสินค้าด้วย id
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product id
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
app.get('/products/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id))
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
})

// ค้นหาสินค้าด้วยรหัสสินค้า
/**
 * @swagger
 * /products/code/{code}:
 *   get:
 *     summary: Get product by code
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Product code
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
app.get('/products/code/:code', authenticateToken, (req, res) => {
  const product = products.find(p => p.code === req.params.code)
  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }
  res.json(product)
})

// แก้ไขสินค้า
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
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
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product by id
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product id
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
app.delete('/products/:id', authenticateToken, (req, res) => {
  const idx = products.findIndex(p => p.id === parseInt(req.params.id))
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' })
  }
  const deleted = products.splice(idx, 1)[0]
  res.json(deleted)
})

// Read all users
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of users
 */
app.get('/users', (req, res) => {
  res.json(users)
})

// Read a single user by id
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User id
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id))
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

// Update a user by id
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
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
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User id
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
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
