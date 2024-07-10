const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Admin@123456',
  database: 'carparking',
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 处理CSV文件并插入数据库的主函数
async function processCsvFile(filePath) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const results = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of results) {
      await insertData(connection, row);
    }

    await connection.commit();
    console.log('All records processed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error processing file. Rolling back:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// 插入数据到各个表
async function insertData(connection, row) {
  // 插入或获取 CarParkTypes
  const carParkTypeId = await insertOrGetId(connection, 'CarParkTypes', 'Car_Park_TypeName', row.car_park_type);

  // 插入或获取 ParkingSystemType
  const parkingSystemTypeId = await insertOrGetId(connection, 'ParkingSystemType', 'Parking_System_Name', row.type_of_parking_system);

  // 插入或获取 ShortTermParking
  const shortTermParkingId = await insertOrGetId(connection, 'ShortTermParking', 'Short_Term_Parking_Description', row.short_term_parking);

  // 插入 CarParks
  const [result] = await connection.query(
    'INSERT INTO CarParks (car_park_no, address, x_coord, y_coord, car_park_type_id, type_of_parking_system_id, short_term_parking_id, free_parking, night_parking, car_park_decks, gantry_height, car_park_basement) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      row.car_park_no,
      row.address,
      parseFloat(row.x_coord),
      parseFloat(row.y_coord),
      carParkTypeId,
      parkingSystemTypeId,
      shortTermParkingId,
      row.free_parking,
      row.night_parking,
      parseInt(row.car_park_decks),
      parseFloat(row.gantry_height),
      row.car_park_basement
    ]
  );

  console.log(`Inserted CarPark with ID: ${result.insertId}`);
}

// 插入或获取ID的辅助函数
async function insertOrGetId(connection, tableName, columnName, value) {
  const [rows] = await connection.query(`SELECT ID FROM ${tableName} WHERE ${columnName} = ?`, [value]);
  if (rows.length > 0) {
    return rows[0].ID;
  } else {
    const [result] = await connection.query(`INSERT INTO ${tableName} (${columnName}) VALUES (?)`, [value]);
    return result.insertId;
  }
}

// 运行批处理作业
(async () => {
  try {
    await processCsvFile('hdb-carpark-information-20220824010400.csv');
    console.log('Batch job completed successfully');
  } catch (error) {
    console.error('Batch job failed:', error);
  } finally {
    pool.end();
  }
})();