import React, {useEffect, useState} from 'react';
import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';
import entities from '../shared/entities';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

const AsyncTypeahead = asyncContainer(Typeahead);

const ref = React.createRef();

const AccountSearch = props => {
	const [assignedEntity, setAssignedEntity] = useState('');
	const [assignedAccount, setAssignedAccount] = useState('');
	const [entityError, setEntityError] = useState(false);
	const [accountError, setAccountError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [updateResult, setUpdateResult] = useState(false);
	const [updateMessage, setUpdateMessage] = useState('');
	const [showAlert, setShowAlert] = useState(false);
	const [accountOptions, setAccountOptions] = useState([]);
	const [accountType, setAccountType] = useState(null);
	const [moduleDict, setModuleDict] = useState({});
	const [existingEntities, setExistingEntities] = useState([]);

	const [showModal, setShowModal] = useState(false);
	const [selectedEntity, setSelectedEntity] = useState('');

	useEffect(() => {
		// ResetState();
		setAccountType(props.accountType);
	}, [props]);

	useEffect(() => {
		if (accountType !== null) {
			fetch(
				`http://localhost:4000/${accountType.toLowerCase()}/entities/${assignedAccount}`
			)
				.then(resp => resp.json())
				.then(json => {
					setExistingEntities(json.recordset.map(a => a.ENTITY));
				});
		}
	}, [assignedAccount, accountType, assignedEntity]);

	useEffect(() => {
		if (accountType === 'Debtors') {
			setModuleDict({
				singular: 'Debtor',
				variation: 'Customer',
				id: 'CUSTNMBR',
				name: 'CUSTNAME'
			});
		}

		if (accountType === 'Creditors') {
			setModuleDict({
				singular: 'Creditor',
				variation: 'Vendor',
				id: 'VENDORID',
				name: 'VENDNAME'
			});
		}
	}, [accountType]);

	useEffect(() => {}, [assignedEntity]);

	function onSubmit(event_) {
		event_.preventDefault(); // Don't reload the page

		// Local variables to account for setState not being updated instantly.
		let accounterror;
		let entityerror;

		if (assignedAccount === '') {
			setAccountError(true);
			accounterror = true;
		}

		if (assignedEntity.length === 0) {
			setEntityError(true);
			entityerror = true;
		}

		if (entityerror || accounterror) {
			raiseAlert(
				`You must enter both an ${moduleDict.singular} ID and an Entity number`,
				false
			);
			return false;
		}

		const postBody = {};
		postBody[moduleDict.singular.toLowerCase()] = assignedAccount.toString();
		postBody.entity = assignedEntity.toString();

		fetch(`http://localhost:4000/${accountType.toLowerCase()}/`, {
			method: 'POST',
			body: JSON.stringify(postBody),
			headers: new Headers({'Content-Type': 'application/json'})
		})
			.then(result => result.json())
			.then(json => {
				const didSucceed = json.O_iErrorState === 0;
				setUpdateResult(didSucceed);
				setUpdateMessage(
					didSucceed ?
						`Successfully assigned ${assignedAccount} to entity ${assignedEntity}` :
						`Failed to assign ${assignedAccount} to entity ${assignedEntity}`
				);
			})
			.then(setAssignedEntity(''))
			.then(ref.current.clear())
			.catch(error => {
				console.error(error.stack || error);
				setUpdateResult(false);
			})
			.finally(setShowAlert(true));

		return true;
	}

	function raiseAlert(message, isError) {
		setUpdateResult(isError);
		setUpdateMessage(message);
		setShowAlert(true);
	}

	function handleUnassignAccount(entity, account) {
		const deleteBody = {};
		let didSucceed;
		deleteBody[moduleDict.singular.toLowerCase()] = account.toString();
		deleteBody.entity = entity.toString();

		console.dir('Calling delete on ' + entity + ' for ' + account);
		fetch(`http://localhost:4000/${accountType.toLowerCase()}/`, {
			method: 'DELETE',
			body: JSON.stringify(deleteBody),
			headers: new Headers({'Content-Type': 'application/json'})
		})
			.then(result => result.json())
			.then(json => {
				didSucceed = json.O_iErrorState === 0;
				setUpdateResult(didSucceed);
				setUpdateMessage(
					didSucceed ?
						'Entity successfully removed.' :
						'There was an error removing the entity.'
				);
			})
			.then(setSelectedEntity(''), setShowModal(false))
			.then(() => {
				if (didSucceed === true) {
					setExistingEntities(
						existingEntities.filter(item => item !== entity)
					);
				}
			})
			.catch(error => {
				console.dir(error.stack || error);
				setUpdateResult(false);
				setUpdateMessage('There was an error removing the entity.');
			})
			.finally(setShowAlert(true));
		return true;
	}

	function handleShow(entity) {
		setSelectedEntity(entity);
		setShowModal(true);
	}

	function handleClose() {
		setShowModal(false);
		setSelectedEntity('');
	}

	const unassignModal = (
		<Modal centered show={showModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Unassign Entity</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>
					Are you sure you want to unassign entity {selectedEntity} for{' '}
					{assignedAccount}
				</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button
					variant="dark"
					onClick={event_ =>
						handleUnassignAccount(selectedEntity, assignedAccount, event_)}
				>
					Unassign
				</Button>
			</Modal.Footer>
		</Modal>
	);

	return (
		<div className="component-container">
			<h2 style={{marginTop: 10}}>Assign {moduleDict.singular} to Entity</h2>
			<Alert
				dismissible
				variant={updateResult ? 'success' : 'danger'}
				show={showAlert}
				onClose={() => setShowAlert(false)}
			>
				<Alert.Heading>
					{updateResult ? 'Success!' : 'Failure. Something went wrong...'}
				</Alert.Heading>
				{updateMessage}
			</Alert>
			<Form noValidate style={{marginTop: 10}} onSubmit={onSubmit}>
				<Form.Group controlId="accountAsyncForm">
					<Form.Label>{moduleDict.singular}</Form.Label>
					<AsyncTypeahead
						clearButton
						id="account-typeahead"
						placeholder={'Enter ' + moduleDict.singular + ' code'}
						isLoading={isLoading}
						options={accountOptions}
						labelKey={option =>
							`${option[moduleDict.id]} - ${option[moduleDict.name]}`}
						isInvalid={accountError}
						onSearch={query => {
							setIsLoading(true);
							fetch(
								`http://localhost:4000/${accountType.toLowerCase()}/${query}`
							)
								.then(resp => resp.json())
								.then(json => {
									setAccountOptions(json.recordset);
									setIsLoading(false);
								});
						}}
						onChange={selected => {
							setAssignedAccount(selected.map(a => a[moduleDict.id]));
						}}
					/>
					{accountError ? (
						<div className="invalid-feedback forced-feedback d-block">
							Please enter a valid {accountType.singular} code.
						</div>
					) : null}
				</Form.Group>
				{/* <AssignedEntities
          module={accountType}
          account={assignedAccount.toString()}
          raiseAlert={raiseAlert}
        /> */}
				{existingEntities.length !== 0 && (
					<Card style={{marginBottom: 10}}>
						<Card.Header as="h6">
							{moduleDict.singular} already has access to these entities
						</Card.Header>
						{showModal ? unassignModal : null}
						{existingEntities.map(entity => (
							<ListGroup.Item key={entity}>
								{entity}
								<Button
									className="float-right"
									variant="danger"
									size="sm"
									onClick={event_ => handleShow(entity, event_)}
								>
									Unassign
								</Button>
							</ListGroup.Item>
						))}
					</Card>
				)}
				<Form.Group controlId="formEntity">
					<Form.Label>Entity</Form.Label>
					<Typeahead
						ref={ref}
						clearButton
						id="entity-typeahead"
						options={entities}
						placeholder="Look up an entity by name or entity ID"
						minLength={2}
						labelKey={option => `${option.Entity} - ${option.Description}`}
						isInvalid={entityError}
						onChange={selected => {
							setAssignedEntity(selected.map(a => a.Entity));
						}}
					/>
					{entityError ? (
						<div className="invalid-feedback forced-feedback d-block">
							Please enter a valid entity code.
						</div>
					) : null}
				</Form.Group>
				<Button variant="primary" type="submit">
					Assign
				</Button>
			</Form>
		</div>
	);
};

AccountSearch.propTypes = {
	accountType: PropTypes.string.isRequired
};

export default AccountSearch;
