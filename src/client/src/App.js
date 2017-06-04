import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App" id="home">
        <div className="ui inverted masthead centered segment">
          <div className="ui page grid" style={{minHeight: '100vh'}}>
            <div className="column">

              <div className="ui secondary pointing menu">
                <a className="logo item">
                  ICO Insider
                </a>
                <a className="active item">
                  <i className="flaticon-home"></i> Search
                </a>
                <a className="item">
                  <i className="flaticon-mail"></i> ICO List
                </a>
              </div>
              <div className="ui transition information">
                <h1 className="ui inverted centered header">
                  Your ICO investment decision, at its best.
                </h1>
                <p className="ui centered lead">
                  ICO Insider makes your ICO investment easy, wise, and efficient.
                </p>
                <div className="ui input search-box">
                  <input className="search-input" type="text" placeholder="Search Coin..." />
                  <a href="#" className="large basic inverted animated fade ui button">
                    <div className="visible content search-btn">Search</div>
                    <div className="hidden content">Go</div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
