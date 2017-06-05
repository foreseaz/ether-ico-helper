import React, { Component } from 'react';

const Footer = () => (
  <div className="ui inverted footer vertical segment center">
    <div className="ui stackable center aligned page grid">
      <div className="four column row">
        <div className="column">
          <h5 className="ui inverted header">Team</h5>
          <div className="ui inverted link list">
            <a className="item">Registration</a>
            <a className="item">Course Calendar</a>
            <a className="item">Professors</a>
          </div>
        </div>
        <div className="column">
          <h5 className="ui inverted header">Library</h5>
          <div className="ui inverted link list">
            <a className="item">A-Z</a>
            <a className="item">Most Popular</a>
            <a className="item">Recently Changed</a>
          </div>
        </div>
        <div className="column">
          <h5 className="ui inverted header">Community</h5>
          <div className="ui inverted link list">
            <a className="item">BBS</a>
            <a className="item">Careers</a>
            <a className="item">Privacy Policy</a>
          </div>
        </div>
        <div className="column">
          Foo
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
