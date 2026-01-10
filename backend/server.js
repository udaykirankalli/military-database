
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://military-database.vercel.app'
    ];
    
    // Allow all Vercel preview deployments
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info(`Incoming Request: ${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString()
  });
  next();
});


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Access token required. Please login to continue.' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid or expired token. Please login again.' 
      });
    }
    req.user = user;
    next();
  });
};


const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user?.email} - Required roles: ${allowedRoles.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. You do not have permission to perform this action.' 
      });
    }
    next();
  };
};


const logAudit = async (userId, action, entityType, entityId, details) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, timestamp) 
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [userId, action, entityType, entityId, JSON.stringify(details)]
    );
    logger.info(`Audit Log: ${action} ${entityType}`, { userId, entityId });
  } catch (error) {
    logger.error('Failed to create audit log:', error);
  }
};


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and password are required' 
      });
    }

    // Fetch user from database
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      logger.warn(`Invalid password attempt for user: ${email}`);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        base_id: user.base_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last login time
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Log successful login
    await logAudit(user.id, 'LOGIN', 'USER', user.id, { email });

    logger.info(`Successful login: ${email}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        base_id: user.base_id
      }
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error during authentication. Please try again.' 
    });
  }
});


app.get('/api/dashboard/metrics', authenticateToken, async (req, res) => {
  try {
    const { base_id, date_from, date_to } = req.query;
    
    let baseFilter = '';
    let params = [];
    let paramIndex = 1;

    // Apply base filter based on user role
    if (req.user.role === 'commander') {
      // Commanders can only see their own base
      baseFilter = `WHERE base_id = $${paramIndex}`;
      params.push(req.user.base_id);
      paramIndex++;
    } else if (base_id && req.user.role === 'admin') {
      // Admins can filter by any base
      baseFilter = `WHERE base_id = $${paramIndex}`;
      params.push(base_id);
      paramIndex++;
    }

    // Calculate opening balance (total assets)
    const openingQuery = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM assets ${baseFilter}`,
      params
    );
    const openingBalance = parseInt(openingQuery.rows[0].total);

    // Calculate purchases
    const purchasesQuery = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM purchases ${baseFilter}`,
      params
    );
    const purchases = parseInt(purchasesQuery.rows[0].total);

    // Calculate transfers in
    const transfersInFilter = req.user.role === 'commander' 
      ? 'WHERE to_base_id = $1' 
      : (base_id ? 'WHERE to_base_id = $1' : '');
    
    const transfersInQuery = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers ${transfersInFilter}`,
      req.user.role === 'commander' ? [req.user.base_id] : (base_id ? [base_id] : [])
    );
    const transferIn = parseInt(transfersInQuery.rows[0].total);

    // Calculate transfers out
    const transfersOutFilter = req.user.role === 'commander' 
      ? 'WHERE from_base_id = $1' 
      : (base_id ? 'WHERE from_base_id = $1' : '');
    
    const transfersOutQuery = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM transfers ${transfersOutFilter}`,
      req.user.role === 'commander' ? [req.user.base_id] : (base_id ? [base_id] : [])
    );
    const transferOut = parseInt(transfersOutQuery.rows[0].total);

    // Calculate assigned assets
    const assignmentsQuery = await pool.query(
      `SELECT COALESCE(COUNT(*), 0) as total FROM assignments ${baseFilter} ${baseFilter ? 'AND' : 'WHERE'} status = 'active'`,
      params
    );
    const assigned = parseInt(assignmentsQuery.rows[0].total);

    // Calculate expended assets
    const expendedQuery = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) as total FROM expenditures ${baseFilter}`,
      params
    );
    const expended = parseInt(expendedQuery.rows[0].total);

    // Calculate net movement and closing balance
    const netMovement = purchases + transferIn - transferOut;
    const closingBalance = openingBalance + netMovement;

    res.json({
      success: true,
      data: {
        openingBalance,
        closingBalance,
        netMovement,
        purchases,
        transferIn,
        transferOut,
        assigned,
        expended
      }
    });

  } catch (error) {
    logger.error('Dashboard metrics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch dashboard metrics' 
    });
  }
});


app.get('/api/purchases', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        p.id,
        p.base_id,
        p.equipment_type_id,
        p.quantity,
        p.cost,
        p.purchase_date,
        p.supplier,
        p.notes,
        p.created_at,
        b.name as base_name,
        e.name as equipment_name,
        e.category as equipment_category,
        u.name as created_by_name
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types e ON p.equipment_type_id = e.id
      LEFT JOIN users u ON p.created_by = u.id
    `;
    
    let params = [];

    // Apply role-based filtering
    if (req.user.role === 'commander') {
      query += ' WHERE p.base_id = $1';
      params.push(req.user.base_id);
    }

    query += ' ORDER BY p.purchase_date DESC, p.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    logger.error('Get purchases error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch purchase records' 
    });
  }
});

