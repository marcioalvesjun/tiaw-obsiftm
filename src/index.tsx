import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  const { worker } = await import('./mocks/browser');

  // In local dev, MSW service worker script must be served as JS.
  // CRA's `homepage` can affect static serving; using a runtime base path keeps it stable.
  const computedBasename = (() => {
    if (typeof window === "undefined") return "";
    const [first] = window.location.pathname.split("/").filter(Boolean);
    return first ? `/${first}` : "";
  })();
  const swUrl = computedBasename ? `${computedBasename}/mockServiceWorker.js` : "/mockServiceWorker.js";
  return worker.start({
    serviceWorker: { url: swUrl },
    onUnhandledRequest: 'bypass',
  });
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
enableMocking().then(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
