import React, { Component } from 'react';

export default class MainPage extends Component {

    // constructor(props) {
    //     super(props);

    //     this.onChangeEntity = this.onChangeEntity.bind(this);
    //     this.onChangeGPNumber = this.onChangeGPNumber.bind(this);
    //     this.onChangeModule = this.onChangeModule.bind(this);
    //     this.onSubmit = this.onSubmit.bind(this);

    //     this.state = {
    //         assign_entity: '',
    //         assign_gp_number: '',
    //         assign_module: ''
    //     }
    // }

    // onChangeEntity(e) {
    //     this.setState({
    //         assign_entity: e.target.value
    //     });
    // }

    // onChangeGPNumber(e) {
    //     this.setState({
    //         assign_gp_number: e.target.value
    //     });
    // }

    // onChangeModule(e) {
    //     this.setState({
    //         assign_module: e.target.value
    //     });
    // }

    // onSubmit(e) {
    //     e.preventDefault();

    //     console.log(`Module to assign: ${this.state.assign_module}`);
    //     console.log(`Entity to assign: ${this.state.assign_entity}`);
    //     console.log(`GP Number to assign: ${this.state.assign_gp_number}`);
    // }

    render() {
        return (
            <div style={{ marginTop: 10 }}>
                <h3>MEM Assign Entity App</h3>
                <p>This tool exists as an easy way for St John Ambulance employees to assign creditors/debtors to specific entities in GP.</p>
            </div>
        )
    }
}