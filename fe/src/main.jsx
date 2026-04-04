// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Redux Provider wraps the entire app */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
