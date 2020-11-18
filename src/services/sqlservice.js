const sql = require('mssql');
const isDev = require('electron-is-dev');
const dbConfig = require('../prodconfig');
const devConfig = require('../devconfig');

// Const {ipcMain} = require('electron');

/**
 * @typedef {Promise<Object>} StoredProcedureSuccess
 * @property {number} O_iErrorState - Non-zero value is failure
 * @property {string|null} oErrString - String describing the failure
 */

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

const pool = new sql.ConnectionPool(config);
const poolPromise = pool.connect();

pool.on('error', error => {
	console.error('SQL Pool error:', error);
});

const debtorSearchQuery = 'SELECT RTRIM(CUSTNMBR) as CUSTNMBR, RTRIM(CUSTNAME) as CUSTNAME, CASE INACTIVE WHEN 0 THEN \'Active\' WHEN 1 THEN \'Inactive\' END AS STATUS FROM RM00101 WITH(NOLOCK) WHERE CUSTNMBR LIKE @AccountNumber + \'%\' OR CUSTNMBR = @AccountNumber';
const vendorSearchQuery = 'SELECT RTRIM(VENDORID) AS VENDORID, RTRIM(VENDNAME) AS VENDNAME, CASE RTRIM(VENDSTTS) WHEN 1 THEN \'Active\' WHEN 2 THEN \'Inactive\' END as STATUS FROM PM00200 WITH(NOLOCK) WHERE VENDORID LIKE @AccountNumber + \'%\' OR VENDORID = @AccountNumber';
const debtorEntityQuery = 'SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900270 WITH(NOLOCK) WHERE CUSTNMBR = @AccountNumber';
const vendorEntityQuery = 'SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900220 WITH(NOLOCK) WHERE VENDORID = @AccountNumber';

// Check if environment variables are set and use those instead. Travis config has the encrypted
// key value pairs included so if possible it should use those as prodconfig is not added to the
// git repo.
if (process.env.DB_USER) {
	console.log('Env variable for DB_USER found. Using this instead.');
	config.user = process.env.DB_USER;
}

if (process.env.DB_PASSWORD) {
	console.log('Env variable for DB_PASSWORD found. Using this instead.');
	config.password = process.env.DB_PASSWORD;
}

if (process.env.DB_SERVER) {
	console.log('Env variable for DB_SERVER found. Using this instead.');
	config.server = process.env.DB_SERVER;
}

if (process.env.DB_DATABASE) {
	console.log('Env variable for DB_DATABASE found. Using this instead.');
	config.database = process.env.DB_DATABASE;
}

// Const poolPromise = new sql.ConnectionPool(config)
// 	.connect()
// 	.then(pool => {
// 		console.log('Connected to MSSQL');
// 		pool.on('connect', (connection, error) => {
// 			console.dir(connection);
// 			console.dir(error);
// 		});
// 		return pool;
// 	})
// 	.catch(error => console.error('Database connection Failed! Bad config:', error));

async function getAccounts(accountType, accountNumber) {
	const pool = await poolPromise;
	try {
		const request = pool.request();
		request.input('AccountNumber', sql.VarChar, accountNumber);
		const result = accountType === 'debtor' ? await request.query(debtorSearchQuery) : await request.query(vendorSearchQuery);
		return result;
	} catch (error) {
		console.error('SQL error', error);
	}
}

async function assignEntity(accountType, accountNumber, accountEntity) {
	const pool = await poolPromise;
	const accountInput = accountType === 'debtor' ? 'I_vCUSTNMBR' : 'I_vVENDORID';
	const storedProcedure = accountType === 'debtor' ? 'CustomBSSIUpdateCreateCustomerRcd' : 'CustomBSSIUpdateCreateVendorRcd';
	try {
		const request = pool.request();
		request.input(accountInput, sql.VarChar, accountNumber);
		request.input('I_vFacility', sql.VarChar, accountEntity);
		request.output('O_iErrorState', sql.Int);
		request.output('oErrString', sql.VarChar);
		const result = await request.execute(storedProcedure);
		return result;
	} catch (error) {
		console.error('SQL error', error);
	}
}

async function getEntities(accountType, accountNumber) {
	const pool = await poolPromise;
	try {
		const request = pool.request();
		request.input('AccountNumber', sql.VarChar, accountNumber);
		const result = accountType === 'debtor' ? await request.query(debtorEntityQuery) : await request.query(vendorEntityQuery);
		return result;
	} catch (error) {
		console.error('SQL error', error);
	}
}

/**
 *
 * Removes/unassigns the entity from the account number
 * @param {('debtor'|'vendor')} accountType Should be either debtor or vendor
 * @param {string} accountNumber Either a GP debtor code or vendor code
 * @param {string} accountEntity Three digit entity to remove from account
 * @return {StoredProcedureSuccess} Object outlining the success of the stored proc
 */
async function removeEntity(accountType, accountNumber, accountEntity) {
	const pool = await poolPromise;
	const accountInput = accountType === 'debtor' ? 'I_vCUSTNMBR' : 'I_vVENDORID';
	const storedProcedure = accountType === 'debtor' ? 'fs_BSSIRemoveCustomerRcd' : 'fs_BSSIRemoveVendorRcd';
	try {
		const request = pool.request();
		request.input(accountInput, sql.VarChar, accountNumber);
		request.input('I_vFACILITY', sql.VarChar, accountEntity);
		request.output('O_iErrorState', sql.Int);
		request.output('oErrString', sql.VarChar);
		const result = await request.execute(storedProcedure);
		return result;
	} catch (error) {
		console.error('SQL error', error);
	}
}

async function getSqlServer() {
	const pool = await poolPromise;
	return pool.config.server;
}

async function closeServer() {
	const pool = await poolPromise;
	pool.close();
}

module.exports = {
	getSqlServer, removeEntity, getAccounts, assignEntity, getEntities, closeServer
};

