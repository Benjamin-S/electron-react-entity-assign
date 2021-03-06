import React, { useEffect, useState } from 'react'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')
const { electronVersion, chromeVersion } = window.require('electron-util')

const Footer = () => {
  const [sqlServer, setSqlServer] = useState(null)
  const [appVersion, setAppVersion] = useState(null)

  function changeTheme (theme) {
    document.documentElement.className = ''
    document.documentElement.classList.add(`theme-${theme}`)
  }

  function toggleTheme () {
    if (document.documentElement.className === 'theme-dark') {
      changeTheme('light')
    } else {
      changeTheme('dark')
    }
  }

  async function getSqlDatabase () {
    const sqlDatabase = await ipc.invoke('getSqlServer')
    setSqlServer(sqlDatabase)
  }

  async function getAppVersion () {
    const appVersion = await ipc.callMain('app_version')
    setAppVersion(appVersion)
  }

  useEffect(() => {
    getSqlDatabase()
    getAppVersion()
  }, [])

  return (
    <div className='windowFooter'>
      <div className='left-items items-container'>
        <div className='footer-item first-visible-item has-background-color' title='Toggle light/dark theme' style={{ backgroundColor: 'rgb(22, 130, 93)' }}>
          <button type='button' style={{ color: 'white' }} onClick={toggleTheme}>
            <span className='codicon codicon-color-mode' />
          </button>
        </div>
        <div className='footer-item'>
          <button type='button'>
            SQL Server: {sqlServer}
          </button>
        </div>
        <div className='footer-item'>
          <button type='button'>
            Electron Version: {electronVersion}
          </button>
        </div>
        <div className='footer-item'>
          <button type='button'>
            Chrome Version: {chromeVersion}
          </button>
        </div>

      </div>
      <div className='right-items items-container'>
        <div className='footer-item'>
          <button type='button'>
            Version: {appVersion}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Footer
