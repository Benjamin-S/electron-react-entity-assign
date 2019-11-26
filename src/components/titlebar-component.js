import React, { Component } from 'react';

import './titlebar.scss';
import '../shared/codicon.css';
const { remote } = window.require('electron');
const { BrowserWindow } = remote;
const { ipcRenderer } = window.require('electron');

export default class Titlebar extends Component {
    constructor(props) {
        super(props);

        this.restoreWindow = this.restoreWindow.bind(this);

        this.state = {
            maximized: false
        }
    }

    minimizeWindow() {
        BrowserWindow.getFocusedWindow().minimize();
    }

    restoreWindow() {
        if (BrowserWindow.getFocusedWindow().isMaximized()) {
            BrowserWindow.getFocusedWindow().restore();
            this.setState({
                maximized: false
            })
        }
        else {
            BrowserWindow.getFocusedWindow().maximize();
            this.setState({
                maximized: true
            })
        }
    }

    closeWindow() {
        BrowserWindow.getFocusedWindow().close();
    }

    render() {
        ipcRenderer.on('window_unmaximized', (event, arg) => {
            if (this.state.maximized === true) {
                this.setState({
                    maximized: false
                });
            }
        });

        ipcRenderer.on('window_maximized', (event, arg) => {
            if (this.state.maximized === false) {
                this.setState({
                    maximized: true
                });
            }
        });

        return (
            <div className="titlebar">
                {this.props.icon ? <img src={this.props.icon} alt="" className="titlebar-img"></img> : null}
                <div className="draggable-bar" />
                <div className="menu-button" onClick={this.minimizeWindow}><i className="codicon codicon-chrome-minimize"></i></div>
                <div className="menu-button" onClick={this.restoreWindow}>{this.state.maximized ? <i className="codicon codicon-chrome-restore"></i> : <i className="codicon codicon-chrome-maximize"></i>}</div>
                <div className="menu-button close-window" onClick={this.closeWindow}><i className="codicon codicon-chrome-close"></i></div>
                <span className="titlebar-text">{this.props.titletext}</span>
            </div >
        )
    }
}