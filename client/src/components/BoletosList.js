import React, { Component } from 'react';
import MaterialIcon, {colorPalette} from 'material-icons-react';

import ItemBoleto from './ItemBoleto';

class BoletosList extends Component {
  constructor(props){
    super(props);
    this.state =  {
      response: '',
      post: '',
      responseToPost: '',
      lastUpdate : '',
      boletos : [
        {
            "_id": "5c21f6b4847da112eff0d51c",
            "code": "AMONTENEGRO",
            "name": "Amontenegro Advogados",
            "mail": "tarapi007@gmail.com;diegopereiracalcada@gmail.com",
            "file": "BOLETO JAN 2019 - AMONTENEGRO.pdf",
            "willBeSent" : true
        },
        {
            "_id": "5c21f6e6847da112eff0d529",
            "code": "LYONCONSTRUTORA",
            "name": "Lyon Construtora",
            "mail": "diegopereiracalcada@gmail.com",
            "file": "BOLETO JAN 2019 - LYONCONSTRUTORA.pdf",
            "willBeSent" : false
        }
      ],
      total : 10
    };
    this.handleOnSendMailsClick = this.handleOnSendMailsClick.bind(this);
  }

  componentDidMount() {
    console.log("componentDidMount invoked");
    // comentado para dev
    //this.updateBoletos();
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

  changeWillBeSent = (index, willBeSent) =>{
    console.log("[BoletosList] - function alteraWillBeSent invoked. Param index:" + index + " - Param willBeSent:" + willBeSent);
    let boletos = this.state.boletos;
    boletos[index].willBeSent = willBeSent;
    this.setState({"boletos" : boletos });
  }

  render() {
      return (
        <div className="container">
          <div><span className="total-boletos">Total: {this.state.total}</span></div>
          <ul className="collection">
              {
                this.state.boletos.map((boleto, index)=>
                  <ItemBoleto 
                      index={index} 
                      boleto={boleto}
                      changeWillBeSent={this.changeWillBeSent}  /> 
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
