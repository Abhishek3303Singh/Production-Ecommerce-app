import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from './store/store';
import {Provider} from 'react-redux'
import {positions, transitions, Provider as AlertProvider} from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import { colors } from '@material-ui/core';
const root = ReactDOM.createRoot(document.getElementById('root'));

// const options ={
//   timeout:7000,
//   positions:positions.BOTTOM_CENTER,
//   transitions:transitions.SCALE

// }
const options = {
  position: 'bottom center',
  timeout: 7000,
  offset: '40px',
  transition: 'scale',
}
root.render(
  <Provider store={store}>
    <AlertProvider template={AlertTemplate} {...options}>
    <App />
    </AlertProvider>
  </Provider>
);