app.post('/api/purchases', authenticateToken, checkRole('admin', 'commander'), async (req, res) => {
  try {
    const { base_id, equipment_type_id, quantity, cost, purchase_date, supplier, notes } = req.body;

    // Input validation
    if (!base_id || !equipment_type_id || !quantity || !purchase_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Required fields: base_id, equipment_type_id, quantity, purchase_date' 
      });
    }

    // Commanders can only create purchases for their own base
    if (req.user.role === 'commander' && base_id !== req.user.base_id) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only create purchases for your assigned base' 
      });
    }

    // Insert purchase record
    const result = await pool.query(
      `INSERT INTO purchases 
       (base_id, equipment_type_id, quantity, cost, purchase_date, supplier, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [base_id, equipment_type_id, quantity, cost, purchase_date, supplier, notes, req.user.id]
    );

    const purchase = result.rows[0];

    // Create audit log
    await logAudit(req.user.id, 'CREATE', 'PURCHASE', purchase.id, {
      base_id,
      equipment_type_id,
      quantity,
      cost
    });

    logger.info(`New purchase created: ID ${purchase.id} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Purchase record created successfully',
      data: purchase
    });

  } catch (error) {
    logger.error('Create purchase error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create purchase record' 
    });
  }
});

app.get('/api/transfers', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        t.id,
        t.from_base_id,
        t.to_base_id,
        t.equipment_type_id,
        t.quantity,
        t.transfer_date,
        t.status,
        t.notes,
        t.created_at,
        fb.name as from_base_name,
        tb.name as to_base_name,
        e.name as equipment_name,
        e.category as equipment_category,
        u.name as created_by_name
      FROM transfers t
      JOIN bases fb ON t.from_base_id = fb.id
      JOIN bases tb ON t.to_base_id = tb.id
      JOIN equipment_types e ON t.equipment_type_id = e.id
      LEFT JOIN users u ON t.created_by = u.id
    `;
    
    let params = [];

    // Commanders can only see transfers involving their base
    if (req.user.role === 'commander') {
      query += ' WHERE (t.from_base_id = $1 OR t.to_base_id = $1)';
      params.push(req.user.base_id);
    }

    query += ' ORDER BY t.transfer_date DESC, t.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    logger.error('Get transfers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch transfer records' 
    });
  }
});


app.post('/api/transfers', authenticateToken, checkRole('admin', 'commander', 'logistics'), async (req, res) => {
  try {
    const { from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, notes } = req.body;

    // Input validation
    if (!from_base_id || !to_base_id || !equipment_type_id || !quantity || !transfer_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Required fields: from_base_id, to_base_id, equipment_type_id, quantity, transfer_date' 
      });
    }

    // Prevent transfer to same base
    if (from_base_id === to_base_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Cannot transfer to the same base' 
      });
    }

    // Commanders can only create transfers involving their base
    if (req.user.role === 'commander') {
      if (from_base_id !== req.user.base_id && to_base_id !== req.user.base_id) {
        return res.status(403).json({ 
          success: false,
          error: 'You can only create transfers involving your assigned base' 
        });
      }
    }

    // Insert transfer record
    const result = await pool.query(
      `INSERT INTO transfers 
       (from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7) 
       RETURNING *`,
      [from_base_id, to_base_id, equipment_type_id, quantity, transfer_date, notes, req.user.id]
    );

    const transfer = result.rows[0];

    // Create audit log
    await logAudit(req.user.id, 'CREATE', 'TRANSFER', transfer.id, {
      from_base_id,
      to_base_id,
      equipment_type_id,
      quantity
    });

    logger.info(`New transfer created: ID ${transfer.id} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Transfer record created successfully',
      data: transfer
    });

  } catch (error) {
    logger.error('Create transfer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create transfer record' 
    });
  }
});


