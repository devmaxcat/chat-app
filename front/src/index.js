import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import * as process from 'process';

(window).global = window;
(window).process = process;
(window).Buffer = [];

const root = ReactDOM.createRoot(document.getElementById('root'));



    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );





