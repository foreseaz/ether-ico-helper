import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './pages/Home';

import './App.css';

class App extends Component {
  render() {
    return (
      <Switch>
        <div className="App" id="home">
          <Route exact path="/" component={Home}/>
        </div>
      </Switch>
    );
  }
}

export default App;
