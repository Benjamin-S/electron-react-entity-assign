console.time('init');

// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const express = require('express');
const expressApp = express();

const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');

const mainPageRoutes = express.Router();
const { ipcMain } = require('electron');
const os = require('os');

expressApp.use(cors());
expressApp.use(bodyParser.json());

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

const pool = new sql.ConnectionPool(config, (err) => {
  if (err) {
    console.dir('Theres something wrong here. Pool could not be established.');
    console.dir(err);
  } else {
    console.dir('Connected to MSSQL. Server: ' + pool.server);
  }
});

mainPageRoutes.get('/creditors/entities/:id', (req, res) => {
  pool
    .request()
    .query(
      `SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900220 WITH(NOLOCK) WHERE VENDORID = '${req.params.id}'`
    )
    .then((result) => {
      //console.log(result);
      res.json(result);
    });
});

mainPageRoutes.get('/creditors/:id', (req, res) => {
  pool
    .request()
    .query(
      `SELECT RTRIM(VENDORID) AS VENDORID, RTRIM(VENDNAME) AS VENDNAME FROM PM00200 WITH(NOLOCK) WHERE VENDORID LIKE '${req.params.id}%'`
    )
    .then((result) => {
      //console.log(result);
      res.json(result);
    });
});

mainPageRoutes.post('/creditors/', (req, res) => {
  pool
    .request()
    .input('I_vVENDORID', sql.VarChar(15), req.body.creditor)
    .input('I_vFacility', sql.VarChar(60), req.body.entity)
    .output('O_iErrorState', sql.Int)
    .output('oErrString', sql.VarChar(255))
    .execute('CustomBSSIUpdateCreateVendorRcd')
    .then((result) => {
      res.json(result.output);
    })
    .catch((err) => {
      console.dir(err);
      console.dir(req.body);
    });
});

mainPageRoutes.get('/debtors/entities/:id', (req, res) => {
  pool
    .request()
    .query(
      `SELECT RTRIM(BSSI_FACILITY_ID) AS ENTITY FROM B3900270 WITH(NOLOCK) WHERE CUSTNMBR = '${req.params.id}'`
    )
    .then((result) => {
      //console.log(result);
      res.json(result);
    });
});

mainPageRoutes.get('/debtors/:id', (req, res) => {
  pool
    .request()
    .query(
      `SELECT RTRIM(CUSTNMBR) as CUSTNMBR, RTRIM(CUSTNAME) as CUSTNAME FROM RM00101 WITH(NOLOCK) WHERE CUSTNMBR LIKE '${req.params.id}%'`
    )
    .then((result) => {
      console.log(result);
      res.json(result);
    });
});

mainPageRoutes.post('/debtors/', (req, res) => {
  pool
    .request()
    .input('I_vCUSTNMBR', sql.VarChar(15), req.body.debtor)
    .input('I_vFacility', sql.VarChar(60), req.body.entity)
    .output('O_iErrorState', sql.Int)
    .output('oErrString', sql.VarChar(255))
    .execute('CustomBSSIUpdateCreateCustomerRcd')
    .then((result) => {
      res.json(result.output);
    })
    .catch((err) => {
      console.dir(err);
      console.dir(req.body);
    });
});

mainPageRoutes.delete('/debtors/', (req, res) => {
  pool
    .request()
    .input('I_vCUSTNMBR', sql.VarChar(20), req.body.debtor)
    .input('I_vFACILITY', sql.VarChar(10), req.body.entity)
    .output('O_iErrorState', sql.Int)
    .output('oErrString', sql.VarChar(255))
    .execute('fs_BSSIRemoveCustomerRcd')
    .then((result) => {
      res.json(result.output);
    })
    .catch((err) => {
      console.dir(err);
      console.dir(req.body);
    });
});

expressApp.use('/', mainPageRoutes);

const server = expressApp.listen(process.env.PORT || port, function () {
  console.dir(`Express server listening on port ${port}`);
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1068,
    minHeight: 500,
    backgroundColor: '#2c2f33',
    frame: false,
    icon: './icon.png',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000/'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  console.timeEnd('init');
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    server.close();
    mainWindow = null;
  });

  mainWindow.on('unmaximize', function () {
    mainWindow.webContents.send('window_unmaximized', 'Window is unmaximized!');
  });

  mainWindow.on('maximize', function () {
    mainWindow.webContents.send('window_maximized', 'Window is maximized!');
  });
}

ipcMain.on('populateUsername', (event, args) => {
  const result = os.userInfo().username;
  console.log(result);
  event.reply('populateUsernameReply', result);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.time('Ready');
  createWindow();
  console.timeEnd('Ready');
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  server.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
