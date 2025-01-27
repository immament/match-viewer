import React, { createContext } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { App } from "./App";
import { ContainerContext } from "./app/Container.context";

export function mainReact(containerId: string) {
  const container = document.getElementById(containerId);

  if (container) {
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <ContainerContext.Provider value={container}>
            <App />
          </ContainerContext.Provider>
        </Provider>
      </React.StrictMode>
    );
  } else {
    throw new Error(
      "Root element with ID 'root' was not found in the document. Ensure there is a corresponding HTML element with the ID 'root' in your HTML file."
    );
  }
}
