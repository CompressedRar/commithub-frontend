import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/index.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import theme from "./assets/styles/theme.jsx"

import App from './App.jsx'
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App></App>
    </BrowserRouter>
  </ThemeProvider>
)
