/* eslint import/extensions: off */

import React, { createRef, useEffect, useState } from "react";
import { AsyncTypeahead, Typeahead } from "react-bootstrap-typeahead";
import entities from "../shared/entities";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";
import { Toast } from "react-bootstrap";
const { ipcRenderer: ipc } = window.require("electron-better-ipc");

// const AsyncTypeahead = asyncContainer(Typeahead);
type Entities = {
	Entity: string;
	Description: string;
};
// const ref:React.RefObject<Typeahead<>> = React.createRef();

type Accounts = {
	Entity: string;
	Name: string;
};

type AccountSearchProps = {
	accountTypeProp: string;
	iconProp: string;
};

type ModuleDict = {
	singular: string;
	variation: string;
	id: string;
	name: string;
};

type Payload = { [id: string]: any };

function AccountSearch({ accountTypeProp, iconProp }: AccountSearchProps) {
	const [assignedEntity, setAssignedEntity] = useState("");
	const [assignedAccount, setAssignedAccount] = useState("");
	const [entityError, setEntityError] = useState(false);
	const [accountError, setAccountError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [updateResult, setUpdateResult] = useState(false);
	const [updateMessage, setUpdateMessage] = useState("");
	const [showAlert, setShowAlert] = useState(false);
	const [accountOptions, setAccountOptions] = useState([]);
	const [accountType, setAccountType] = useState<string | null>(null);
	const [moduleDict, setModuleDict] = useState<ModuleDict>({
		singular: "",
		variation: "",
		id: "",
		name: "",
	});
	const [existingEntities, setExistingEntities] = useState([]);
	const [accountStatus, setAccountStatus] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [selectedEntity, setSelectedEntity] = useState("");

	const [showToast, setShowToast] = useState(false);
	const [showDownloadToast, setShowDownloadToast] = useState(false);
	const [appToastMessage, setAppToastMessage] = useState<string | null>(null);
	const [appDownloadMessage, setAppDownloadMessage] = useState<string | null>(
		null
	);

	let typeaheadRef = createRef<
		Typeahead<{ Entity: string; Description: string }>
	>();

	useEffect(() => {
		// ResetState();
		setAccountType(accountTypeProp);
	}, [accountTypeProp]);

	useEffect(() => {
		if (accountType !== null) {
			fetch(
				`http://localhost:4000/${accountType.toLowerCase()}/entities/${assignedAccount}`
			)
				.then((resp) => resp.json())
				.then((json) => {
					setExistingEntities(
						json.recordset.map((a: { ENTITY: any }) => a.ENTITY)
					);
				});
		}
	}, [assignedAccount, accountType, assignedEntity]);

	useEffect(() => {
		if (accountType === "Debtors") {
			setModuleDict({
				singular: "Debtor",
				variation: "Customer",
				id: "CUSTNMBR",
				name: "CUSTNAME",
			});
		}

		if (accountType === "Creditors") {
			setModuleDict({
				singular: "Creditor",
				variation: "Vendor",
				id: "VENDORID",
				name: "VENDNAME",
			});
		}
	}, [accountType]);

	useEffect(() => {}, [assignedEntity]);

	async function onSubmit(event_: React.FormEvent) {
		event_.preventDefault(); // Don't reload the page

		// Local variables to account for setState not being updated instantly.
		let accounterror;
		let entityerror;

		if (assignedAccount === "") {
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

		let modulePostingData = moduleDict.singular.toLowerCase();

		let postBody: Payload = {
			entity: assignedEntity,
		};

		postBody[modulePostingData as keyof Payload] = assignedAccount;

		let accountTypeName: string =
			accountType === null ? "" : accountType.toLowerCase();

		const result = await fetch(`http://localhost:4000/${accountTypeName}/`, {
			method: "POST",
			body: JSON.stringify(postBody),
			headers: new Headers({ "Content-Type": "application/json" }),
		});

		const jsonResult = await result.json();
		const didSucceed = jsonResult.O_iErrorState === 0;
		setUpdateResult(didSucceed);
		setUpdateMessage(
			didSucceed
				? `Successfully assigned ${assignedAccount} to entity ${assignedEntity}`
				: `Failed to assign ${assignedAccount} to entity ${assignedEntity}`
		);
		setAssignedEntity("");
		try {
			if (typeaheadRef !== null && typeaheadRef.current !== null) {
				typeaheadRef.current.setState({ selected: [] });
			}
		} catch (error) {
			console.error(error.stack || error);
			setUpdateResult(false);
		}
		setShowAlert(true);
		return true;
	}

	function raiseAlert(message: string, isError: boolean) {
		setUpdateResult(isError);
		setUpdateMessage(message);
		setShowAlert(true);
	}

	async function handleUnassignAccount(entity: string, account: string) {
		let deleteBody: Payload = { entity: entity };
		let deletedAccount = moduleDict.singular.toLowerCase();
		deleteBody[deletedAccount as keyof Payload] = account;

		let accountTypeUrl = accountType === null ? "" : accountType.toLowerCase();

		console.dir("Calling delete on " + entity + " for " + account);
		try {
			const result = await fetch(`http://localhost:4000/${accountTypeUrl}/`, {
				method: "DELETE",
				body: JSON.stringify(deleteBody),
				headers: new Headers({ "Content-Type": "application/json" }),
			});
			var jsonResult = await result.json();
			var didSucceed = jsonResult.O_iErrorState === 0;
			setUpdateResult(didSucceed);
			setUpdateMessage(
				didSucceed
					? "Entity successfully removed."
					: "There was an error removing the entity."
			);
			setSelectedEntity("");
			setShowModal(false);
			if (didSucceed === true) {
				setExistingEntities(existingEntities.filter((item) => item !== entity));
			}
		} catch (error) {
			console.dir(error.stack || error);
			setUpdateResult(false);
			setUpdateMessage("There was an error removing the entity.");
		}
		setShowAlert(true);
		return true;
	}

	function handleShow(entity: string) {
		setSelectedEntity(entity);
		setShowModal(true);
	}

	function handleClose() {
		setShowModal(false);
		setSelectedEntity("");
	}

	function handleToastClose() {
		setShowToast(false);
	}

	ipc.on("update_available", () => {
		setAppToastMessage(
			"An update is available and will be now be downloaded in the background."
		);
		setShowToast(true);
	});

	ipc.on("update_downloaded", () => {
		setShowToast(false);
		setAppDownloadMessage(
			"Update has been downloaded. Please click the button below to restart the application."
		);
		setShowDownloadToast(true);
	});

	const unassignModal = (
		<Modal centered show={showModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Unassign Entity</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>
					Are you sure you want to unassign entity {selectedEntity} for{" "}
					{assignedAccount}
				</p>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Close
				</Button>
				<Button
					variant="dark"
					onClick={() => handleUnassignAccount(selectedEntity, assignedAccount)}
				>
					Unassign
				</Button>
			</Modal.Footer>
		</Modal>
	);

	const updateToast = (
		<Toast
			animation
			className="updateToast"
			show={showToast}
			onClose={() => handleToastClose()}
		>
			<Toast.Header>
				<img
					src={iconProp}
					width="20"
					height="20"
					className="rounded mr-2"
					alt=""
				/>
				<strong className="mr-auto">Update is available!</strong>
			</Toast.Header>
			<Toast.Body>{appToastMessage}</Toast.Body>
		</Toast>
	);

	const downloadToast = (
		<Toast
			animation
			className="downloadToast"
			show={showDownloadToast}
			onClose={() => setShowDownloadToast(false)}
		>
			<Toast.Header>
				<img
					src={iconProp}
					width="20"
					height="20"
					className="rounded mr-2"
					alt=""
				/>
				<strong className="mr-auto">Download complete!</strong>
			</Toast.Header>
			<Toast.Body>
				<p>{appDownloadMessage}</p>
				<Button onClick={() => ipc.callMain("restart_app")}>Restart App</Button>
			</Toast.Body>
		</Toast>
	);

	return (
		<div className="component-container">
			<div className="toast-div">
				{appToastMessage && updateToast}
				{appDownloadMessage && downloadToast}
			</div>
			<h2 style={{ marginTop: 10 }}>Assign {moduleDict.singular} to Entity</h2>
			<Alert
				dismissible
				variant={updateResult ? "success" : "danger"}
				show={showAlert}
				onClose={() => setShowAlert(false)}
			>
				<Alert.Heading>
					{updateResult ? "Success!" : "Failure. Something went wrong..."}
				</Alert.Heading>
				{updateMessage}
			</Alert>
			<Form noValidate style={{ marginTop: 10 }} onSubmit={onSubmit}>
				<Form.Group controlId="accountAsyncForm">
					<Form.Label>{moduleDict.singular}</Form.Label>
					<AsyncTypeahead
						clearButton
						id="account-typeahead"
						placeholder={"Enter " + moduleDict.singular + " code"}
						isLoading={isLoading}
						options={accountOptions}
						searchText="Searching..."
						labelKey={(option: ModuleDict) =>
							`${option[moduleDict.id as keyof ModuleDict]} - ${
								option[moduleDict.name as keyof ModuleDict]
							}`
						}
						isInvalid={accountError}
						onSearch={(query) => {
							setIsLoading(true);
							let accountTypeUrl =
								accountType === null ? "" : accountType.toLowerCase();
							fetch(`http://localhost:4000/${accountTypeUrl}/${query}`)
								.then((resp) => resp.json())
								.then((json) => {
									setAccountOptions(json.recordset);
									setIsLoading(false);
								});
						}}
						onChange={(selected) => {
							let selectedAccount = selected[0].id;
							let selectedAccountStatus = selected[0].STATUS;
							setAssignedAccount(selectedAccount);
							setAccountStatus(selected.map((a) => a.STATUS));
						}}
					/>
					{accountError ? (
						<div className="invalid-feedback forced-feedback d-block">
							Please enter a valid {accountType.singular} code.
						</div>
					) : null}
				</Form.Group>
				{existingEntities.length !== 0 && (
					<Card style={{ marginBottom: 10 }}>
						{showModal ? unassignModal : null}
						<Card.Body>
							<Card.Title>
								{assignedAccount} has access to the following entities
							</Card.Title>
							<Card.Subtitle>
								...and is{" "}
								<span className={accountStatus}>
									{accountStatus.toString().toLowerCase()}
								</span>{" "}
								in GP.
							</Card.Subtitle>
						</Card.Body>
						<ListGroup variant="flush">
							{existingEntities.map((entity) => (
								<ListGroup.Item key={entity}>
									{entity}
									<Button
										className="float-right"
										variant="danger"
										size="sm"
										onClick={(event_) => handleShow(entity, event_)}
									>
										Unassign
									</Button>
								</ListGroup.Item>
							))}
						</ListGroup>
					</Card>
				)}
				<Form.Group controlId="formEntity">
					<Form.Label>Entity</Form.Label>
					<Typeahead
						ref={typeaheadRef}
						clearButton
						id="entity-typeahead"
						options={entities}
						placeholder="Look up an entity by name or entity ID"
						minLength={2}
						labelKey={(option) => `${option.Entity} - ${option.Description}`}
						isInvalid={entityError}
						onChange={(selected) => {
							setAssignedEntity(selected.map((a) => a.Entity));
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
}

export default AccountSearch;
