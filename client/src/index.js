import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import {
  UsersStoreProvider,
  QuestionsStoreProvider,
} from "./stores/index.store";
import { GenAlertProvider } from "./contexts/generalAlertCtx";
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

library.add(fas);
export const setVHVW = () => {
  document.documentElement.style.setProperty('--vh', `${(document.documentElement.clientHeight) / 100}px`);
  document.documentElement.style.setProperty('--vw', `${(document.documentElement.clientWidth) / 100}px`);
}
setVHVW(); // first

ReactDOM.render(
  <React.StrictMode>
    <GenAlertProvider>
      <QuestionsStoreProvider>
        <UsersStoreProvider>
            <DndProvider backend={HTML5Backend} >
              <App />
            </DndProvider>
        </UsersStoreProvider>
      </QuestionsStoreProvider>
    </GenAlertProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
// serviceWorker.register();
