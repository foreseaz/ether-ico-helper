import React, { Component } from 'react';
import _ from 'lodash';

import Nav from '../../components/Nav';
import Hero from '../../components/Hero';
import TokenGrid from '../../components/TokenGrid';
import Footer from '../../components/Footer';

import _tokens from '../../data/tokens.json';
import styles from './Home.css';
import particlesConfig from '../../config/particlesjs-config.js';
import 'particles.js';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tokens: _tokens
    }

    _.bindAll(this, [
      'handleFilter',
    ])
  }

  componentDidMount() {
    if (window.particlesJS) {
      window.particlesJS('particles-js', particlesConfig);
    }
  }

  handleFilter(q) {
    let tokens = _tokens;
    if (q !== '') {
      tokens = _.filter(tokens, t => _.includes(t.symbol, q) || _.includes(t.description, q) || _.includes(t.name, q));
    }
    this.setState({ tokens });
  }

  render() {
    return (
      <div>
        <div className="landing-wrapper ui inverted masthead centered segment">
          <div id="particles-js"></div>
          <div className="ui page grid">
            <div className="column">
              <Nav />
              <Hero handleFilter={this.handleFilter}/>
            </div>
          </div>
        </div>
        <TokenGrid tokens={this.state.tokens} />
        <Footer />
      </div>
    );
  }
}
