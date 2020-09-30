import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Modal } from 'react-bootstrap';

// const { ipcRenderer } = window.require('electron');

export default class MainPage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let welcome_modal = (
      <Modal show={true} centered={true}>
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
    return <div>{welcome_modal}</div>;
  }
}
