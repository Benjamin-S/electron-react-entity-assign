import React, { useEffect, useState } from 'react';
import '../styles/styles.scss';
const { ipcRenderer: ipc } = window.require('electron');

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

  useEffect(() => {
    ipc.send('collectSQLServerInfo');
    ipc.on('collectSQLServerInfoReply', (event, arg) => {
      setSqlServer(arg);
    });
  }, []);

  useEffect(() => {
    ipc.send('expressServer');
    ipc.on('expressServerReply', (event, arg) => [setExpressInfo(arg)]);
  });

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
      <span>SQL Server{sqlServer !== null ? ':' + sqlServer : null}</span>
    </div>
  );
}

export default Footer;
