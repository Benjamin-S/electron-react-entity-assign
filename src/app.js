/* eslint import/no-unassigned-import: "off" */
/* eslint import/extensions: off */

import React from 'react';
import icon from './icon.png';

// Import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import './styles/styles.scss';
import './shared/codicon.css';

import {HashRouter as Router, Route} from 'react-router-dom';

import MainPage from './components/main-page';
import AccountSearch from './components/account-search';
import Menu from './components/menu';
import Titlebar from './components/titlebar';
import Footer from './components/footer';

const routes = [
	{path: '/', name: 'Main', Component: MainPage},
	{
		path: '/creditors',
		name: 'Creditors',
		render: props => <AccountSearch {...props} icon={icon} accountType="Creditors"/>
	},
	{
		path: '/debtors',
		name: 'Debtors',
		render: props => <AccountSearch {...props} icon={icon} accountType="Debtors"/>
	}
];

class App extends React.Component {
	componentDidMount() {
		document.documentElement.classList.add('theme-dark');
	}

	render() {
		return (
			<Router basename="/">
				<>
					<Titlebar titletext="Entity Assign" icon={icon}/>
					<div className="applicationView">

						<Menu/>
						<div className="content">
							{routes.map(route => (
								<Route
									key={route.path}
									exact
									path={route.path}
									component={route.Component}
									render={route.render}
								/>
							))}
						</div>
					</div>
					<Footer/>
				</>
			</Router>
		);
	}
}

export default App;
