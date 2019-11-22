import React, { Component } from 'react';
import { asyncContainer, Typeahead } from 'react-bootstrap-typeahead';
import entities from '../shared/entities.js';

import AssignedEntities from './current-entities.component';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

const AsyncTypeahead = asyncContainer(Typeahead);

export default class DebtorCard extends Component {

    constructor(props) {
        super(props);

        this.onChangeEntity = this.onChangeEntity.bind(this);
        this.onChangeGPNumber = this.onChangeGPNumber.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            assign_entity: '',
            assign_debtor: '',
            errorEntity: false,
            errorDebtor: false,
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
            assign_debtor: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault(); // don't reload the page

        let errorDebtor = '';
        let errorEntity = '';

        if (!this.state.assign_debtor) {
            errorDebtor = true;
        }

        if (this.state.assign_entity.length === 0) {
            errorEntity = true;
        }

        // console.log("Debtor Error: " + errorDebtor);
        // console.log("Entity Error: " + errorEntity);

        if (errorDebtor || errorEntity) {
            this.setState({ errorDebtor: errorDebtor, errorEntity });
            return false;
        }

        // console.log(`Entity to assign: ${this.state.assign_entity}`);
        // console.log(`GP Number to assign: ${this.state.assign_debtor}`);

        var debtor = this.state.assign_debtor;
        var entity = this.state.assign_entity

        var postBody = {
            "debtor": debtor.toString(),
            "entity": entity.toString()
        }

        fetch("http://localhost:4000/debtors/", {
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
                    assign_debtor: '',
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
                update_message: `Successfully assigned ${this.state.assign_debtor} to entity ${this.state.assign_entity}`
            })
        }
        if (this.state.update_success === false && this.state.update_message === '') {
            this.setState({
                update_message: `Failed to assign ${this.state.assign_debtor} to entity ${this.state.assign_entity}`
            })
        }

        return (
            <div className="component-container">
                <h2 style={{ marginTop: 10 }}>Assign Debtor to Entity</h2>

                {this.state.update_message ? <Alert variant={this.state.update_success ? 'success' : 'danger'}>{this.state.update_message}</Alert> : null}

                <Form noValidate onSubmit={this.onSubmit} style={{ marginTop: 10 }}>
                    <Form.Group controlId="debtorAsync">
                        <Form.Label>Debtor</Form.Label>
                        <AsyncTypeahead
                            id="debtor-typeahead"
                            clearButton
                            placeholder="Enter debtor code"
                            isLoading={this.state.isLoading}
                            onSearch={query => {
                                this.setState({ isLoading: true });
                                fetch(`http://localhost:4000/debtors/${query}`)
                                    .then(resp => resp.json())
                                    .then(json => {
                                        this.setState({
                                            isLoading: false,
                                            debtorOptions: json.recordset
                                        })
                                        // console.log(json);
                                    });
                            }}
                            onChange={(selected) => {
                                // console.log({ selected })
                                this.setState({
                                    assign_debtor: selected.map(a => a.CUSTNMBR)
                                })
                            }}
                            options={this.state.debtorOptions}
                            labelKey={(option) => `${option.CUSTNMBR} - ${option.CUSTNAME}`}
                            isInvalid={this.state.errorDebtor}
                            ref={(ref) => this._asynctypeahead = ref}
                        />
                        {this.state.errorDebtor ? <div className="invalid-feedback forced-feedback d-block">Please enter a valid debtor code.</div> : null}
                    </Form.Group>
                    <AssignedEntities module="Debtor" debtor={this.state.assign_debtor[0]} />
                    <Form.Group controlId="formEntity">
                        <Form.Label>Entity</Form.Label>
                        <Typeahead
                            clearButton
                            id="enetity-typeahead"
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