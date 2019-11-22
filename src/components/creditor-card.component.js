import React, { Component } from 'react';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import entities from '../shared/entities.js';

import AssignedEntities from './current-entities.component';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const AsyncTypeahead = asyncContainer(Typeahead);

export default class CreditorCard extends Component {

    constructor(props) {
        super(props);

        this.onChangeEntity = this.onChangeEntity.bind(this);
        this.onChangeGPNumber = this.onChangeGPNumber.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            assign_entity: '',
            assign_creditor: '',
            errorEntity: false,
            errorCreditor: false,
            isLoading: false,
            has_access: [],
            update_success: '',
            update_message: '',
        }
    }

    onChangeEntity(e) {
        this.setState({
            assign_entity: e.target.value
        });
    }

    onChangeGPNumber(e) {
        this.setState({
            assign_creditor: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault(); // don't reload the page

        let errorCreditor = '';
        let errorEntity = '';

        if (!this.state.assign_creditor) {
            errorCreditor = true;
        }

        if (this.state.assign_entity.length === 0) {
            errorEntity = true;
        }

        // console.log("Creditor Error: " + errorCreditor);
        // console.log("Entity Error: " + errorEntity);

        if (errorCreditor || errorEntity) {
            this.setState({ errorCreditor, errorEntity });
            return false;
        }

        // console.log(`Entity to assign: ${this.state.assign_entity}`);
        // console.log(`GP Number to assign: ${this.state.assign_creditor}`);

        var creditor = this.state.assign_creditor;
        var entity = this.state.assign_entity

        var postBody = {
            "creditor": creditor.toString(),
            "entity": entity.toString()
        }

        fetch("http://localhost:4000/creditors/", {
            method: 'POST',
            body: JSON.stringify(postBody),
            headers: new Headers({ "Content-Type": "application/json" })
        })
            .then(result => result.json())
            .then(json => {
                this.setState({
                    update_success: json.O_iErrorState === 0 ? true : false
                })
            }).then(
                this.setState({
                    assign_creditor: '',
                    assign_entity: ''
                }),
            )
            .then(
                this._typeahead.getInstance().clear(),
                this._asynctypeahead.getInstance().clear()
            )
            .catch((e) => {
                console.dir(e.stack || e);
                this.setState({
                    update_success: false
                })
            });

        return true;
    }

    render() {
        if (this.state.update_success === true && this.state.update_message === '') {
            this.setState({
                update_message: `Successfully assigned ${this.state.assign_creditor} to entity ${this.state.assign_entity}`
            })
        }
        if (this.state.update_success === false && this.state.update_message === '') {
            this.setState({
                update_message: `Failed to assign ${this.state.assign_creditor} to entity ${this.state.assign_entity}`
            })
        }

        return (
            <div className="component-container">
                <h2 style={{ marginTop: 10 }}>Assign Creditor to Entity</h2>

                {this.state.update_message ? <Alert variant={this.state.update_success ? 'success' : 'danger'}>{this.state.update_message}</Alert> : null}

                <Form noValidate onSubmit={this.onSubmit} style={{ marginTop: 10 }}>
                    <Form.Group controlId="creditorAsync">
                        <Form.Label>Creditor</Form.Label>
                        <AsyncTypeahead
                            id="creditor-typeahead"
                            clearButton
                            placeholder="Enter creditor code"
                            isLoading={this.state.isLoading}
                            onSearch={query => {
                                this.setState({ isLoading: true });
                                fetch(`http://localhost:4000/creditors/${query}`)
                                    .then(resp => resp.json())
                                    .then(json => {
                                        this.setState({
                                            isLoading: false,
                                            creditorOptions: json.recordset
                                        })
                                        // console.log(json);
                                    });
                            }}
                            onChange={(selected) => {
                                // console.log({ selected })
                                this.setState({
                                    assign_creditor: selected.map(a => a.VENDORID)
                                })
                            }}
                            options={this.state.creditorOptions}
                            labelKey={(option) => `${option.VENDORID} - ${option.VENDNAME}`}
                            isInvalid={this.state.errorCreditor}
                            ref={(ref) => this._asynctypeahead = ref}
                        />
                        {this.state.errorCreditor ? <div className="invalid-feedback forced-feedback d-block">Please enter a valid creditor code.</div> : null}
                    </Form.Group>
                    <AssignedEntities module="Creditor" creditor={this.state.assign_creditor[0]} />
                    <Form.Group controlId="formEntity">
                        <Form.Label>Entity</Form.Label>
                        <Typeahead
                            clearButton
                            id="entity-typeahead"
                            onChange={(selected) => {
                                // console.log({ selected })
                                this.setState({
                                    assign_entity: selected.map(a => a.Entity)
                                })
                            }}
                            options={entities}
                            placeholder="Look up an entity by name or entity ID"
                            minLength={2}
                            labelKey={(option) => `${option.Entity} - ${option.Description}`}
                            isInvalid={this.state.errorEntity}
                            ref={(ref) => this._typeahead = ref}
                        />
                        {this.state.errorEntity ? <div className="invalid-feedback forced-feedback d-block">Please enter a valid entity code.</div> : null}
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </div>
        )
    }
}