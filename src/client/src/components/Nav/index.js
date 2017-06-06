import React, { Component } from 'react';
import './Nav.css';

const Nav = () => (
  <div className="_nav ui secondary pointing menu">
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
)

export default Nav;