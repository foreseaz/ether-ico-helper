import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './pages/Home';
import Viz from './pages/Viz';

import './App.css';

class App extends Component {
  render() {
    return (
      <Switch>
        <div className="App" id="home">
          <Route exact path="/" component={Home}/>
          <Route exact path="/viz/:addr" component={Viz}/>
        </div>
      </Switch>
    );
  }
}

export default App;
