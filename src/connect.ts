import sql from 'mssql';
import isDev from 'electron-is-dev';
import databaseConfig from '../src/prodconfig';
import developmentConfig from '../src/devconfig';
import logger from 'electron-timber';

const config = {
	user: databaseConfig.DB_USER,
	password: databaseConfig.DB_PASSWORD,
	server: isDev ? developmentConfig.DB_SERVER : databaseConfig.DB_SERVER,
	database: databaseConfig.DB_DATABASE,
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	}
};

// Check if environment variables are set and use those instead. Travis config has the encrypted
// key value pairs included so if possible it should use those as prodconfig is not added to the
// git repo.
if (process.env.DB_USER) {
	logger.log('Env variable for DB_USER found. Using this instead.');
	config.user = process.env.DB_USER;
}

if (process.env.DB_PASSWORD) {
	logger.log('Env variable for DB_PASSWORD found. Using this instead.');
	config.password = process.env.DB_PASSWORD;
}

if (process.env.DB_SERVER) {
	logger.log('Env variable for DB_SERVER found. Using this instead.');
	config.server = process.env.DB_SERVER;
}

if (process.env.DB_DATABASE) {
	logger.log('Env variable for DB_DATABASE found. Using this instead.');
	config.database = process.env.DB_DATABASE;
}

export const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then((pool: any) => {
		console.log('Connected to MSSQL');
		return pool;
	})
	.catch((error: Error) =>
		console.error('Database connection Failed! Bad config:', error)
	);