app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    let query = `
      SELECT 
        a.id,
        a.base_id,
        a.equipment_type_id,
        a.personnel_id,
        a.serial_number,
        a.assignment_date,
        a.return_date,
        a.status,
        a.notes,
        a.created_at,
        e.name as equipment_name,
        e.category as equipment_category,
        b.name as base_name,
        p.name as personnel_name,
        p.rank as personnel_rank,
        p.unit as personnel_unit,
        u.name as created_by_name
      FROM assignments a
      JOIN equipment_types e ON a.equipment_type_id = e.id
      JOIN bases b ON a.base_id = b.id
      JOIN personnel p ON a.personnel_id = p.id
      LEFT JOIN users u ON a.created_by = u.id
    `;
    
    let params = [];

    // Commanders can only see assignments for their base
    if (req.user.role === 'commander') {
      query += ' WHERE a.base_id = $1';
      params.push(req.user.base_id);
    }

    query += ' ORDER BY a.assignment_date DESC, a.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    logger.error('Get assignments error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch assignment records' 
    });
  }
});


app.post('/api/assignments', authenticateToken, checkRole('admin', 'commander'), async (req, res) => {
  try {
    const { base_id, equipment_type_id, personnel_id, serial_number, assignment_date, notes } = req.body;

    // Input validation
    if (!base_id || !equipment_type_id || !personnel_id || !assignment_date) {
      return res.status(400).json({ 
        success: false,
        error: 'Required fields: base_id, equipment_type_id, personnel_id, assignment_date' 
      });
    }

    // Commanders can only create assignments for their base
    if (req.user.role === 'commander' && base_id !== req.user.base_id) {
      return res.status(403).json({ 
        success: false,
        error: 'You can only create assignments for your assigned base' 
      });
    }

    // Insert assignment record
    const result = await pool.query(
      `INSERT INTO assignments 
       (base_id, equipment_type_id, personnel_id, serial_number, assignment_date, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, 'active', $6, $7) 
       RETURNING *`,
      [base_id, equipment_type_id, personnel_id, serial_number, assignment_date, notes, req.user.id]
    );

    const assignment = result.rows[0];

    // Create audit log
    await logAudit(req.user.id, 'CREATE', 'ASSIGNMENT', assignment.id, {
      base_id,
      equipment_type_id,
      personnel_id,
      serial_number
    });

    logger.info(`New assignment created: ID ${assignment.id} by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Assignment record created successfully',
      data: assignment
    });

  } catch (error) {
    logger.error('Create assignment error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create assignment record' 
    });
  }
});


app.get('/api/bases', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, location, commander_name FROM bases ORDER BY name'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Get bases error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch bases' 
    });
  }
});


app.get('/api/equipment-types', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, category, description, unit_of_measure FROM equipment_types ORDER BY category, name'
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    logger.error('Get equipment types error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch equipment types' 
    });
  }
});


app.get('/api/audit-logs', authenticateToken, checkRole('admin'), async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT 
        al.id,
        al.user_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.details,
        al.timestamp,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
       FROM audit_logs al
       JOIN users u ON al.user_id = u.id
       ORDER BY al.timestamp DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    logger.error('Get audit logs error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch audit logs' 
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * 404 handler - Route not found
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found. Please check the API documentation.'
  });
});

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error. Please try again later.'
  });
});


app.listen(PORT, () => {
  logger.info(`Server started successfully on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  pool.end(() => {
    logger.info('Database pool closed');
    process.exit(0);
  });
});