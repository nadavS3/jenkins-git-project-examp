import { createContext, createElement, useContext } from 'react'
// import { adminQuestionsStore } from './adminQuestion.store'
import { UsersStore } from './users.store'
import { QuestionsStore } from './questions.store'

// Questions store context: // ! not relevant
// const AdminQuestionsStoreContext: React.Context<adminQuestionsStore | null> = createContext<adminQuestionsStore | null>(null)

// export const AdminQuestionsStoreProvider: React.FC = ({ children }) => createElement(AdminQuestionsStoreContext.Provider, { value: new adminQuestionsStore() }, children)

// export const useAdminQuestionsStore = () => useContext(AdminQuestionsStoreContext)

// Users store context:
const UsersStoreContext: React.Context<UsersStore | null> = createContext<UsersStore | null>(null) //create Context

export const UsersStoreProvider: React.FC = ({ children }) => createElement(UsersStoreContext.Provider, { value: new UsersStore() }, children) //create Context Provider to wrap index.js

export const useUsersStore = () => useContext(UsersStoreContext) //create a custom hook which gives the component access to the Store through Context


// Question store context:
const QuestionsStoreContext: React.Context<QuestionsStore | null> = createContext<QuestionsStore | null>(null) //create Context

export const QuestionsStoreProvider: React.FC = ({ children }) => createElement(QuestionsStoreContext.Provider, { value: new QuestionsStore() }, children) //create Context Provider to wrap index.js

export const useQuestionsStore = () => useContext(QuestionsStoreContext) //create a custom hook which gives the component access to the Store through Context