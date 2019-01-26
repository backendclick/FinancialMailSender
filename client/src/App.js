import React, { Component } from 'react';
import BoletosList from "./components/BoletosList";
import logo from './logo.svg';
import './css/style.css';

const dayjs = require('dayjs');


class App extends Component {
  state = {
    lastPing : "",
    inError : false
  }

  componentDidMount(){
    console.log("Iniciado teste de comunicação com o banco.");
    this.pingBackEnd();
    setInterval(()=>{
      this.pingBackEnd();
    }, 2000);
  }

  pingBackEnd = () => {
    fetch("/bdPing")
        .then(resposta=> resposta.json())
        .then((json)=>{
          console.log("[pingBackEnd] - Json recebido: ", json);
          if(json.status == 1){
            this.setState({inError : false, lastPing : json.pingTime});
          } else {
            throw new Error(json.msg);
          }
        })
        .catch(err => {
          this.setState({inError : true, lastPing : "Erro às " + new dayjs().format("DD/MM/YYYY HH:mm:ss")});
          console.log("[pingBackEnd] - ERROR");
        });
  }

  render() {
    return (
      <div>
        <header className="bt-shadow">
          <div className="container">
            <h3>FMS</h3>
          </div>
        </header>
        <main>
          <BoletosList />
        </main>
        <footer  className={this.state.inError == true ? "red-bg bg-transition" : "bg-transition"}>
          BD last ping: {this.state.lastPing}
        </footer>
      </div>
    );
  }
}
export default App;