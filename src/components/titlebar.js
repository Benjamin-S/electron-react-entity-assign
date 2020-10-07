/* eslint import/extensions: off */

import React from 'react';
import PropTypes from 'prop-types';
import '../styles/styles.scss';
import '../shared/codicon.css';
const {remote} = window.require('electron');
const {BrowserWindow} = remote;
const {ipcRenderer} = window.require('electron');

export default class Titlebar extends React.Component {
	constructor() {
		super();

		this.restoreWindow = this.restoreWindow.bind(this);
	}

	state = {
		maximized: false
	};

	static propTypes = {
		icon: PropTypes.string.isRequired,
		titletext: PropTypes.string.isRequired
	};

	minimizeWindow() {
		BrowserWindow.getFocusedWindow().minimize();
	}

	restoreWindow() {
		if (BrowserWindow.getFocusedWindow().isMaximized()) {
			BrowserWindow.getFocusedWindow().restore();
			this.setState({
				maximized: false
			});
		} else {
			BrowserWindow.getFocusedWindow().maximize();
			this.setState({
				maximized: true
			});
		}
	}

	closeWindow() {
		BrowserWindow.getFocusedWindow().close();
	}

	render() {
		ipcRenderer.on('window_unmaximized', () => {
			if (this.state.maximized === true) {
				this.setState({
					maximized: false
				});
			}
		});

		ipcRenderer.on('window_maximized', () => {
			if (this.state.maximized === false) {
				this.setState({
					maximized: true
				});
			}
		});

		return (
			<div className="titlebar">
				{this.props.icon ? (
					<img src={this.props.icon} alt="" className="titlebar-img"/>
				) : null}
				<div className="draggable-bar"/>
				<div className="menu-button" onClick={this.minimizeWindow}>
					<i className="codicon codicon-chrome-minimize"/>
				</div>
				<div className="menu-button" onClick={this.restoreWindow}>
					{this.state.maximized ? (
						<i className="codicon codicon-chrome-restore"/>
					) : (
						<i className="codicon codicon-chrome-maximize"/>
					)}
				</div>
				<div className="menu-button close-window" onClick={this.closeWindow}>
					<i className="codicon codicon-chrome-close"/>
				</div>
				<span className="titlebar-text">{this.props.titletext}</span>
			</div>
		);
	}
}
