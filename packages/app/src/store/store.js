import localForage from 'localforage'
import { persist } from 'mst-persist'
import createSettingsStore from './settings'
import createAccountStore from './account'

export const createPersistStore = (name, model, defaultValue = {}, options = {}) => {
  const ret = model.create(defaultValue)

  persist(`app_${name}`, ret, {
    storage: localForage,
    jsonify: false,
    ...options
  })

  return ret
}

export default function createStore () {
  return {
    settings: createSettingsStore(),
    account: createAccountStore()
  }
}
