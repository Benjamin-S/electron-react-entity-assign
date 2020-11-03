import {Request, Response} from 'express';
import developmentConfig from './devconfig';
import bodyParser from 'body-parser';
import cors from 'cors';
import sql from 'mssql';
import isDev from 'electron-is-dev';
import databaseConfig from './prodconfig';
import express from 'express';
const expressApp = express();
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

const poolPromise = new sql.ConnectionPool(config)
	.connect()
	.then((pool: any) => {
		console.log('Connected to MSSQL');
		return pool;
	})
	.catch((error: Error) =>
		console.error('Database connection Failed! Bad config:', error)
	);

if (databaseConfig && !process.env.GH_TOKEN) {
	process.env.GH_TOKEN = databaseConfig.GH_TOKEN;
}

const port = 4000;
const router = express.Router();

router.get(
	'/creditors/entities/:id',
	async (request: Request, response: Response) => {
		try {
			const pool = await poolPromise;
			const result = await pool
				.request()
				.query(
					`SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900220 WITH(NOLOCK) WHERE VENDORID = '${request.params.id}'`
				);
			response.json(result);
		} catch (error) {
			response.status(500);
			response.send(error.message);
			console.error(error);
			console.log(error.message);
		}
	}
);

router.get('/creditors/:id', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool.request().query(
			`SELECT RTRIM(VENDORID) AS AccountId,
				RTRIM(VENDNAME) AS AccountName,
				CASE RTRIM(VENDSTTS)
				WHEN 1 THEN 'Active'
				WHEN 2 THEN 'Inactive'
				END as AccountStatus FROM PM00200 WITH(NOLOCK) WHERE VENDORID LIKE '${request.params.id}%'
				OR VENDORID = '${request.params.id}'`
		);
		response.json(result);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(error.message);
	}
});

router.post('/creditors/', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.input('I_vVENDORID', sql.VarChar(15), request.body.creditor)
			.input('I_vFacility', sql.VarChar(60), request.body.entity)
			.output('O_iErrorState', sql.Int)
			.output('oErrString', sql.VarChar(255))
			.execute('CustomBSSIUpdateCreateVendorRcd');

		response.json(result.output);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(error.message);
	}
});

router.delete('/creditors/', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.input('I_vVENDORID', sql.VarChar(20), request.body.creditor)
			.input('I_vFACILITY', sql.VarChar(10), request.body.entity)
			.output('O_iErrorState', sql.Int)
			.output('oErrString', sql.VarChar(255))
			.execute('fs_BSSIRemoveVendorRcd');

		response.json(result.output);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(error.message);
	}
});

router.get(
	'/debtors/entities/:id',
	async (request: Request, response: Response) => {
		try {
			const pool = await poolPromise;
			const result = await pool
				.request()
				.query(
					`SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900270 WITH(NOLOCK) WHERE CUSTNMBR = '${request.params.id}'`
				);
			response.json(result);
		} catch (error) {
			response.status(500);
			response.send(error.message);
			console.error(error);
			console.log(error.message);
		}
	}
);

router.get('/debtors/:id', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool.request().query(
			`SELECT RTRIM(CUSTNMBR) as CUSTNMBR,
				RTRIM(CUSTNAME) as AccountId,
				CASE INACTIVE
				WHEN 0 THEN 'Active'
				WHEN 1 THEN 'Inactive'
				END AS AccountStatus FROM RM00101 WITH(NOLOCK) WHERE CUSTNMBR LIKE '${request.params.id}%' OR CUSTNMBR = '${request.params.id}'`
		);
		response.json(result);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(error.message);
	}
});

router.post('/debtors/', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.input('I_vCUSTNMBR', sql.VarChar(15), request.body.debtor)
			.input('I_vFacility', sql.VarChar(60), request.body.entity)
			.output('O_iErrorState', sql.Int)
			.output('oErrString', sql.VarChar(255))
			.execute('CustomBSSIUpdateCreateCustomerRcd');

		response.json(result.output);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(request.body);
	}
});

router.delete('/debtors/', async (request: Request, response: Response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.input('I_vCUSTNMBR', sql.VarChar(20), request.body.debtor)
			.input('I_vFACILITY', sql.VarChar(10), request.body.entity)
			.output('O_iErrorState', sql.Int)
			.output('oErrString', sql.VarChar(255))
			.execute('fs_BSSIRemoveCustomerRcd');

		response.json(result.output);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		console.error(error);
		console.log(error.message);
	}
});

expressApp.use(cors());
expressApp.use(bodyParser.json());
expressApp.use('/', router);

expressApp.listen(process.env.PORT || port, () => {
	console.log(`Express server listening on port ${port}`);
});
