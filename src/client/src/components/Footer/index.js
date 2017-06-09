import React, { Component } from 'react';

const Footer = () => (
  <div className="ui inverted footer vertical segment center">
    <div className="ui stackable center aligned page grid">
      <div className="four column row">
        <div className="column">
        </div>
        <div className="column">
          <h5 className="ui inverted header">Contributors</h5>
          <div className="ui inverted link list">
            <p>By alphabetical order:</p>
            <a className="item" href="https://github.com/foreseaz/">@foreseaz</a>
            <a className="item" href="https://github.com/zeqing-guo">@lambda</a>
            <a className="item" href="https://github.com/edithli">@liss</a>
            <a style={{color: 'white'}} href="https://github.com/foreseaz/ether-ico-helper">Github Repo</a>
          </div>
        </div>
        <div className="column">
        </div>
      </div>
    </div>
  </div>
);

export default Footer;
