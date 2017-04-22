import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import App from './App';
import './index.css';

ReactDOM.render(
  <Router>
    <div className='root'>
      <Switch>
        <Route exact path="/" component={App}/>
        <Route exact path="/:id" component={App}/>
        <Route render={() => <Redirect to='/' />} />
      </Switch>
    </div>
  </Router>,
  document.getElementById('root')
);
