import { types } from 'mobx-state-tree'

export const SettingsStore = types
  .model('SettingsStore', {
    apiUrl: types.optional(types.string, `wss://${process.env.APP_PHALA_URL}/ws`)
  })
  .views(self => ({}))
  .actions(self => ({}))

export default SettingsStore
