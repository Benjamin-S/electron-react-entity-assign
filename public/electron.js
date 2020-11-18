console.time('init');

// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const logger = require('electron-timber');
const isDev = require('electron-is-dev');
const {ipcMain: ipc} = require('electron-better-ipc');
const {autoUpdater} = require('electron-updater');
const unhandled = require('electron-unhandled');
const Store = require('electron-store');

const config = require('../src/prodconfig');

const store = new Store();
unhandled();

app.setAppUserModelId('com.bensymons.mem-tool');

if (config && !process.env.GH_TOKEN) {
	process.env.GH_TOKEN = config.GH_TOKEN;
}

autoUpdater.setFeedURL({
	provider: 'github',
	repo: 'electron-react-entity-assign',
	owner: 'Benjamin-S',
	private: true,
	token: process.env.GH_TOKEN
});

if (!isDev) {
	const ONE_HOUR = 1000 * 60 * 60;
	setInterval(() => {
		autoUpdater.checkForUpdates();
	}, ONE_HOUR);

	autoUpdater.checkForUpdatesAndNotify();
}

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 1068,
		minHeight: 500,
		backgroundColor: '#2c2f33',
		frame: false,
		icon: './icon.png',
		webPreferences: {
			enableRemoteModule: true,
			nodeIntegration: true,
			webSecurity: false
		},
		show: false
	});

	const path = require('path');

	win.on('ready-to-show', () => {
		logger.log('Ready to show');
		win.show();
	});

	// Emitted when the window is closed.
	win.on('closed', async () => {
		logger.log('Closing Application');
		await sqlService.closeServer();
		mainWindow = undefined;
	});

	win.on('unmaximize', () => {
		win.webContents.send('window_unmaximized', 'Window is unmaximized!');
	});

	win.on('maximize', () => {
		win.webContents.send('window_maximized', 'Window is maximized!');
	});

	// Built is passed as an argument when serving static built files without the
	// need to also run the react dev server (faster to restart electron for troubleshooting)
	await win.loadURL(
		isDev && process.argv[2] !== 'Built' ?
			'http://localhost:3000/' :
			`file://${path.join(__dirname, '../build/index.html')}`
	);
	console.timeEnd('init');

	return win;
};

// No point allowing a user to open a second instance.
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

ipc.answerRenderer('app_version', async () => {
	const version = app.getVersion();
	return version;
});

ipc.handle('getStoreValue', (event, key) => {
	return store.get(key);
});

ipc.handle('setStoreValue', (event, key, value) => {
	store.set(key, value);
	return store.get(key);
});

const sqlService = require('../src/services/sqlservice');

ipc.handle('getAccounts', async (event, ...args) => {
	const result = await sqlService.getAccounts(...args);
	return result;
});

ipc.handle('assignEntity', async (event, ...args) => {
	const result = await sqlService.assignEntity(...args);
	return result;
});

ipc.handle('getEntities', async (event, ...args) => {
	const result = await sqlService.getEntities(...args);
	return result;
});

ipc.handle('removeEntity', async (event, ...args) => {
	const result = await sqlService.removeEntity(...args);
	return result;
});

ipc.handle('getSqlServer', async () => {
	const result = await sqlService.getSqlServer();
	return result;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', async () => {
// 	console.time('Ready');
// 	mainWindow = await createMainWindow();
// 	console.timeEnd('Ready');
// });

// Quit when all windows are closed.
app.on('window-all-closed', async () => {
	await sqlService.closeServer();
	app.quit();
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	mainWindow = await createMainWindow();
})();

autoUpdater.on('update-available', () => {
	mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
});

ipc.answerRenderer('restart_app', () => {
	autoUpdater.quitAndInstall();
});
