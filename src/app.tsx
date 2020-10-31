/* eslint import/no-unassigned-import: "off" */
/* eslint import/extensions: off */

import React, {ReactElement} from 'react';
import icon from './images/icon.png';

// Import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import './styles/styles.scss';
import './shared/codicon.css';

import {HashRouter as Router, Route, Redirect, Switch} from 'react-router-dom';

import MainPage from './components/main-page';
import AccountSearch from './components/account-search';
import Menu from './components/menu';
import Titlebar from './components/titlebar';
import Footer from './components/footer';
// Import SideToolbar from './components/side-toolbar';
const {ipcRenderer: ipc} = window.require('electron-better-ipc');

class App extends React.Component {
	state = {skipWelcome: false};

	async componentDidMount(): Promise<void> {
		document.documentElement.classList.add('theme-dark');
		const shouldSkipWelcome = await ipc.invoke('getStoreValue', 'skipWelcome');
		this.setState({skipWelcome: shouldSkipWelcome});
		console.log('skipWelcome: ' + shouldSkipWelcome);
	}

	render(): ReactElement {
		return (
			<Router basename="/">
				<>
					<Titlebar titleText="Entity Assign" icon={icon} />
					<div className="applicationView">
						{/* <SideToolbar/> */}
						<Menu />
						<div className="content">
							<Switch>
								<Route exact path="/">
									{this.state.skipWelcome ? (
										<Redirect to="/creditors" />
									) : (
										<MainPage />
									)}
								</Route>
								<Route exact path="/creditors">
									<AccountSearch iconProp={icon} accountTypeProp="Creditors" />
								</Route>
								<Route exact path="/debtors">
									<AccountSearch iconProp={icon} accountTypeProp="Debtors" />
								</Route>
							</Switch>
						</div>
					</div>
					<Footer />
				</>
			</Router>
		);
	}
}

export default App;
