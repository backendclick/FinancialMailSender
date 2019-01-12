import React, { Component } from 'react';
import BoletosList from "./components/BoletosList";
import logo from './logo.svg';
import './css/style.css';

class App extends Component {
  state = {
    lastPing : ""
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
        .then(resposta=>
          resposta.json()
        )
        .then((json)=>{
          //console.log("Recebida resposta do ping,. Resposta", json);
          this.setState({lastPing : json.pingTime});
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
        <footer>
          BD last ping: {this.state.lastPing}
        </footer>
      </div>
    );
  }
}
export default App;