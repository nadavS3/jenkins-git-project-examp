import { createContext, createElement, useContext } from 'react'
import { statisticsPageStore } from './statisticsPage.store'
import { usersPageStore } from './usersPage.store'
import { superAdminStore } from "./superAdmin.store";

const UsersPageStoreContext: React.Context<usersPageStore | null> = createContext<usersPageStore | null>(null);

export const UsersPageStoreProvider: React.FC = ({ children }) => createElement(UsersPageStoreContext.Provider, { value: new usersPageStore() }, children);

export const useUsersPageStore = () => useContext(UsersPageStoreContext);

const StatisticsPageStoreContext: React.Context<statisticsPageStore | null> = createContext<statisticsPageStore | null>(null);

export const StatisticsPageStoreProvider: React.FC = ({ children }) => createElement(StatisticsPageStoreContext.Provider, { value: new statisticsPageStore() }, children);

export const useStatisticsPageStore = () => useContext(StatisticsPageStoreContext);

const SuperAdminStoreContext: React.Context<superAdminStore | null> = createContext<superAdminStore | null>(null);

export const SuperAdminStoreInstance = new superAdminStore();

export const SuperAdminStoreProvider: React.FC = ({ children }) => createElement(SuperAdminStoreContext.Provider, { value: SuperAdminStoreInstance }, children);

export const useSuperAdminStore = () => useContext(SuperAdminStoreContext);