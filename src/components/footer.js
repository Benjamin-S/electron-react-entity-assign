import React, {useEffect, useState} from 'react';
const {ipcRenderer: ipc} = window.require('electron-better-ipc');
const {is, electronVersion, chromeVersion} = window.require('electron-util');

const Footer = () => {
	const [sqlServer, setSqlServer] = useState(null);
	const [expressInfo, setExpressInfo] = useState(null);
	const [appVersion, setAppVersion] = useState(null);

	function changeTheme(theme) {
		document.documentElement.className = '';
		document.documentElement.classList.add(`theme-${theme}`);
	}

	function toggleTheme() {
		if (document.documentElement.className === 'theme-dark') {
			changeTheme('light');
		} else {
			changeTheme('dark');
		}
	}

	async function isServerActive() {
		const serverStatus = await ipc.callMain('get-express-info');
		setExpressInfo(serverStatus);
	}

	async function getSqlDatabase() {
		const sqlDatabase = await ipc.callMain('get-sql-info');
		setSqlServer(sqlDatabase);
	}

	async function getAppVersion() {
		const appVersion = await ipc.callMain('app_version');
		setAppVersion(appVersion);
	}

	useEffect(() => {
		getSqlDatabase();
		isServerActive();
		getAppVersion();
	}, []);

	return (
		<div className="windowFooter">
			<i
				className="codicon codicon-color-mode theme-toggle"
				onClick={toggleTheme}
			/>
			<span>
				Express Server Status:{' '}
				{expressInfo === null && (
					<i className="codicon codicon-circle-filled server-status"/>
				)}
				{expressInfo === true && (
					<i className="codicon codicon-circle-filled server-status pass"/>
				)}
				{expressInfo === false && (
					<i className="codicon codicon-circle-filled server-status fail"/>
				)}
			</span>
			{sqlServer && (<span>SQL Server: {sqlServer}</span>)}
			<span>Electron Version: {electronVersion}</span>
			<span>Chrome Version: {chromeVersion}</span>
			{is.development && <span>DEVELOPMENT</span>}
			<span className="version">Version: {appVersion}</span>
		</div>
	);
};

export default Footer;
