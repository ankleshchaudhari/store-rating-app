const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Aa@141201',
  database: process.env.DB_NAME || 'store_rating_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist and have the correct role
    const [users] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }
    
    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};

// Role-based authorization middleware
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, address, password, role = 'user' } = req.body;
    
    // Validate input
    if (!name || !email || !address || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    // Validate address length
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be less than 400 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      });
    }
    
    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, hashedPassword, role]
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user info and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Admin routes
app.get('/api/admin/stats', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get total users
    const [userResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = userResult[0].count;
    
    // Get total stores
    const [storeResult] = await pool.query('SELECT COUNT(*) as count FROM stores');
    const totalStores = storeResult[0].count;
    
    // Get total ratings
    const [ratingResult] = await pool.query('SELECT COUNT(*) as count FROM ratings');
    const totalRatings = ratingResult[0].count;
    
    res.json({
      totalUsers,
      totalStores,
      totalRatings
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

app.get('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get all users
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.address, u.role,
        (SELECT AVG(r.rating) FROM ratings r 
         JOIN stores s ON r.store_id = s.id 
         WHERE s.owner_id = u.id) as rating
      FROM users u
      ORDER BY u.name ASC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

app.get('/api/admin/stores', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get all stores with average rating
    const [stores] = await pool.query(`
      SELECT s.id, s.name, s.email, s.address,
        IFNULL(AVG(r.rating), 0) as rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);
    
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
});

app.get('/api/admin/store-owners', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    // Get all store owners
    const [storeOwners] = await pool.query(`
      SELECT id, name, email
      FROM users
      WHERE role = 'store_owner'
      ORDER BY name ASC
    `);
    
    res.json(storeOwners);
  } catch (error) {
    console.error('Error fetching store owners:', error);
    res.status(500).json({ message: 'Server error fetching store owners' });
  }
});

app.post('/api/admin/users', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    
    // Validate input
    if (!name || !email || !address || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    // Validate address length
    if (address.length > 400) {
      return res.status(400).json({ message: 'Address must be less than 400 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
      });
    }
    
    // Validate role
    const validRoles = ['admin', 'store_owner', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const [result] = await pool.query(
      'INSERT INTO users (name, email, address, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, hashedPassword, role]
    );
    
    res.status(201).json({ 
      message: 'User added successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error adding user' });
  }
});

app.post('/api/admin/stores', authenticateToken, authorize(['admin']), async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;
    
    // Validate input
    if (!name || !email || !address || !ownerId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate name length
    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 20 and 60 characters' });
    }
    
    // Validate address length
    if (address.length > 40) {
      return res.status(400).json({ message: 'Address must be less than 400 characters' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if owner exists and is a store owner
    const [owners] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND role = "store_owner"',
      [ownerId]
    );
    
    if (owners.length === 0) {
      return res.status(404).json({ message: 'Store owner not found' });
    }
    
    // Check if email already exists
    const [existingStores] = await pool.query(
      'SELECT * FROM stores WHERE email = ?',
      [email]
    );
    
    if (existingStores.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    
    // Insert store into database
    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId]
    );
    
    res.status(201).json({ 
      message: 'Store added successfully',
      storeId: result.insertId
    });
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({ message: 'Server error adding store' });
  }
});

// User routes
app.get('/api/stores', authenticateToken, async (req, res) => {
  try {
    // Get all stores with average rating and user's rating
    const [stores] = await pool.query(`
      SELECT s.id, s.name, s.address,
        IFNULL(AVG(r.rating), 0) as averageRating,
        (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = ?) as userRating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.name ASC
    `, [req.user.id]);
    
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Server error fetching stores' });
  }
});

app.post('/api/ratings', authenticateToken, authorize(['user']), async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!storeId || !rating) {
      return res.status(400).json({ message: 'Store ID and rating are required' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }
    
    // Check if store exists
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE id = ?',
      [storeId]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user has already rated this store
    const [existingRatings] = await pool.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      await pool.query(
        'UPDATE ratings SET rating = ?, updated_at = NOW() WHERE user_id = ? AND store_id = ?',
        [rating, userId, storeId]
      );
      
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Insert new rating
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Server error submitting rating' });
  }
});


// Store Owner routes
app.get('/api/store-owner/store', authenticateToken, authorize(['store_owner']), async (req, res) => {
  try {
    // Get store owner's store with average rating
    const [stores] = await pool.query(`
      SELECT s.id, s.name, s.address,
        IFNULL(AVG(r.rating), 0) as averageRating,
        COUNT(r.id) as totalRatings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `, [req.user.id]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Error fetching store data:', error);
    res.status(500).json({ message: 'Server error fetching store data' });
  }
});

app.get('/api/store-owner/ratings/:storeId', authenticateToken, authorize(['store_owner']), async (req, res) => {
  try {
    const { storeId } = req.params;
    
    // Check if store exists and belongs to the store owner
    const [stores] = await pool.query(
      'SELECT * FROM stores WHERE id = ? AND owner_id = ?',
      [storeId, req.user.id]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found or not owned by you' });
    }
    
    // Get users who rated the store
    const [ratingUsers] = await pool.query(`
      SELECT u.id, u.name, u.email, r.rating, r.created_at as ratedAt
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);
    
    res.json(ratingUsers);
  } catch (error) {
    console.error('Error fetching rating users:', error);
    res.status(500).json({ message: 'Server error fetching rating users' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});