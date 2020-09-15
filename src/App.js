import React, { Component } from 'react';

// import theme, { getCurrentTheme, initThemeObserver } from './themeColors';

// import logo from './logo.svg';

import icon from './icon.png';

// import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead-bs4.css';

import { HashRouter as Router, Route } from 'react-router-dom';

import MainPage from './components/main-page.component';
import CreditorCard from './components/creditor-card.component';
import DebtorCard from './components/debtor-card.component';
import Menu from './components/menu.component';
import Titlebar from './components/titlebar-component';
import { CSSTransition } from 'react-transition-group';
import Footer from './components/footer.component';

import './styles/styles.scss';
import './shared/codicon.css';
const routes = [
  { path: '/', name: 'Main', Component: MainPage },
  { path: '/creditors', name: 'Creditors', Component: CreditorCard },
  { path: '/debtors', name: 'Debtors', Component: DebtorCard },
];

class App extends Component {
  componentWillMount() {
    document.documentElement.classList.add(`theme-dark`);
  }

  render() {
    return (
      <Router basename="/">
        <>
          <Titlebar titletext="Entity Assign" icon={icon} />
          <Menu />
          {routes.map((route) => (
            <Route key={route.path} exact path={route.path}>
              {({ match }) => (
                <CSSTransition
                  in={match != null}
                  timeout={200}
                  classNames="content"
                  unmountOnExit
                >
                  <div className="content">
                    <route.Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
          ))}
          <Footer />
        </>
      </Router>
    );
  }
}

export default App;
