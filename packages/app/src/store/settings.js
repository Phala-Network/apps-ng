import { types } from 'mobx-state-tree'
import { createPersistStore } from './store'
import { reaction } from 'mobx'
import { i18n } from '@/utils/i18n'

export const SettingsStore = types
  .model('SettingsStore', {
    id: types.identifier,
    apiUrl: types.maybe(types.string),
    phalaTeeApiUrl: types.maybe(types.string),
    language: types.maybe(types.string)
  })
  .views(self => ({}))
  .actions(self => ({
    applyValues (values) {
      Object.keys(values).forEach(k => {
        self[k] = values[k]
      })
    },
    setLanguage (l) {
      self.language = l
    }
  }))

export const defaultApiUrl = `wss://${process.env.APP_PHALA_URL}/ws`

export default () => {
  const store = createPersistStore('settings', SettingsStore, {
    id: 'appSettings',
    phalaTeeApiUrl: `https://${process.env.APP_PHALA_URL}/tee-api/`
  })

  // do reactions here
  reaction(
    () => store.language,
    (language) => {
      if (!language) { return }
      i18n.changeLanguage(language)
    },
    {
      fireImmediately: true
    }
  )

  return store
}
