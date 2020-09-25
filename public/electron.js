console.time('init');

// Modules to control application life and create native browser window
const path = require('path');
const { app, BrowserWindow } = require('electron');
const logger = require('electron-timber');
const isDev = require('electron-is-dev');

const express = require('express');

const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');

const { ipcMain } = require('electron');
const os = require('os');

const router = require('../src/routes');
const { poolPromise } = require('../src/connect');
const { argv } = require('process');

// Prevent window from being garbage collected
let mainWindow;
let server;

const createMainWindow = async () => {
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(bodyParser.json());
  expressApp.use('/', router);

  server = expressApp.listen(process.env.PORT || port, function () {
    logger.log(`Express server listening on port ${port}`);
  });

  const win = new BrowserWindow({
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
    show: false,
  });

  win.on('ready-to-show', () => {
    logger.log('Ready to show');
    win.show();
  });

  // Emitted when the window is closed.
  win.on('closed', function () {
    logger.log('Closing Application');
    server.close();
    mainWindow = undefined;
    process.exit(0);
  });

  win.on('unmaximize', function () {
    win.webContents.send('window_unmaximized', 'Window is unmaximized!');
  });

  win.on('maximize', function () {
    win.webContents.send('window_maximized', 'Window is maximized!');
  });

  // Built is passed as an argument when serving static built files without the
  // need to also run the react dev server (faster to restart electron for troubleshooting)
  await win.loadURL(
    isDev && argv[2] !== 'Built'
      ? 'http://localhost:3000/'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  console.timeEnd('init');

  return win;
};

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

ipcMain.on('populateUsername', (event, args) => {
  const result = os.userInfo().username;
  logger.log(result);
  event.reply('populateUsernameReply', result);
});

ipcMain.on('collectSQLServerInfo', async (event, args) => {
  const result = await poolPromise;
  logger.log('SQL server is: ' + result.config.server);
  event.reply('collectSQLServerInfoReply', result.config.server);
});

ipcMain.on('expressServer', (event, args) => {
  const result = server.listening;
  event.reply('expressServerReply', result);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  console.time('Ready');
  mainWindow = await createMainWindow();
  console.timeEnd('Ready');
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  server.close();
  app.quit();
  process.exit(0);
});

app.on('activate', async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

async () => {
  await app.whenReady();
  mainWindow = await createMainWindow();
};
