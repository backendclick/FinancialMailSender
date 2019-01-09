import React, { Component } from 'react';
import Switch from "react-switch";

class ItemBoleto extends Component {

    changeWillBeSent = () => {
        console.log("handleOnAnyChange. this.props.boleto.willBeSent: ", this.props.boleto.willBeSent);
        this.props.changeWillBeSent(this.props.index, !this.props.boleto.willBeSent);
    }

    render() {
        return (
            <li className="collection-item">
                <div className="left">{this.props.boleto.name}</div>
                <div className="status right">
                    <i className="material-icons">radio_button_unchecked</i>
                    <span>Não enviado</span>
                </div>
                <div className="send-switch switch right mt10 mr40">
                    <label htmlFor="send-switch">
                        <span>Enviar</span>
                        <Switch
                            onChange={this.changeWillBeSent}
                            checked={this.props.boleto.willBeSent}
                            id="send-switch"
                        />
                    </label>
                </div>
                <div className="right send-again mt10">
                    <p>
                        <label>
                            <input type="checkbox" className="filled-in" />
                            <span>Re-enviar</span>
                        </label>
                    </p>
                </div>
            </li>
        );
    }
}
export default ItemBoleto;

   