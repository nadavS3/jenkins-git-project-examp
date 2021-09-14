import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch } from "react-router-dom";
import { observer } from "mobx-react-lite";
import loadable from '@loadable/component'
//pages
// import ServerDownPopUp from "./genericComponents/ServerDownPopUp";
// import AddQuestionPage from "./pages/admin/AddQuestionPage";
// import QuestionnairePage from './pages/QuestionnairePage';
// import PhoneCenterPage from "./pages/PhoneCenterPage";
// import RotateYourDevicePage from './pages/RotateYourDevicePage';
// import CoursesPage from './pages/CoursesPage';

//auth
import { AuthProvider, HomeRoute, PrivateRoute } from '@hilma/auth';
import { provide } from '@hilma/tools';

//css
import './App.css';
import "./consts/animations.scss"

import { setVHVW } from './index.js'
import { useUsersStore } from "./stores/index.store";
import { isBrowser, isMobile, isMobileOnly } from "react-device-detect";

const ServerDownPopUp = loadable(() => import('./genericComponents/ServerDownPopUp'));

const RotateYourDevicePage = loadable(() => import('./pages/RotateYourDevicePage'));

const QuestionnairePage = loadable(() => import('./pages/QuestionnairePage'));

const PhoneCenterPage = loadable(() => import('./pages/PhoneCenterPage'));

const CoursesPage = loadable(() => import('./pages/CoursesPage'));

const App = () => {

  useEffect(() => {
    (async () => {
      if ("serviceWorker" in navigator) {
        if (!navigator.onLine) return
        window.addEventListener('load', async () => {
          isMobileOnly ? await navigator.serviceWorker.register("/workerMobile.js", { scope: "/" })
            : await navigator.serviceWorker.register("/workerBrowser.js", { scope: "/" });
        })
      }
    })()
  }, [])

  const usersStore = useUsersStore();
  if (!navigator.onLine) {
    (async () => {
      console.log('you have no internet');
      await navigator.serviceWorker.register("/workerOffline.js", { scope: "/" })
    })()
  }

  const [rotatedDevice, setRotatedDevice] = useState(isMobileOnly && (window.orientation));

  useEffect(() => {
    if (isBrowser) {
      window.onresize = setVHVW;
    }
    if (isMobile) {
      window.onresize = () => {
        if (!usersStore.isKeyboardFocused) {
          setVHVW();
        }
      };
    }
    window.addEventListener("orientationchange", () => { setRotatedDevice(isMobileOnly && (window.orientation)); })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {rotatedDevice ? <RotateYourDevicePage /> : null}
      <div className={`App ${rotatedDevice ? "hide" : ""}`}>
        {usersStore.errorPopUp ? <ServerDownPopUp message={usersStore.popUpMessage} /> : ''}
        <Router>
          <Switch>
            <HomeRoute exact path="/" components={{ QuestionnairePage: QuestionnairePage }} redirectComponent={PhoneCenterPage} />
            <PrivateRoute exact path="/questions-review" componentName="QuestionsReview" component={QuestionnairePage} redirectComponent={PhoneCenterPage} />
            <PrivateRoute exact path="/courses-page" componentName="CoursesPage" component={CoursesPage} redirectComponent={PhoneCenterPage} />
          </Switch>
        </Router>
      </div>
    </>
  );
}
export const accessTokenCookie = "kol"
export default provide([AuthProvider, { accessTokenCookie }])(observer(App));
