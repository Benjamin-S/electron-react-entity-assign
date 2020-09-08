import React, { Component } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export default class AssignedEntities extends Component {
  constructor(props) {
    super(props);

    this.updateData = this.updateData.bind(this);
    this.handleUnassign = this.handleUnassign.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.handleClose = this.handleClose.bind(this);

    this.state = {
      assigned_entities: [],
      showModal: false,
    };
  }

  componentDidMount() {
    this.updateData();
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
          console.log(json);
        });
    }
  }

  handleShow() {
    this.setState({ showModal: true });
    console.dir('HandleShow');
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  handleUnassign() {}

  componentDidUpdate(prevProps) {
    if (this.props.creditor !== prevProps.creditor) {
      this.updateData();
    }
    if (this.props.debtor !== prevProps.debtor) {
      this.updateData();
    }
  }

  componentWillUnmount() {}

  render() {
    let entity_list = this.state.assigned_entities.map((entity) => (
      <ListGroup.Item key={entity}>
        {entity}
        <Button
          className="float-right"
          variant="danger"
          size="sm"
          onClick={this.handleShow}
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
          <p>Are you sure you want to unassign this entity?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Close
          </Button>
          <Button variant="dark" onClick={this.handleUnassign}>
            Unassign
          </Button>
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
