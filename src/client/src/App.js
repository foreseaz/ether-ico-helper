import React, { Component } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import TokenGrid from './components/TokenGrid';
import Footer from './components/Footer';

import particlesConfig from './config/particlesjs-config.js';
import 'particles.js';
import './App.css';

class App extends Component {
  componentDidMount() {
    if (window.particlesJS) {
      window.particlesJS('particles-js', particlesConfig);
    }
  }

  render() {
    return (
      <div className="App" id="home">
        <div className="landing-wrapper ui inverted masthead centered segment">
        <div id="particles-js"></div>
          <div className="ui page grid">
            <div className="column">
              <Nav />
              <Hero />
            </div>
          </div>
        </div>
        <TokenGrid />
        <Footer />
      </div>
    );
  }
}

export default App;
