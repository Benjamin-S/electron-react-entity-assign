import React from 'react'
import icon from './icon.png'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import './styles/styles.scss'
import './shared/codicon.css'

import {
  HashRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom'

import MainPage from './components/main-page.js'
import AccountSearch from './components/account-search.js'
import Menu from './components/menu.js'
import Titlebar from './components/titlebar.js'
import Footer from './components/footer.js'
const { ipcRenderer } = window.require('electron')

class App extends React.Component {
  state = { skipWelcome: false, lastModule: '' };

  async componentDidMount () {
    document.documentElement.classList.add('theme-dark')
    const shouldSkipWelcome = await ipcRenderer.invoke(
      'getStoreValue',
      'skipWelcome'
    )
    if (shouldSkipWelcome) {
      let lastModuleSelected = await ipcRenderer.invoke(
        'getStoreValue',
        'lastModule'
      )
      if (lastModuleSelected === null || lastModuleSelected === undefined) {
        lastModuleSelected = 'creditors'
      }

      this.setState({ lastModule: lastModuleSelected })
    }

    this.setState({ skipWelcome: shouldSkipWelcome })
  }

  render () {
    return (
      <Router basename='/'>
        <>
          <Titlebar titletext='Entity Assign' icon={icon} />
          <div className='applicationView'>
            <Menu />
            <div className='content'>
              <Switch>
                <Route exact path='/'>
                  {this.state.skipWelcome
                    ? (<Redirect to={`/${this.state.lastModule}`} />)
                    : (<MainPage />)}
                </Route>
              </Switch>
              <Route exact path='/creditors'>
                <AccountSearch icon={icon} accountType='Creditors' />
              </Route>
              <Route exact path='/debtors'>
                <AccountSearch icon={icon} accountType='Debtors' />
              </Route>
            </div>
          </div>
          <Footer />
        </>
      </Router>
    )
  }
}

export default App
