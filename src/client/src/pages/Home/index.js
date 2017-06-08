import React, { Component } from 'react';

import Nav from '../../components/Nav';
import Hero from '../../components/Hero';
import TokenGrid from '../../components/TokenGrid';
import Footer from '../../components/Footer';

import styles from './Home.css';
import particlesConfig from '../../config/particlesjs-config.js';
import 'particles.js';

export default class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (window.particlesJS) {
      window.particlesJS('particles-js', particlesConfig);
    }
  }

  render() {
    return (
      <div>
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
