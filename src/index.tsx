import React from "react";
import { Provider } from "react-redux";
import ReactDOM from "react-dom/client";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { store } from "./reducers";

import "./index.css";
import "onsenui/css/onsenui.css";
import "onsenui/css/onsen-css-components.css";

// Guard against DOM races between React updates and custom-elements polyfills.
if (typeof window !== "undefined" && !(window as Window & { __werwolfDomPatched?: boolean }).__werwolfDomPatched) {
  const nativeRemoveChild = Node.prototype.removeChild;
  const nativeInsertBefore = Node.prototype.insertBefore;
  const nativeAppendChild = Node.prototype.appendChild;

  Node.prototype.removeChild = function <T extends Node>(childNode: T): T {
    if (childNode.parentNode !== this) {
      return childNode;
    }

    try {
      return nativeRemoveChild.call(this, childNode) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return childNode;
      }
      throw error;
    }
  };

  Node.prototype.insertBefore = function <T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      return nativeAppendChild.call(this, newNode) as T;
    }

    try {
      return nativeInsertBefore.call(this, newNode, referenceNode) as T;
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return nativeAppendChild.call(this, newNode) as T;
      }
      throw error;
    }
  };

  (window as Window & { __werwolfDomPatched?: boolean }).__werwolfDomPatched = true;
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <Provider store={store}>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </Provider>
  // </React.StrictMode>
);

const offlineModeEnabled = process.env.REACT_APP_ENABLE_SW === "true";
if (offlineModeEnabled) {
  serviceWorkerRegistration.register();
} else {
  serviceWorkerRegistration.unregister();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
