import { types } from 'mobx-state-tree'
import { createPersistStore } from '@/store/store'
import SettingsStore from '@/store/settings'

export const createWalletStore = (defaultValue = {}, options = {}) => {
  const WalletStore = types
    .model('WalletStore', {
      accountId: types.optional(types.string, ''),
      showInvalidAssets: types.optional(types.boolean, true)
    })
    .views(self => ({
      get runtimeEndpointUrl () {
        return self.appSettings.phalaTeeApiUrl
      },
      get appSettings () {
        return defaultValue.appSettings
      }
    }))
    .actions(self => ({
      setAccount (accountId) {
        if (!accountId?.length) {
          return
        }
        self.accountId = accountId
      },
      unsetAccount () {
        self.accountId = ''
      },
      toggleShowInvalidAssets () {
        self.showInvalidAssets = !self.showInvalidAssets
      }
    }))

  return createPersistStore('wallet', WalletStore, defaultValue)
}

