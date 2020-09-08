import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

const { ipcRenderer } = window.require('electron');

export default class MainPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
    };
  }

  componentWillMount() {
    ipcRenderer.send('populateUsername', 'username');
  }

  componentDidMount() {
    ipcRenderer.on('populateUsernameReply', (event, arg) => {
      this.setState({ username: arg });
    });
  }

  render() {
    return (
      <div className="main-page">
        <div className="main-page-content">
          <h3>Multi-Entity Management — Assign Entity App</h3>
          <span>
            This tool exists as an easy way for St John Ambulance employees to
            assign creditors/debtors to specific entities in GP.
          </span>
          <span>To get started select one of the options below</span>
          <div className="button-group">
            <NavLink to="/creditors" className="main-link">
              Creditors
            </NavLink>
            <NavLink to="/debtors" className="main-link">
              Debtors
            </NavLink>
          </div>
          Welcome {this.state.username}
        </div>
      </div>
    );
  }
}
