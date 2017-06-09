import React, { Component } from 'react';
import './Hero.css';

export default class Hero extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: ''
    }

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    this.props.handleFilter(event.target.value);
  }

  render() {
    return (
      <div className="_hero ui transition information">
        <h1 className="ui inverted centered header">
          Your ICO investment decision, at its best.
        </h1>
        <p className="ui centered lead">
          ICO Insider makes your ICO investment easy, wise, and efficient.
        </p>
        <div className="ui input search-box">
          <input value={this.state.value} onChange={this.handleChange} className="search-input" type="text" placeholder="Search Coin..." />
          <a href="#ongoing" onClick={this.handleSubmit} type="submit" className="large basic inverted animated fade ui button">
            <div className="visible content search-btn">Search</div>
            <div className="hidden content">Go</div>
          </a>
        </div>
      </div>
    );
  }
}
