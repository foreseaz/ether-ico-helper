import React, { Component } from 'react';
import './Nav.css';

const Nav = ({ batActive = false }) => (
  <div className="_nav ui secondary pointing menu">
    <a className="logo item" href='/'>
      ICO Insider
    </a>
    <a className={batActive ? "item" : "active item"} href='/#list'>
      <i className="flaticon-home"></i> ICO List
    </a>
    <a className={batActive ? "active item" : "item"} href='/viz/0x0d8775f648430679a709e98D2B0cB6250D2887ef'>
      <i className="flaticon-mail"></i> BAT ICO Analysis
    </a>
  </div>
)

export default Nav;
