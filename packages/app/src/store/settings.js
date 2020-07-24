import { types } from 'mobx-state-tree'

export const SettingsStore = types
  .model('SettingsStore', {
    apiUrl: types.optional(types.string, 'wss://dp.phala.network/ws')
  })
  .views(self => ({}))
  .actions(self => ({}))

export default SettingsStore
