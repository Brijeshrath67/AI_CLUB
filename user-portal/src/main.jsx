import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// MutationObserver to hide the "Built with Spline" logo in the Shadow DOM
const observer = new MutationObserver(() => {
  const viewers = document.querySelectorAll('spline-viewer');
  viewers.forEach((viewer) => {
    if (viewer.shadowRoot) {
      const logo = viewer.shadowRoot.querySelector('#logo') || viewer.shadowRoot.querySelector('a[href*="spline.design"]');
      if (logo && logo.style.display !== 'none') {
        logo.style.display = 'none';
      }
    }
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
