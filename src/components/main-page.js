import React from 'react';
import {NavLink} from 'react-router-dom';
import {Modal} from 'react-bootstrap';

// Const { ipcRenderer } = window.require('electron');

export default class MainPage extends React.Component {
	render() {
		const welcomeModal = (
			<Modal show centered>
				<Modal.Header>
					<Modal.Title>Multi-Entity Management — Assign Entity App</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>
						This tool exists as an easy way for St John Ambulance employees to
						assign creditors/debtors to specific entities in GP.
					</p>
					<p>To get started select one of the options below</p>
				</Modal.Body>
				<Modal.Footer>
					<NavLink className="btn btn-primary" to="/creditors">
						Creditors
					</NavLink>
					<NavLink className="btn btn-primary" to="/debtors">
						Debtors
					</NavLink>
				</Modal.Footer>
			</Modal>
		);
		return <div>{welcomeModal}</div>;
	}
}
