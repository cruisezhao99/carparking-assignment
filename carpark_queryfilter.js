const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
  origin: 'http://localhost:3000'  // 替换为你的前端应用的实际域名
}));

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Admin@123456',
  database: 'carparking',
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Carpark API',
      version: '1.0.0',
      description: 'API for carpark management system',
    },
  },
  apis: ['./carpark_queryfilter.js'], // 指向本文件
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /carparks:
 *   get:
 *     summary: Get filtered list of carparks
 *     parameters:
 *       - in: query
 *         name: freeParking
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: nightParking
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minHeight
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Successful response
 */
app.get('/carparks', async (req, res) => {
  try {
    const { freeParking, nightParking, minHeight } = req.query;
    let query = 'SELECT * FROM CarParks WHERE 1=1';
    const params = [];

    if (freeParking === 'true') {
        query += ' AND (free_parking != "NO" AND free_parking != "")';
    }
    if (nightParking === 'true') {
      query += ' AND night_parking = "YES"';
    }
    if (minHeight) {
      query += ' AND gantry_height >= ?';
      params.push(parseFloat(minHeight));
    }

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /favourites:
 *   post:
 *     summary: Add a carpark to favourites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               carParkId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Successfully added to favourites
 */
app.post('/favourites', async (req, res) => {
  try {
    const { userId, carParkId } = req.body;
    const [result] = await pool.query(
      'INSERT INTO UserFavourites (user_id, car_park_id) VALUES (?, ?)',
      [userId, carParkId]
    );
    res.status(201).json({ message: 'Added to favourites', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server running on port ${PORT}`);
});