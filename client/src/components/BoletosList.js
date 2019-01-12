import React, { Component } from 'react';
import MaterialIcon, {colorPalette} from 'material-icons-react';

import ItemBoleto from './ItemBoleto';

const dayjs = require('dayjs');

class BoletosList extends Component {
  constructor(props){
    super(props);
    this.state =  {
      response: '',
      post: '',
      responseToPost: '',
      lastUpdate : '',
      boletos : [ ],
      total : ''
    };
    // this.handleOnSendMailsClick = this.handleOnSendMailsClick.bind(this);
  }

  componentDidMount() {
    console.log("componentDidMount invoked");
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
  
  // handleOnSendMailsClick(event) {
  //   console.log("handleOnSendMailsClick - invoked");

  //   this.sendMails()
  //       .then((data) => {
  //         console.info("then...", data);
  //       })
  //       .catch((data) => {
  //         console.error("catch...", data);
  //       });
  // }

  handleUpdateBoletosOnClick = () => {
    this.updateBoletos();
  }

  updateBoletos = () =>{
    console.log("updateBoletos invoked");
    this.callBoletosApi()
        .then(boletos => {
            // this.setState({ responseToPost: res, lastUpdate : new Date() });
            console.log("updateBoletos - resposta:", boletos);
            console.log("State atual:  ", this.state);
            this.setState({boletos : boletos, total: boletos.length, lastUpdate : dayjs().format('DD/MM/YYYY HH:mm:ss')});
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
                      key={index} 
                      boleto={boleto}
                      changeWillBeSent={this.changeWillBeSent}  /> 
                )
              }
          </ul>
          <div className="action-bar">
            <button className="left" style={{marginRight: 10, border: 'none', background: 'transparent'}} onClick={this.handleUpdateBoletosOnClick}><MaterialIcon icon="refresh" size={30} /></button>
            <span className="left" style={{marginTop: 5}}>Atualizado em <span className="last-update">{this.state.lastUpdate}</span></span>
            <button onClick={this.handleOnSendMailsClick} className="btn btn-send-selecteds right">Enviar selecionados</button>
          </div>
      </div>
        
      );
    }
  }


export default BoletosList;
