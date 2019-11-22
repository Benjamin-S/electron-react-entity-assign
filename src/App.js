import React, { Component } from 'react';
// import logo from './logo.svg';

import icon from './icon.png'

import "bootstrap/dist/css/bootstrap.min.css";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import { BrowserRouter as Router, Route, Link, NavLink } from "react-router-dom";

import MainPage from "./components/main-page.component";
import CreditorCard from "./components/creditor-card.component";
import DebtorCard from "./components/debtor-card.component";

import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import './App.scss';
import Titlebar from './components/titlebar-component';

class App extends Component {
  render() {
    return (
      <Router basename="/">
        <Titlebar titletext="Entity Assign" icon={icon} />
        <div className="menu">
          <NavLink to="/creditors" className="menu-item">Creditors</NavLink>
          <NavLink to="/debtors" className="menu-item">Debtors</NavLink>
        </div>
        <div className="content">
          {/* <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand>
              <NavLink to="/" activeClassName="selected" className="navbar-brand">Entity Assignment</NavLink>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav>
                <Nav.Item className="nav-item">
                  <NavLink className="nav-link" activeClassName="selected" to="/creditors">Creditors</NavLink>
                </Nav.Item>
                <Nav.Item className="nav-item">
                  <NavLink className="nav-link" activeClassName="selected" to="/debtors">Debtors</NavLink>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar> */}
          <Route path="/creditors" component={CreditorCard} />
          <Route path="/debtors" component={DebtorCard} />
          <Route path="/" exact component={MainPage} />
        </div>
      </Router>
    );
  }
}

export default App;
