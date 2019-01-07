import React, { Component } from 'react';
import BoletosList from "./components/BoletosList";
import logo from './logo.svg';
import './css/style.css';
class App extends Component {
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
      </div>
    );
  }
}
export default App;