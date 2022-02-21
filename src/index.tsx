import React from 'react';
import ReactDOM from 'react-dom';
import { hot } from 'react-hot-loader';
import { App } from '@code-not-art/sketch';
import sketch from './sketch';

declare const module: any;
export default hot(module)(App);

const root = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
    <App
      sketch={sketch}
      title={'simplex rorschach | code-not-art'}
      description={
        'Demo sketch for simplex noise in @code-not-art/core library'
      }
    />
  </React.StrictMode>,
  root,
);
