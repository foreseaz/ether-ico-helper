import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import 'semantic-ui-css/semantic.min.css';

import App from './App';

const history = createBrowserHistory();

ReactDOM.render((
  <Router history={history}>
    <App />
  </Router>
), document.getElementById('root'));
