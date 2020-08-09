import { types } from 'mobx-state-tree'
import { createPersistStore } from './store'

export const SettingsStore = types
  .model('SettingsStore', {
    id: types.identifier,
    apiUrl: types.maybe(types.string),
    phalaTeeApiUrl: types.maybe(types.string)
  })
  .views(self => ({}))
  .actions(self => ({
    applyValues (values) {
      Object.keys(values).forEach(k => {
        self[k] = values[k]
      })
    }
  }))

export const defaultApiUrl = `wss://${process.env.APP_PHALA_URL}/ws`

export default () => {
  const store = createPersistStore('settings', SettingsStore, {
    id: 'appSettings',
    phalaTeeApiUrl: `https://${process.env.APP_PHALA_URL}/tee-api/`
  })

  // do reactions here

  return store
}
