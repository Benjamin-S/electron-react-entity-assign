const sql = require('mssql');
const isDev = require('electron-is-dev');
const db_config = require('../src/prodconfig');
const dev_config = require('../src/devconfig');

config = {
  user: db_config.DB_USER,
  password: db_config.DB_PASSWORD,
  server: isDev ? dev_config.DB_SERVER : db_config.DB_SERVER,
  database: db_config.DB_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch((err) => console.err('Database connection Failed! Bad config: ', err));

module.exports = { sql, poolPromise };
