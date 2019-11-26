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
import Titlebar from './components/titlebar-component';
import { CSSTransition } from 'react-transition-group';

const routes = [
  { path: '/', name: 'Main', Component: MainPage },
  { path: '/creditors', name: 'Creditors', Component: CreditorCard },
  { path: '/debtors', name: 'Debtors', Component: DebtorCard }
]

class App extends Component {
  render() {
    return (
      // <Router basename="">
      //   <Titlebar titletext="Entity Assign" icon={icon} />
      //   <Route path="/" exact component={MainPage} />
      //   {/* <Menu /> */}
      //   <Route path="/creditors">
      //     <Menu />
      //     <div className="content">
      //       <CreditorCard />
      //     </div>
      //   </Route>
      //   <Route path="/debtors">
      //     <Menu />
      //     <div className="content">
      //       <DebtorCard />
      //     </div>
      //   </Route>
      // </Router>
      <Router>
        <>
          <Titlebar titletext="Entity Assign" icon={icon} />
          <Menu />
          {routes.map(route => (
            <Route key={route.path} exact path={route.path}>
              {({ match }) => (
                <CSSTransition in={match != null} timeout={200} classNames="content" unmountOnExit>
                  <div className="content">
                    <route.Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))}
        </>
      </Router>
    );
  }
}

export default App;
