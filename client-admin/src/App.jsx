import { useEffect } from 'react';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import loadable from '@loadable/component'
import { AuthProvider, useIsAuthenticated, HomeRoute, PrivateRoute } from '@hilma/auth';
import { provide } from '@hilma/tools';
import { ALL_ORGANIZATIONS_FILTER, USER_ROLE } from "./consts/consts";
import Navbar from './components/navbar';
import Axios from "axios";
import Login from './pages/login';
import MobilePage from './pages/mobilePage';
import { isBrowser } from 'react-device-detect'
import { observer } from "mobx-react-lite";
import { useAdminData } from "./context/adminDataCtx";
import './consts/class_names.scss';
import './App.scss';
import { useStatisticsPageStore, useSuperAdminStore, useUsersPageStore } from './stores/index.store';

const StatisticsPage = loadable(() => import('./pages/statisticsPage'));
const UsersPage = loadable(() => import('./pages/usersPage'));
const CategoriesPage = loadable(() => import('./pages/categoriesPage'));
const OrganizationsPage = loadable(() => import('./pages/organizationsPage'));
const AddQuestionPage = loadable(() => import('./pages/addQuestionPage'));


function App() {

  const adminDataCtx = useAdminData();
  const isAuth = useIsAuthenticated();
  const superAdminStore = useSuperAdminStore();
  const statisticsPageStore = useStatisticsPageStore();
  const usersPageStore = useUsersPageStore();

  useEffect(() => {
    async function fetchInitialData() {
      if (isAuth) {
        try {
          let userRoleFetch = await Axios.get("/api/admin/user-role");
          adminDataCtx.setAdminRole(userRoleFetch.data.role);
          await superAdminStore.fetchDataForFilters(userRoleFetch.data.role); // fetching the questionnaires and organizations lists for filters
          const questionnaireIdFilter = { name: "questionnaireId", value: superAdminStore.questionnaireTitles[0] };
          let filtersToAdd = [questionnaireIdFilter];
          if (userRoleFetch.data.role === USER_ROLE.ADMIN) {
            adminDataCtx.setAdminOrganizationData({ _id: userRoleFetch.data.organizationId, organizationName: userRoleFetch.data.organizationName });
            const organizationIdFilter = { name: "organizationId", value: userRoleFetch.data.organizationName };
            filtersToAdd.push(organizationIdFilter);
          }
          else if (userRoleFetch.data.role === USER_ROLE.SUPERADMIN) {
            const organizationIdFilter = { name: "organizationId", value: ALL_ORGANIZATIONS_FILTER.organizationName };
            filtersToAdd.push(organizationIdFilter);
          }
          usersPageStore.setFilters(filtersToAdd);
          statisticsPageStore.setFilters(filtersToAdd);
        } catch (e) {
          //?can this return not as ADMIN or SUPERADMIN and if so , what we do
          // generalAlert.openGenAlert({ text: somethingWentWrong, warning: true }); 
        }
      }
    }
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth])
  //todo : when entering as ADMIN and changing the url to categories the screen flickers with login because
  //todo theres a reload on screen so for the first moments the fetch hasn't completed so it send us to login and 
  //todo after that to the correct usersPage component
  return (
    <div className="App">
      {
        !isBrowser ? <MobilePage /> :
          <Router>
            {isAuth && adminDataCtx.adminRole ? <Navbar /> : null}
            <Switch>

              <HomeRoute exact path="/" components={{ usersPage: UsersPage }} redirectComponent={Login} />
              {/* <PrivateRoute componentName="usersPage" path="/" component={(props) => <UsersPage {...props} />} redirectComponent={Login} /> */}
              <PrivateRoute exact path="/statistics" componentName="statisticsPage" component={(props) => <StatisticsPage {...props} />} redirectComponent={Login} />
              <PrivateRoute exact path="/categories" componentName="categoriesPage" component={(props) => <CategoriesPage {...props} />} redirectComponent={adminDataCtx.adminRole === USER_ROLE.ADMIN ? UsersPage : Login} />
              <PrivateRoute exact path="/organizations" componentName="organizationsPage" component={(props) => <OrganizationsPage {...props} />} redirectComponent={adminDataCtx.adminRole === USER_ROLE.ADMIN ? UsersPage : Login} />
              <PrivateRoute exact path="/add_question" componentName="addQuestionPage" component={(props) => <AddQuestionPage {...props} />} redirectComponent={adminDataCtx.adminRole === USER_ROLE.ADMIN ? UsersPage : Login} />
              {/* tried to add it to a private path or something like that but didnt work , to see addQuestion just comment anything else and uncomment this */}

            </Switch>
          </Router>
      }
    </div>
  );
}

export const accessTokenCookie = "kol"
export default provide([AuthProvider, { accessTokenCookie }])(observer(App));
