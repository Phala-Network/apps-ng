import { types } from 'mobx-state-tree'

export const SettingsStore = types
  .model('SettingsStore', {
    id: types.identifier,
    apiUrl: types.optional(types.string, `wss://${process.env.APP_PHALA_URL}/ws`),
    phalaTeeApiUrl: types.optional(types.string, `https://${process.env.APP_PHALA_URL}/tee-api/`)
  })
  .views(self => ({}))
  .actions(self => ({
    applyValues (values) {
      Object.keys(values).forEach(k => {
        self[k] = values[k]
      })
    }
  }))

export default SettingsStore
