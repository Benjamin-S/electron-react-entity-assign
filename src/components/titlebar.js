import React from 'react'
import PropTypes from 'prop-types'
const { BrowserWindow } = window.require('@electron/remote')
const { ipcRenderer } = window.require('electron')

export default class Titlebar extends React.Component {
  constructor () {
    super()
    this.state = {
      maximized: false
    }
    this.handleRestoreWindow = this.handleRestoreWindow.bind(this)
  }

  static propTypes = {
    titletext: PropTypes.string.isRequired
  };

  handleMinimizeWindow () {
    BrowserWindow.getFocusedWindow().minimize()
  }

  handleRestoreWindow () {
    if (BrowserWindow.getFocusedWindow().isMaximized()) {
      BrowserWindow.getFocusedWindow().restore()
      this.setState({
        maximized: false
      })
    } else {
      BrowserWindow.getFocusedWindow().maximize()
      this.setState({
        maximized: true
      })
    }
  }

  handleCloseWindow () {
    BrowserWindow.getFocusedWindow().close()
  }

  render () {
    ipcRenderer.on('window_unmaximized', () => {
      if (this.state.maximized === true) {
        this.setState({
          maximized: false
        })
      }
    })

    ipcRenderer.on('window_maximized', () => {
      if (this.state.maximized === false) {
        this.setState({
          maximized: true
        })
      }
    })

    return (
      <div className='titlebar'>
        <div className='window-appicon' />
        <div className='draggable-bar' />
        <div className='menu-button' onClick={this.handleMinimizeWindow}>
          <i className='codicon codicon-chrome-minimize' />
        </div>
        <div className='menu-button' onClick={this.handleRestoreWindow}>
          {this.state.maximized
            ? (<i className='codicon codicon-chrome-restore' />)
            : (<i className='codicon codicon-chrome-maximize' />)}
        </div>
        <div className='menu-button close-window' onClick={this.handleCloseWindow}>
          <i className='codicon codicon-chrome-close' />
        </div>
        <span className='titlebar-text'>{this.props.titletext}</span>
      </div>
    )
  }
}
