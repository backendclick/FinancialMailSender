import React, { Component } from 'react';
import MaterialIcon, {colorPalette} from 'material-icons-react';

import ItemBoleto from './ItemBoleto';

class BoletosList extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
    lastUpdate : '',
    boletos : []
    // ,
    // boletos : [
    //   {
    //       "_id": "5c21f6b4847da112eff0d51c",
    //       "code": "AMONTENEGRO",
    //       "name": "Amontenegro Advogados",
    //       "mail": "tarapi007@gmail.com;diegopereiracalcada@gmail.com",
    //       "file": "BOLETO JAN 2019 - AMONTENEGRO.pdf"
    //   },
    //   {
    //       "_id": "5c21f6e6847da112eff0d529",
    //       "code": "LYONCONSTRUTORA",
    //       "name": "Lyon Construtora",
    //       "mail": "diegopereiracalcada@gmail.com",
    //       "file": "BOLETO JAN 2019 - LYONCONSTRUTORA.pdf"
    //   }
    // ]
  };

  constructor(props){
    super(props);
    this.handleOnSendMailsClick = this.handleOnSendMailsClick.bind(this);
    this.handleUpdateBoletosOnClick = this.handleUpdateBoletosOnClick.bind(this);
  }

  componentDidMount() {
    console.log("didMount invoked");
    this.updateBoletos();
  }

  callBoletosApi = async () => {
    console.log("callApi invoked");
    const response = await fetch('/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  
  handleOnSendMailsClick(event) {
    console.log("handleOnSendMailsClick - invoked");

    this.sendMails()
        .then((data) => {
          console.info("then...", data);
        })
        .catch((data) => {
          console.error("catch...", data);
        });
  }

  handleUpdateBoletosOnClick(){
    this.updateBoletos();
  }

  handleOnIBSendSwitchChange(){
    console.log("handleOnIBSendSwitchChange - invoked");

  }

  updateBoletos(){
    console.log("handleUpdateBoletosOnClick invoked");
    this.callBoletosApi()
        .then(boletos => {
            // this.setState({ responseToPost: res, lastUpdate : new Date() });
            console.log("handleUpdateBoletosOnClick - resposta:", boletos);
            console.log("State atual:  ", this.state);
            this.setState({boletos : boletos, lastUpdate : new Date().toString()});
          })
        .catch(err => console.log(err));
  }

  sendMails = async () => {
    const response = await fetch(
      "/sendMails",
      {
        method: "POST",
        headers : {
          "Accept" : "application/json",
          "Content-type" : "application/json"
        },
        "body" : JSON.stringify(this.state.boletos)
      }
    );

    console.log("Retornou. Aguarde resposta");

    const body = await response.json();

    console.log("Resposta: ", body);

    if(200 !== response.status) throw Error(body.message);
    
    this.setState({boletos : body});
  }

  render() {
      return (
        <div className="container">
          <ul className="collection">
              {
                this.state.boletos.map((boleto)=>
                  <ItemBoleto handleOnSendSwitchChange={this.handleOnIBSendSwitchChange} boleto={boleto} />
                )
              }
          </ul>
          <div className="action-bar">
            <button className="left" onClick={this.handleUpdateBoletosOnClick}><MaterialIcon icon="refresh" size={30} /></button>
            <span className="left">Atualizado em <span className="last-update">{this.state.lastUpdate}</span></span>
            <button onClick={this.handleOnSendMailsClick} className="btn btn-send-selecteds right">Enviar selecionados</button>
          </div>
      </div>
        
      );
    }
  }


export default BoletosList;
