console.time('init');

// Modules to control application life and create native browser window
import path from 'path';
import {app, BrowserWindow} from 'electron';
import logger from 'electron-timber';
import {ipcMain as ipc} from 'electron-better-ipc';
import {autoUpdater} from 'electron-updater';
import unhandled from 'electron-unhandled';
import Store from 'electron-store';
import * as url from 'url';

const store = new Store();
const isDev = process.env.NODE_ENV === 'development';
unhandled();
app.setAppUserModelId('com.bensymons.mem-tool');

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
let mainWindow: BrowserWindow;

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

	win.on('ready-to-show', () => {
		logger.log('Ready to show');
		win.show();
	});

	win.on('unmaximize', () => {
		win.webContents.send('window_unmaximized', 'Window is unmaximized!');
	});

	win.on('maximize', () => {
		win.webContents.send('window_maximized', 'Window is maximized!');
	});

	await win.loadURL(isDev ? 'http://localhost:4000/' : url.format({
		pathname: path.join(__dirname, './index.html'),
		protocol: 'file',
		slashes: true
	}
	));

	console.timeEnd('init');

	return win;
};

// No point allowing a user to open a second instance
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

// Ipc.answerRenderer('get-sql-info', async () => {
// 	const result = await poolPromise;
// 	logger.log('SQL server is: ' + result.config.server);
// 	return result.config.server;
// });

// ipc.answerRenderer('get-express-info', async () => {
// 	const result = await server.listening;
// 	return result;
// });

ipc.answerRenderer('app_version', async () => {
	const version = app.getVersion();
	return version;
});

ipc.handle('getStoreValue', (event: Event, key: string) => {
	return store.get(key);
});

ipc.handle('setStoreValue', (event: Event, key: string, value: any) => {
	store.set(key, value);
	return store.get(key);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', async () => {
// 	// console.time('Ready');
// 	mainWindow = await createMainWindow();
// 	// console.timeEnd('Ready');

// });

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// Server.close();
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
