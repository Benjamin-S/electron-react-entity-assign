import React, { Component } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default class AssignedEntities extends Component {
  constructor(props) {
    super(props);

    this.updateData = this.updateData.bind(this);
    this.handleUnassignDebtor = this.handleUnassignDebtor.bind(this);
    this.handleUnassignCreditor = this.handleUnassignCreditor.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      assigned_entities: [],
      showModal: false,
      selectedEntity: '',
      delete_success: false,
      delete_message: '',
    };
  }

  updateData() {
    if (this.props.module === 'Creditor') {
      fetch(`http://localhost:4000/creditors/entities/${this.props.creditor}`)
        .then((resp) => resp.json())
        .then((json) => {
          this.setState({
            assigned_entities: json.recordset.map((a) => a.ENTITY),
          });
          // console.log(json);
        });
    }
    if (this.props.module === 'Debtor') {
      fetch(`http://localhost:4000/debtors/entities/${this.props.debtor}`)
        .then((resp) => resp.json())
        .then((json) => {
          this.setState({
            assigned_entities: json.recordset.map((a) => a.ENTITY),
          });
          // console.log(json);
        });
    }
  }

  handleShow(entity) {
    this.setState({ selectedEntity: entity, showModal: true });
  }

  handleClose() {
    this.setState({ showModal: false, selectedEntity: '' });
  }

  handleUnassignDebtor(entity, debtor) {
    console.dir('Calling delete on ' + entity + ' for ' + debtor);
    fetch('http://localhost:4000/debtors/', {
      method: 'DELETE',
      body: JSON.stringify({
        debtor: debtor.toString(),
        entity: entity.toString(),
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
      .then((result) => result.json())
      .then((json) => {
        this.setState({
          delete_success: json.O_iErrorState === 0 ? true : false,
          delete_message:
            json.O_iErrorState === 0
              ? 'Entity successfully removed.'
              : 'There was an error removing the entity.',
        });
      })
      .then(
        this.setState({
          selectedEntity: '',
          showModal: false,
        })
      )
      .catch((e) => {
        console.dir(e.stack || e);
        this.setState({
          delete_success: false,
          delete_message: e,
        });
      })
      .finally(
        this.props.raiseAlert(
          this.state.delete_message,
          this.state.delete_success,
          true
        )
      );
    return true;
  }

  handleUnassignCreditor() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.props.creditor !== prevProps.creditor) {
      this.updateData();
    }
    if (this.props.debtor !== prevProps.debtor) {
      this.updateData();
    }
    if (this.state.assigned_entities !== prevState.assigned_entities) {
      this.updateData();
    }
  }

  render() {
    let entity_list = this.state.assigned_entities.map((entity) => (
      <ListGroup.Item key={entity}>
        {entity}
        <Button
          className="float-right"
          variant="danger"
          size="sm"
          onClick={(e) => this.handleShow(entity, e)}
        >
          Unassign
        </Button>
      </ListGroup.Item>
    ));

    let unassign_modal = (
      <Modal
        show={this.state.showModal}
        onHide={this.handleClose}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Unassign Entity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to unassign entity {this.state.selectedEntity}{' '}
            for{' '}
            {this.props.module === 'Debtor'
              ? this.props.debtor
              : this.props.creditor}
            ?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          {this.props.module === 'Debtor' && (
            <Button
              variant="dark"
              onClick={(e) =>
                this.handleUnassignDebtor(
                  this.state.selectedEntity,
                  this.props.debtor,
                  e
                )
              }
            >
              Unassign
            </Button>
          )}
          {this.props.module === 'Creditor' && (
            <Button
              variant="dark"
              onClick={(e) =>
                this.handleUnassignCreditor(
                  this.state.selectedEntity,
                  this.props.creditor,
                  e
                )
              }
            >
              Unassign
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );

    if (entity_list.length === 0) {
      // console.log("Entity List is empty");
      return null;
    }
    return (
      <Card style={{ marginBottom: 10 }}>
        <Card.Header as="h6">
          {this.props.module} already has access to these entities
        </Card.Header>
        {this.state.showModal ? unassign_modal : null}
        {entity_list}
      </Card>
    );
  }
}
