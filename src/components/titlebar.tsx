import React from 'react';
const {remote} = window.require('electron');
const {BrowserWindow} = remote;
const {ipcRenderer} = window.require('electron');

type TitlebarProperties = {
	titleText: string;
	icon: string;
};

type TitlebarStates = {
	maximized: boolean;
};

class Titlebar extends React.Component<TitlebarProperties, TitlebarStates> {
	state: TitlebarStates = {
		maximized: false
	};

	constructor(properties: TitlebarProperties) {
		super(properties);
		this.restoreWindow = this.restoreWindow.bind(this);
	}

	minimizeWindow(): void {
		BrowserWindow.getFocusedWindow().minimize();
	}

	restoreWindow(): void {
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

	closeWindow(): void {
		BrowserWindow.getFocusedWindow().close();
	}

	render(): JSX.Element {
		ipcRenderer.on('window_unmaximized', () => {
			if (this.state.maximized) {
				this.setState({
					maximized: false
				});
			}
		});

		ipcRenderer.on('window_maximized', () => {
			if (!this.state.maximized) {
				this.setState({
					maximized: true
				});
			}
		});

		return (
			<div className="titlebar">
				<div className="window-appicon" />
				<div className="draggable-bar" />
				<div className="menu-button" onClick={this.minimizeWindow}>
					<i className="codicon codicon-chrome-minimize" />
				</div>
				<div className="menu-button" onClick={this.restoreWindow}>
					{this.state.maximized ? (
						<i className="codicon codicon-chrome-restore" />
					) : (
						<i className="codicon codicon-chrome-maximize" />
					)}
				</div>
				<div className="menu-button close-window" onClick={this.closeWindow}>
					<i className="codicon codicon-chrome-close" />
				</div>
				<span className="titlebar-text">{this.props.titleText}</span>
			</div>
		);
	}
}

export default Titlebar;
