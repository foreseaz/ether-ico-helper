import React, { Component } from 'react';
import './Hero.css';

const Hero = () => (
  <div className="_hero ui transition information">
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
);

export default Hero;
