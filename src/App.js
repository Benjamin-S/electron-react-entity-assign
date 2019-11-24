import React, { Component } from 'react';
// import logo from './logo.svg';

import icon from './icon.png'

import "bootstrap/dist/css/bootstrap.min.css";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';
import './App.scss';

import { BrowserRouter as Router, Route } from "react-router-dom";

import MainPage from "./components/main-page.component";
import CreditorCard from "./components/creditor-card.component";
import DebtorCard from "./components/debtor-card.component";
import Menu from './components/menu.component';
// import Titlebar from './components/titlebar-component';

class App extends Component {
  render() {
    return (
      <Router basename="">
        {/* <Titlebar titletext="Entity Assign" icon={icon} /> */}
        <Menu />
        <div className="content">
          <Route path="/creditors" component={CreditorCard} />
          <Route path="/debtors" component={DebtorCard} />
          <Route path="/" exact component={MainPage} />
        </div>
      </Router>
    );
  }
}

export default App;
