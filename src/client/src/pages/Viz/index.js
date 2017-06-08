import React, { Component } from 'react';

export default class Viz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addr: props.match.params.addr
    }
  }

  render() {
    return <h1>hello {this.state.addr}</h1>
  }
}
