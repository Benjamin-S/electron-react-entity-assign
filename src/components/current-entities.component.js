import React, { Component } from 'react';

import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';

export default class AssignedEntities extends Component {

    constructor(props) {
        super(props);

        this.updateData = this.updateData.bind(this);

        this.state = {
            assigned_entities: [],
        }
    }

    componentDidMount() {
        this.updateData();
    }

    updateData() {
        if (this.props.module === 'Creditor') {
            fetch(`http://localhost:4000/creditors/entities/${this.props.creditor}`)
                .then(resp => resp.json())
                .then(json => {
                    this.setState({
                        assigned_entities: json.recordset.map(a => a.ENTITY)
                    })
                    // console.log(json);
                });
        }
        if (this.props.module === 'Debtor') {
            fetch(`http://localhost:4000/debtors/entities/${this.props.debtor}`)
                .then(resp => resp.json())
                .then(json => {
                    this.setState({
                        assigned_entities: json.recordset.map(a => a.ENTITY)
                    })
                    console.log(json);
                });
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.creditor !== prevProps.creditor) {
            this.updateData();
        }
        if (this.props.debtor !== prevProps.debtor) {
            this.updateData();
        }
    }

    componentWillUnmount() {

    }

    render() {
        let entity_list = this.state.assigned_entities.map((entity) =>
            <ListGroup.Item key={entity}>{entity}</ListGroup.Item>
        )

        if (entity_list.length === 0) {
            // console.log("Entity List is empty");
            return null
        }
        return (
            <Card style={{ marginBottom: 10 }}>
                <Card.Header as="h6">{this.props.module} already has access to these entities</Card.Header>
                {entity_list}
            </Card>
        )
    }
}