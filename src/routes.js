const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('./connect');
const logger = require('electron-timber');

router.get('/creditors/entities/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900220 WITH(NOLOCK) WHERE VENDORID = '${req.params.id}'`
      );
    res.json(result);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.get('/creditors/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT RTRIM(VENDORID) AS VENDORID, RTRIM(VENDNAME) AS VENDNAME FROM PM00200 WITH(NOLOCK) WHERE VENDORID LIKE '${req.params.id}%'`
      );
    res.json(result);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.post('/creditors/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('I_vVENDORID', sql.VarChar(15), req.body.creditor)
      .input('I_vFacility', sql.VarChar(60), req.body.entity)
      .output('O_iErrorState', sql.Int)
      .output('oErrString', sql.VarChar(255))
      .execute('CustomBSSIUpdateCreateVendorRcd');

    res.json(result.output);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.delete('/creditors/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('I_vVENDORID', sql.VarChar(20), req.body.creditor)
      .input('I_vFACILITY', sql.VarChar(10), req.body.entity)
      .output('O_iErrorState', sql.Int)
      .output('oErrString', sql.VarChar(255))
      .execute('fs_BSSIRemoveVendorRcd');

    res.json(result.output);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.get('/debtors/entities/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900270 WITH(NOLOCK) WHERE CUSTNMBR = '${req.params.id}'`
      );
    res.json(result);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.get('/debtors/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT RTRIM(CUSTNMBR) as CUSTNMBR, RTRIM(CUSTNAME) as CUSTNAME FROM RM00101 WITH(NOLOCK) WHERE CUSTNMBR LIKE '${req.params.id}%'`
      );
    res.json(result);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

router.post('/debtors/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('I_vCUSTNMBR', sql.VarChar(15), req.body.debtor)
      .input('I_vFacility', sql.VarChar(60), req.body.entity)
      .output('O_iErrorState', sql.Int)
      .output('oErrString', sql.VarChar(255))
      .execute('CustomBSSIUpdateCreateCustomerRcd');

    res.json(result.output);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(req.body);
  }
});

router.delete('/debtors/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('I_vCUSTNMBR', sql.VarChar(20), req.body.debtor)
      .input('I_vFACILITY', sql.VarChar(10), req.body.entity)
      .output('O_iErrorState', sql.Int)
      .output('oErrString', sql.VarChar(255))
      .execute('fs_BSSIRemoveCustomerRcd');

    res.json(result.output);
  } catch (err) {
    res.status(500);
    res.send(err.message);
    logger.error(err);
    logger.log(err.message);
  }
});

module.exports = router;
