const sql = require('mssql');
const isDev = require('electron-is-dev');
const dbConfig = require('../src/prodconfig');
const devConfig = require('../src/devconfig');

const config = {
	user: dbConfig.DB_USER,
	password: dbConfig.DB_PASSWORD,
	server: isDev ? devConfig.DB_SERVER : dbConfig.DB_SERVER,
	database: dbConfig.DB_DATABASE,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	}
};

const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then(pool => {
		console.log('Connected to MSSQL');
		return pool;
	})
	.catch(error => console.err('Database connection Failed! Bad config: ', error));

module.exports = {sql, poolPromise};
