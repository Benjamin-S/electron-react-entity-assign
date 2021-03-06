import React, { useCallback, useEffect, useState } from 'react'
import { AsyncTypeahead, ClearButton, Typeahead } from 'react-bootstrap-typeahead'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'
import Modal from 'react-bootstrap/Modal'
import PropTypes from 'prop-types'
import { Toast } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner'
import entities from '../shared/entities.js'
const { ipcRenderer: ipc } = window.require('electron-better-ipc')

const ref = React.createRef()

const AccountSearch = (props) => {
  const [assignedEntity, setAssignedEntity] = useState('')
  const [assignedAccount, setAssignedAccount] = useState('')
  const [entityError, setEntityError] = useState(false)
  const [accountError, setAccountError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [updateResult, setUpdateResult] = useState(false)
  const [updateMessage, setUpdateMessage] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [accountOptions, setAccountOptions] = useState([])
  const [accountType, setAccountType] = useState(props.accountType)
  const [moduleDict, setModuleDict] = useState({})
  const [existingEntities, setExistingEntities] = useState([])
  const [accountStatus, setAccountStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState('')

  const [showToast, setShowToast] = useState(false)
  const [showDownloadToast, setShowDownloadToast] = useState(false)
  const [appToastMessage, setAppToastMessage] = useState(null)
  const [appDownloadMessage, setAppDownloadMessage] = useState(null)

  useEffect(() => {
    // ResetState();
    setAccountType(props.accountType)
    ipc.invoke('setStoreValue', 'lastModule', props.accountType.toLowerCase())
  }, [props])

  const accountTypeSingular = useCallback(
    (capitalize = false) => {
      if (accountType) {
        let accountTypeString
        accountTypeString = accountType.toLowerCase().slice(0, -1)
        if (capitalize === true) {
          accountTypeString = toCap(accountTypeString)
        }
        return accountTypeString
      }
    },
    [accountType]
  )

  function toCap (string) {
    return string[0].toUpperCase() + string.slice(1)
  }

  useEffect(() => {
    if (accountType !== null) {
      if (assignedAccount === '') {
        setExistingEntities('')
      } else {
        (async () => {
          const result = await ipc.invoke(
            'getEntities',
            accountTypeSingular(),
            assignedAccount
          )
          setExistingEntities(result.recordset.map((entity) => entity.ENTITY))
        })()
      }
    }
  }, [assignedAccount, accountType, assignedEntity, accountTypeSingular])

  useEffect(() => {
    if (accountType === 'Debtors') {
      setModuleDict({
        variation: 'Customer',
        id: 'CUSTNMBR',
        name: 'CUSTNAME'
      })
    }

    if (accountType === 'Creditors') {
      setModuleDict({
        variation: 'Vendor',
        id: 'VENDORID',
        name: 'VENDNAME'
      })
    }
  }, [accountType])

  useEffect(() => {}, [assignedEntity])

  function onSubmit (event_) {
    event_.preventDefault() // Don't reload the page

    // Local variables to account for setState not being updated instantly.
    let accounterror
    let entityerror

    if (assignedAccount === '') {
      setAccountError(true)
      accounterror = true
    }

    if (assignedEntity.length === 0) {
      setEntityError(true)
      entityerror = true
    }

    if (entityerror || accounterror) {
      raiseAlert(
        `You must enter both an ${accountTypeSingular()} ID and an entity number`,
        false
      )
      return false
    }

    (async () => {
      const result = await ipc.invoke(
        'assignEntity',
        accountTypeSingular(),
        assignedAccount,
        assignedEntity
      )
      const didSucceed = result.output.O_iErrorState === 0
      setUpdateResult(didSucceed)
      setUpdateMessage(
        didSucceed
          ? `Successfully assigned ${assignedAccount} to entity ${assignedEntity}`
          : `Failed to assign ${assignedAccount} to entity ${assignedEntity}`
      )
      setAssignedEntity('')
      ref.current.clear()
      setShowAlert(true)
    })()

    return true
  }

  function raiseAlert (message, isError) {
    setUpdateResult(isError)
    setUpdateMessage(message)
    setShowAlert(true)
  }

  function handleUnassignAccount (entity, account) {
    let didSucceed;

    (async () => {
      const result = await ipc.invoke(
        'removeEntity',
        accountTypeSingular(),
        account,
        entity
      )
      didSucceed = result.output.O_iErrorState === 0
      setUpdateResult(didSucceed)
      setUpdateMessage(
        didSucceed
          ? 'Entity successfully removed.'
          : 'There was an error removing the entity.'
      )
      setSelectedEntity('')
      setShowModal(false)
      if (didSucceed === true) {
        setExistingEntities(existingEntities.filter((item) => item !== entity))
      }

      setShowAlert(true)
    })()

    return true
  }

  function handleShow (entity) {
    setSelectedEntity(entity)
    setShowModal(true)
  }

  function handleClose () {
    setShowModal(false)
    setSelectedEntity('')
  }

  function handleToastClose () {
    setShowToast(false)
  }

  const handleAccountSearch = useCallback(async (query) => {
    setIsLoading(true)
    const result = await ipc.invoke(
      'getAccounts',
      accountTypeSingular(),
      query
    )
    setAccountOptions(result.recordset)
    setIsLoading(false)
  }, [])

  ipc.on('update_available', () => {
    setAppToastMessage(
      'An update is available and will be now be downloaded in the background.'
    )
    setShowToast(true)
  })

  ipc.on('update_downloaded', () => {
    setShowToast(false)
    setAppDownloadMessage(
      'Update has been downloaded. Please click the button below to restart the application.'
    )
    setShowDownloadToast(true)
  })

  const unassignModal = (
    <Modal centered show={showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Unassign Entity</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to unassign entity {selectedEntity} for{' '}
          {assignedAccount}
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleClose}>
          Close
        </Button>
        <Button
          variant='dark'
          onClick={(event_) =>
            handleUnassignAccount(selectedEntity, assignedAccount, event_)}
        >
          Unassign
        </Button>
      </Modal.Footer>
    </Modal>
  )

  const updateToast = (
    <Toast
      animation
      className='updateToast'
      show={showToast}
      onClose={() => handleToastClose()}
    >
      <Toast.Header>
        <img
          src={props.icon}
          width='20'
          height='20'
          className='rounded mr-2'
          alt=''
        />
        <strong className='mr-auto'>Update is available!</strong>
      </Toast.Header>
      <Toast.Body>{appToastMessage}</Toast.Body>
    </Toast>
  )

  const downloadToast = (
    <Toast
      animation
      className='downloadToast'
      show={showDownloadToast}
      onClose={() => setShowDownloadToast(false)}
    >
      <Toast.Header>
        <img
          src={props.icon}
          width='20'
          height='20'
          className='rounded mr-2'
          alt=''
        />
        <strong className='mr-auto'>Download complete!</strong>
      </Toast.Header>
      <Toast.Body>
        <p>{appDownloadMessage}</p>
        <Button onClick={() => ipc.callMain('restart_app')}>Restart App</Button>
      </Toast.Body>
    </Toast>
  )

  return (
    <div className='component-container'>
      <div className='toast-div'>
        {appToastMessage && updateToast}
        {appDownloadMessage && downloadToast}
      </div>
      <h2 style={{ marginTop: 10 }}>
        Assign {accountTypeSingular(true)} to Entity
      </h2>
      <Alert
        dismissible
        variant={updateResult ? 'success' : 'danger'}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      >
        <Alert.Heading>
          {updateResult ? 'Success!' : 'Failure. Something went wrong...'}
        </Alert.Heading>
        {updateMessage}
      </Alert>
      <Form noValidate style={{ marginTop: 10 }} onSubmit={onSubmit}>
        <Form.Group controlId='accountAsyncForm'>
          <Form.Label>{accountTypeSingular(true)}</Form.Label>
          <AsyncTypeahead
            clearButton
            id='account-typeahead'
            placeholder={'Enter ' + accountTypeSingular() + ' code'}
            spellCheck={false}
            isLoading={isLoading}
            options={accountOptions}
            searchText='Searching...'
            labelKey={(option) =>
              `${option[moduleDict.id]} - ${option[moduleDict.name]}`}
            isInvalid={accountError}
            onSearch={handleAccountSearch}
            onChange={(selected) => {
              setAssignedAccount(selected.map((a) => a[moduleDict.id])[0])
              setAccountStatus(selected.map((a) => a.STATUS))
            }}
          >{({ onClear, selected }) => (
            <div className='rbt-aux'>
              {!!selected.length && <ClearButton onClick={onClear} />}
              {!selected.length && <Spinner animation='grow' size='sm' />}
            </div>
          )}
          </AsyncTypeahead>
          {accountError
            ? (
              <div className='invalid-feedback forced-feedback d-block'>
                Please enter a valid {accountTypeSingular()} code.
              </div>
              )
            : null}
        </Form.Group>
        {existingEntities.length > 0 && (
          <Card style={{ marginBottom: 10 }}>
            {showModal ? unassignModal : null}
            <Card.Body>
              <Card.Title>
                {assignedAccount} has access to the following entities
              </Card.Title>
              <Card.Subtitle>
                ...and is{' '}
                <span className={accountStatus}>
                  {accountStatus.toString().toLowerCase()}
                </span>{' '}
                in GP.
              </Card.Subtitle>
            </Card.Body>
            <ListGroup variant='flush'>
              {entities.filter(e => existingEntities.includes(e.Entity)).map((entity) => (
                <ListGroup.Item key={entity.Entity}>
                  {entity.Entity} - {entity.Description}
                  <Button
                    className='float-right'
                    variant='danger'
                    size='sm'
                    onClick={(event_) => handleShow(entity.Entity, event_)}
                  >
                    Unassign
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        )}
        <Form.Group controlId='formEntity'>
          <Form.Label>Entity</Form.Label>
          <Typeahead
            ref={ref}
            clearButton
            id='entity-typeahead'
            options={entities}
            placeholder='Look up an entity by name or entity ID'
            minLength={2}
            labelKey={(option) => `${option.Entity} - ${option.Description}`}
            isInvalid={entityError}
            onChange={(selected) => {
              setAssignedEntity(selected.map((a) => a.Entity))
            }}
          />
          {entityError
            ? (
              <div className='invalid-feedback forced-feedback d-block'>
                Please enter a valid entity code.
              </div>
              )
            : null}
        </Form.Group>
        <Button variant='primary' type='submit'>
          Assign
        </Button>
      </Form>
    </div>
  )
}

AccountSearch.propTypes = {
  accountType: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired
}

export default AccountSearch
