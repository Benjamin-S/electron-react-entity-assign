import React, { useEffect, useState } from 'react';
import '../styles/styles.scss';
const { ipcRenderer: ipc } = window.require('electron-better-ipc');
const { is, electronVersion, chromeVersion } = window.require('electron-util');

function Footer() {
  const [sqlServer, setSqlServer] = useState(null);
  const [expressInfo, setExpressInfo] = useState(null);

  function changeTheme(theme) {
    document.documentElement.className = '';
    document.documentElement.classList.add(`theme-${theme}`);
  }
  function toggleTheme() {
    document.documentElement.className === 'theme-dark'
      ? changeTheme('light')
      : changeTheme('dark');
  }

  async function isServerActive() {
    const serverStatus = await ipc.callMain('get-express-info');
    setExpressInfo(serverStatus);
  }

  async function getSqlDatabase() {
    const sqlDatabase = await ipc.callMain('get-sql-info');
    setSqlServer(sqlDatabase);
  }

  useEffect(() => {
    getSqlDatabase();
    isServerActive();
  }, []);

  return (
    <div className="windowFooter">
      <i
        className="codicon codicon-color-mode theme-toggle"
        onClick={toggleTheme}
      ></i>
      <span>
        Express Server Status:{' '}
        {expressInfo === null && (
          <i className="codicon codicon-circle-filled server-status"></i>
        )}
        {expressInfo === true && (
          <i className="codicon codicon-circle-filled server-status pass"></i>
        )}
        {expressInfo === false && (
          <i className="codicon codicon-circle-filled server-status fail"></i>
        )}
      </span>
      <span>SQL Server{sqlServer !== null ? ': ' + sqlServer : null}</span>
      <span>Electron Version: {electronVersion}</span>
      <span>Chrome Version: {chromeVersion}</span>
      {is.development && <span>DEVELOPMENT</span>}
    </div>
  );
}

export default Footer;
