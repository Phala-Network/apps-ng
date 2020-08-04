import localForage from 'localforage'
import { persist } from 'mst-persist'
import SettingsStore from './settings'

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
    settings: createPersistStore('settings', SettingsStore, { id: 'appSettings' })
  }
}
