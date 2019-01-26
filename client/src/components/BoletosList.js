import React, { Component } from 'react';
import Select from 'react-select';
import MaterialIcon, {colorPalette} from 'material-icons-react';

import ItemBoleto from './ItemBoleto';

const dayjs = require('dayjs');

const monthOptions = [
  { value: 'JAN', label: 'JAN' },
  { value: 'FEB', label: 'FEB' },
  { value: 'MAR', label: 'MAR' },
  { value: 'APR', label: 'APR' },
  { value: 'MAY', label: 'MAY' },
  { value: 'JUN', label: 'JUN' },
  { value: 'JUL', label: 'JUL' },
  { value: 'AUG', label: 'AUG' },
  { value: 'SEP', label: 'SEP' },
  { value: 'OCT', label: 'OCT' },
  { value: 'NOV', label: 'NOV' },
  { value: 'DEC', label: 'DEC' }
];

class BoletosList extends Component {
  constructor(props){
    super(props);
    this.state =  {
      response: '',
      post: '',
      responseToPost: '',
      nextMonth : dayjs().add(1, 'month').format('MMM').toUpperCase(),
      lastUpdate : '',
      boletos : [ ],
      total : ''
    };
    console.log("BoletosList constrúido. state:", this.state.nextMonth);
  }

  componentDidMount() {
    console.log("componentDidMount invoked. state: ", this.state);
    //this.fetchBoletos();
  }

  callBoletosApi = async () => {
    console.log("callApi invoked");
    const response = await fetch('/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({ 
        nextMonth : this.state.nextMonth
      })
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };
  
  changeWillBeSent = (index, willBeSent) =>{
    console.log("[BoletosList] - function alteraWillBeSent invoked. Param index:" + index + " - Param willBeSent:" + willBeSent);
    let boletos = this.state.boletos;
    boletos[index].willBeSent = willBeSent;
    this.setState({"boletos" : boletos });
  }

  fetchBoletos = () =>{
    console.log("fetchBoletos invoked");
    this.callBoletosApi()
        .then(boletos => {
            // this.setState({ responseToPost: res, lastUpdate : new Date() });
            console.log("fetchBoletos - resposta:", boletos);
            console.log("State atual:  ", this.state);
            this.setState({boletos : boletos, total: boletos.length, lastUpdate : dayjs().format('DD/MM/YYYY HH:mm:ss')});
          })
        .catch(err => console.log(err));
  }
  
  handleOnFetchBoletosClick = () => {
    this.fetchBoletos();
  }

  handleOnMonthChanged = (item) => {
    console.log(item);
    this.setState({
      nextMonth : item.value
    });
  }

  handleOnSendMailsClick = (event) => {
    console.log("handleOnSendMailsClick - invoked");

    this.sendMails()
        .then((data) => {
          console.info("then...", data);
        })
        .catch((data) => {
          console.error("catch...", data);
        });
  }

  sendMails = async () => {
    fetch(
      "/sendMails",
      {
        method: "POST",
        headers : {
          "Accept" : "application/json",
          "Content-type" : "application/json"
        },
        "body" : JSON.stringify(this.state.boletos)
      }
    )
    .then(response => response.json())
    .then((json)=>{
      console.log("respondeu");
      alert(JSON.stringify(json));
    });
  }

  render() {
      return (
        <div className="container">
          <div><span className="total-boletos">Total: {this.state.total}</span></div>
          <div class="month-choice">
              <span><b>Mostrando resultados do mês: </b></span>
              <span>{this.state.nextMonth}</span>
              <Select
                  placeholder={this.state.nextMonth}
                  onChange={this.handleOnMonthChanged}
                  options={monthOptions}
                />
          </div>
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
            <button className="left" style={{marginRight: 10, border: 'none', background: 'transparent'}} onClick={this.handleOnFetchBoletosClick}><MaterialIcon icon="refresh" size={30} /></button>
            <span className="left" style={{marginTop: 5}}>Atualizado em <span className="last-update">{this.state.lastUpdate}</span></span>
            <button onClick={this.handleOnSendMailsClick} className="btn btn-send-selecteds right">Enviar selecionados</button>
          </div>
      </div>
        
      );
    }
  }


export default BoletosList;
