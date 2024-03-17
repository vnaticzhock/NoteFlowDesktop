import './i18n.js'
import './index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import reportWebVitals from './reportWebVitals.js'

// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "pdfjs-dist/build/pdf.worker.min.js",
//   import.meta.url,
// ).toString();

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('No root element found')
}
const root = ReactDOM.createRoot(rootElement)

root.render(
  <React.StrictMode>
    <App />,
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
