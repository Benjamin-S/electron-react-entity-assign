import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';

export default class Menu extends Component {
	render() {
		return (
			<div className="menu">
				<NavLink to="/creditors" className="menu-item">
					Creditors
				</NavLink>
				<NavLink to="/debtors" className="menu-item">
					Debtors
				</NavLink>
				{/* <div className="server-status">Server status <span>Disconnected</span></div> */}
			</div>
		);
	}
}
