const sql = require('mssql')
const isDev = require('electron-is-dev')
const logger = require('electron-timber')
const dbConfig = require('../src/prodconfig')
const devConfig = require('../src/devconfig')

const config = {
  user: dbConfig.DB_USER,
  password: dbConfig.DB_PASSWORD,
  server: isDev ? devConfig.DB_SERVER : dbConfig.DB_SERVER,
  database: dbConfig.DB_DATABASE,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30_000
  }
}

// Check if environment variables are set and use those instead. Travis config has the encrypted
// key value pairs included so if possible it should use those as prodconfig is not added to the
// git repo.
if (process.env.DB_USER) {
  logger.log('Env variable for DB_USER found. Using this instead.')
  config.user = process.env.DB_USER
}

if (process.env.DB_PASSWORD) {
  logger.log('Env variable for DB_PASSWORD found. Using this instead.')
  config.password = process.env.DB_PASSWORD
}

if (process.env.DB_SERVER) {
  logger.log('Env variable for DB_SERVER found. Using this instead.')
  config.server = process.env.DB_SERVER
}

if (process.env.DB_DATABASE) {
  logger.log('Env variable for DB_DATABASE found. Using this instead.')
  config.database = process.env.DB_DATABASE
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(error => console.error('Database connection Failed! Bad config:', error))

module.exports = { sql, poolPromise }
