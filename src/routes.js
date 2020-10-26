/* eslint new-cap:off */

const express = require('express');
const router = express.Router();
const {poolPromise, sql} = require('./connect');
const logger = require('electron-timber');

router.get('/creditors/entities/:id', async (request, response) => {
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
		logger.error(error);
		logger.log(error.message);
	}
});

router.get('/creditors/:id', async (request, response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.query(
				`SELECT RTRIM(VENDORID) AS VENDORID,
				RTRIM(VENDNAME) AS VENDNAME,
				CASE RTRIM(VENDSTTS)
				WHEN 1 THEN 'Active'
				WHEN 2 THEN 'Inactive'
				END as STATUS FROM PM00200 WITH(NOLOCK) WHERE VENDORID LIKE '${request.params.id}%'
				OR VENDORID = '${request.params.id}'`
			);
		response.json(result);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		logger.error(error);
		logger.log(error.message);
	}
});

router.post('/creditors/', async (request, response) => {
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
		logger.error(error);
		logger.log(error.message);
	}
});

router.delete('/creditors/', async (request, response) => {
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
		logger.error(error);
		logger.log(error.message);
	}
});

router.get('/debtors/entities/:id', async (request, response) => {
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
		logger.error(error);
		logger.log(error.message);
	}
});

router.get('/debtors/:id', async (request, response) => {
	try {
		const pool = await poolPromise;
		const result = await pool
			.request()
			.query(
				`SELECT RTRIM(CUSTNMBR) as CUSTNMBR, RTRIM(CUSTNAME) as CUSTNAME, CASE INACTIVE WHEN 0 THEN 'Active' WHEN 1 THEN 'Inactive' END AS STATUS FROM RM00101 WITH(NOLOCK) WHERE CUSTNMBR LIKE '${request.params.id}%' OR CUSTNMBR = '${request.params.id}'`
			);
		response.json(result);
	} catch (error) {
		response.status(500);
		response.send(error.message);
		logger.error(error);
		logger.log(error.message);
	}
});

router.post('/debtors/', async (request, response) => {
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
		logger.error(error);
		logger.log(request.body);
	}
});

router.delete('/debtors/', async (request, response) => {
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
		logger.error(error);
		logger.log(error.message);
	}
});

module.exports = router;
