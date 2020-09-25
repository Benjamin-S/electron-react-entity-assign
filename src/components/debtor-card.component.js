import React, { useState } from 'react';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import entities from '../shared/entities.js';

import AssignedEntities from './current-entities.component';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const AsyncTypeahead = asyncContainer(Typeahead);

const ref = React.createRef();

export default function DebtorCard(props) {
  const [assignedEntity, setAssignedEntity] = useState('');
  const [assignedDebtor, setAssignedDebtor] = useState('');
  const [entityError, setEntityError] = useState(false);
  const [debtorError, setDebtorError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updateResult, setUpdateResult] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [debtorOptions, setDebtorOptions] = useState([]);

  function onSubmit(e) {
    e.preventDefault(); // don't reload the page

    if (!assignedDebtor) {
      setDebtorError(true);
    }

    if (assignedEntity.length === 0) {
      setEntityError(true);
    }

    if (entityError || debtorError) return false;

    fetch('http://localhost:4000/debtors/', {
      method: 'POST',
      body: JSON.stringify({
        debtor: assignedDebtor,
        entity: assignedEntity,
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
      .then((result) => result.json())
      .then((json) => {
        var didSucceed = json.O_iErrorState === 0;
        setUpdateResult(didSucceed);
        setUpdateMessage(
          didSucceed
            ? `Successfully assigned ${assignedDebtor} to entity ${assignedEntity}`
            : `Failed to assign ${assignedDebtor} to entity ${assignedEntity}`
        );
      })
      .then(setAssignedEntity(''))
      .then(ref.current.clear())
      .catch((e) => {
        console.error(e.stack || e);
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

  return (
    <div className="component-container">
      <h2 style={{ marginTop: 10 }}>Assign Debtor to Entity</h2>
      <Alert
        variant={updateResult ? 'success' : 'danger'}
        show={showAlert}
        onClose={() => setShowAlert(false)}
        dismissible
      >
        <Alert.Heading>{updateResult ? 'Success!' : 'Fail!'}</Alert.Heading>
        {updateMessage}
      </Alert>
      <Form noValidate onSubmit={onSubmit} style={{ marginTop: 10 }}>
        <Form.Group controlId="debtorAsync">
          <Form.Label>Debtor</Form.Label>
          <AsyncTypeahead
            id="debtor-typeahead"
            clearButton
            placeholder="Enter debtor code"
            isLoading={isLoading}
            onSearch={(query) => {
              setIsLoading(true);
              fetch(`http://localhost:4000/debtors/${query}`)
                .then((resp) => resp.json())
                .then((json) => {
                  setIsLoading(false);
                  setDebtorOptions(json.recordset);
                });
            }}
            onChange={(selected) => {
              setAssignedDebtor(selected.map((a) => a.CUSTNMBR));
            }}
            options={debtorOptions}
            labelKey={(option) => `${option.CUSTNMBR} - ${option.CUSTNAME}`}
            isInvalid={debtorError}
          />
          {debtorError ? (
            <div className="invalid-feedback forced-feedback d-block">
              Please enter a valid debtor code.
            </div>
          ) : null}
        </Form.Group>
        <AssignedEntities
          module="Debtor"
          debtor={assignedDebtor[0]}
          raiseAlert={raiseAlert}
        />
        <Form.Group controlId="formEntity">
          <Form.Label>Entity</Form.Label>
          <Typeahead
            clearButton
            id="entity-typeahead"
            onChange={(selected) => {
              setAssignedEntity(selected.map((a) => a.Entity));
            }}
            options={entities}
            placeholder="Look up an entity by name or entity ID"
            minLength={2}
            labelKey={(option) => `${option.Entity} - ${option.Description}`}
            isInvalid={entityError}
            ref={ref}
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
