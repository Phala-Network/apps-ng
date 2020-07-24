import React, { createContext, useContext } from 'react'
import { useLocalStore } from 'mobx-react'
import createStore from './store'

export const StoreContext = createContext()

export const StoreProvider = ({ children }) => {
  const store = useLocalStore(createStore)

  return <StoreContext.Provider value={store}>
    {children}
  </StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider.')
  }
  return store
}
