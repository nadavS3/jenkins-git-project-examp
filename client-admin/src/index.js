import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';
import { UsersPageStoreProvider, StatisticsPageStoreProvider, SuperAdminStoreProvider } from './stores/index.store'
import reportWebVitals from './reportWebVitals';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { GenAlertProvider } from './context/generalAlertCtx';
import { AdminDataProvider } from "./context/adminDataCtx";

library.add(fas);

ReactDOM.render(
  <React.StrictMode>
    <GenAlertProvider>
      <AdminDataProvider>
        <UsersPageStoreProvider>
          <SuperAdminStoreProvider>
              <StatisticsPageStoreProvider>
                <App />
              </StatisticsPageStoreProvider>
          </SuperAdminStoreProvider>
        </UsersPageStoreProvider>
      </AdminDataProvider>
    </GenAlertProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
