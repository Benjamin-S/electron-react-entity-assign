import React, {useState} from 'react';
import {NavLink} from 'react-router-dom';
import {FormCheck, Modal} from 'react-bootstrap';
import FormCheckInput from 'react-bootstrap/esm/FormCheckInput';
import FormCheckLabel from 'react-bootstrap/esm/FormCheckLabel';

const {ipcRenderer: ipc} = window.require('electron');

const MainPage = (): JSX.Element => {
	const [skipWelcome, setSkipWelcome] = useState(false);

	const handleWelcomeCheck = async () => {
		setSkipWelcome(!skipWelcome);
		const updateStore = await ipc.invoke(
			'setStoreValue',
			'skipWelcome',
			!skipWelcome
		);
		console.log(updateStore);
	};

	return (
		<div>
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
					<FormCheck style={{marginRight: 'auto'}}>
						<FormCheckInput
							id="skipWelcomeCheckbox"
							className="small"
							type="checkbox"
							checked={skipWelcome}
							onChange={() => handleWelcomeCheck()}
						/>
						<FormCheckLabel className="small text-muted">
							Do not show this window again
						</FormCheckLabel>
					</FormCheck>
					<NavLink className="btn btn-primary" to="/creditors">
						Creditors
					</NavLink>
					<NavLink className="btn btn-primary" to="/debtors">
						Debtors
					</NavLink>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default MainPage;
