import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import bootstrapStylesUrl from 'bootstrap/dist/css/bootstrap.min.css?url';
import './designSystemTokens.css';
import './index.css';

// Product details still uses the Bootstrap grid for its desktop two-column layout.
// Keep that stylesheet scoped to the product route so the independent home page
// retains its original layout and spacing.
const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
if (pathname === '/product-details' || new URLSearchParams(window.location.search).get('screen') === 'product-details') {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = bootstrapStylesUrl;
  document.head.prepend(stylesheet);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
