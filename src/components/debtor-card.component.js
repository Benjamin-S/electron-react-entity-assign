import React, { Component } from 'react';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import entities from '../shared/entities.js';

import AssignedEntities from './current-entities.component';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const AsyncTypeahead = asyncContainer(Typeahead);

export default class DebtorCard extends Component {
  constructor(props) {
    super(props);

    this.onChangeEntity = this.onChangeEntity.bind(this);
    this.onChangeGPNumber = this.onChangeGPNumber.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.raiseAlert = this.raiseAlert.bind(this);

    this.state = {
      assign_entity: '',
      assign_debtor: '',
      errorEntity: false,
      errorDebtor: false,
      isLoading: false,
      has_access: [],
      update_success: false,
      update_message: '',
      show_alert: false,
    };
  }

  onChangeEntity(e) {
    this.setState({
      assign_entity: e.target.value,
    });
  }

  onChangeGPNumber(e) {
    this.setState({
      assign_debtor: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault(); // don't reload the page

    let errorDebtor = '';
    let errorEntity = '';

    if (!this.state.assign_debtor) {
      errorDebtor = true;
    }

    if (this.state.assign_entity.length === 0) {
      errorEntity = true;
    }

    // console.log("Debtor Error: " + errorDebtor);
    // console.log("Entity Error: " + errorEntity);

    if (errorDebtor || errorEntity) {
      this.setState({ errorDebtor: errorDebtor, errorEntity });
      return false;
    }

    // console.log(`Entity to assign: ${this.state.assign_entity}`);
    // console.log(`GP Number to assign: ${this.state.assign_debtor}`);

    var debtor = this.state.assign_debtor;
    var entity = this.state.assign_entity;

    var postBody = {
      debtor: debtor.toString(),
      entity: entity.toString(),
    };

    fetch('http://localhost:4000/debtors/', {
      method: 'POST',
      body: JSON.stringify(postBody),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
      .then((result) => result.json())
      .then((json) => {
        this.setState({
          update_success: json.O_iErrorState === 0 ? true : false,
          update_message:
            json.O_iErrorState === 0
              ? `Successfully assigned ${this.state.assign_debtor} to entity ${this.state.assign_entity}`
              : `Failed to assign ${this.state.assign_debtor} to entity ${this.state.assign_entity}`,
        });
      })
      // .then(
      //   this.setState({
      //     assign_debtor: '',
      //     assign_entity: '',
      //   })
      // )
      // .then(
      //   this._typeahead.getInstance().clear(),
      //   this._asynctypeahead.getInstance().clear()
      // )
      .catch((e) => {
        console.dir(e.stack || e);
        this.setState({
          update_success: false,
        });
      })
      .finally(this.setState({ show_alert: true }));

    return true;
  }

  raiseAlert(message, isError) {
    this.setState({
      update_success: isError,
      update_message: message,
      show_alert: true,
    });
  }

  render() {
    return (
      <div className="component-container">
        <h2 style={{ marginTop: 10 }}>Assign Debtor to Entity</h2>
        <Alert
          variant={this.state.update_success ? 'success' : 'danger'}
          show={this.state.show_alert}
          onClose={() => this.setState({ show_alert: false })}
          dismissible
        >
          <Alert.Heading>
            {this.state.update_success ? 'Success!' : 'Fail!'}
          </Alert.Heading>
          {this.state.update_message}
        </Alert>
        <Form noValidate onSubmit={this.onSubmit} style={{ marginTop: 10 }}>
          <Form.Group controlId="debtorAsync">
            <Form.Label>Debtor</Form.Label>
            <AsyncTypeahead
              id="debtor-typeahead"
              clearButton
              placeholder="Enter debtor code"
              isLoading={this.state.isLoading}
              onSearch={(query) => {
                this.setState({ isLoading: true });
                fetch(`http://localhost:4000/debtors/${query}`)
                  .then((resp) => resp.json())
                  .then((json) => {
                    this.setState({
                      isLoading: false,
                      debtorOptions: json.recordset,
                    });
                    // console.log(json);
                  });
              }}
              onChange={(selected) => {
                // console.log({ selected })
                this.setState({
                  assign_debtor: selected.map((a) => a.CUSTNMBR),
                });
              }}
              options={this.state.debtorOptions}
              labelKey={(option) => `${option.CUSTNMBR} - ${option.CUSTNAME}`}
              isInvalid={this.state.errorDebtor}
              ref={(ref) => (this._asynctypeahead = ref)}
            />
            {this.state.errorDebtor ? (
              <div className="invalid-feedback forced-feedback d-block">
                Please enter a valid debtor code.
              </div>
            ) : null}
          </Form.Group>
          <AssignedEntities
            module="Debtor"
            debtor={this.state.assign_debtor[0]}
            raiseAlert={this.raiseAlert}
          />
          <Form.Group controlId="formEntity">
            <Form.Label>Entity</Form.Label>
            <Typeahead
              clearButton
              id="enetity-typeahead"
              onChange={(selected) => {
                // console.log({ selected })
                this.setState({
                  assign_entity: selected.map((a) => a.Entity),
                });
              }}
              options={entities}
              placeholder="Look up an entity by name or entity ID"
              minLength={2}
              labelKey={(option) => `${option.Entity} - ${option.Description}`}
              isInvalid={this.state.errorEntity}
              ref={(ref) => (this._typeahead = ref)}
            />
            {this.state.errorEntity ? (
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
}
